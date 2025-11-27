package com.cona.modules.leaves.service.impl;

import com.cona.exception.types.BusinessException;
import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.leaves.controller.dto.LeaveRequestDto;
import com.cona.modules.leaves.controller.dto.LeaveRequestResponseDto;
import com.cona.modules.leaves.controller.dto.LeaveReviewDto;
import com.cona.modules.leaves.entity.Leave;
import com.cona.modules.leaves.entity.LeaveRequest;
import com.cona.modules.leaves.enums.LeaveStatus;
import com.cona.modules.leaves.enums.LeaveType;
import com.cona.modules.leaves.repository.LeaveRepository;
import com.cona.modules.leaves.repository.LeaveRequestRepository;
import com.cona.modules.leaves.service.LeaveRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeaveRequestServiceImpl implements LeaveRequestService {
    
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    
    private static final BigDecimal VACATION_MULTIPLIER = new BigDecimal("3");
    
    @Override
    public LeaveRequestResponseDto createRequest(LeaveRequestDto dto, Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado"));
        
        validateLeaveRequest(dto, employee);
        
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setStartDate(dto.getStartDate());
        leaveRequest.setEndDate(dto.getEndDate());
        leaveRequest.setType(dto.getType());
        leaveRequest.setReason(dto.getReason());
        leaveRequest.setStatus(LeaveStatus.PENDING);
        
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        return mapToResponseDto(saved);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<LeaveRequestResponseDto> getAllRequests(int page, int size, String status, String employeeName) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        LeaveStatus leaveStatus = status != null && !status.equals("all") ? LeaveStatus.valueOf(status.toUpperCase()) : null;
        
        Page<LeaveRequest> requests = leaveRequestRepository.findByFilters(leaveStatus, employeeName, pageable);
        return requests.map(this::mapToResponseDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDto> getEmployeeRequests(Long userId) {
        Employee employee = employeeRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado"));
        
        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId());
        return requests.stream().map(this::mapToResponseDto).collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public LeaveRequestResponseDto getById(Long id) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessException("LEAVE_REQUEST_NOT_FOUND", "Solicitud no encontrada"));
        return mapToResponseDto(request);
    }
    
    @Override
    public void reviewRequest(Long requestId, LeaveReviewDto reviewDto, Long reviewerId) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException("LEAVE_REQUEST_NOT_FOUND", "Solicitud no encontrada"));
        
        if (request.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("INVALID_STATUS", "La solicitud ya fue procesada anteriormente");
        }
        
        // Update leave request status
        LeaveStatus newStatus = reviewDto.getApproved() ? LeaveStatus.APPROVED : LeaveStatus.REJECTED;
        request.setStatus(newStatus);
        leaveRequestRepository.save(request);
        
        // Create Leave record for the decision
        Leave leave = new Leave();
        leave.setLeaveRequest(request);
        leave.setEmployee(request.getEmployee());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setType(request.getType());
        leave.setApprovedBy(reviewerId);
        leave.setAdminComments(reviewDto.getComments());
        leave.setApprovedAt(LocalDateTime.now());
        
        leaveRepository.save(leave);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countPendingRequests() {
        return leaveRequestRepository.countByStatus(LeaveStatus.PENDING);
    }
    
    private void validateLeaveRequest(LeaveRequestDto dto, Employee employee) {
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new BusinessException("INVALID_DATE_RANGE", "La fecha de inicio debe ser anterior a la fecha de fin");
        }
        
        if (dto.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new BusinessException("PAST_DATE", "No se pueden solicitar permisos para fechas pasadas");
        }
        
        // Additional validation logic can be added here
        // For example, checking available vacation days, overlapping requests, etc.
    }
    
    private LeaveRequestResponseDto mapToResponseDto(LeaveRequest request) {
        LeaveRequestResponseDto dto = new LeaveRequestResponseDto();
        dto.setId(request.getId());
        dto.setEmployeeId(request.getEmployee().getId());
        dto.setEmployeeName(request.getEmployee().getFullName());
        dto.setEmployeeKey(request.getEmployee().getEmployeeKey());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setType(request.getType());
        dto.setStatus(request.getStatus());
        dto.setReason(request.getReason());
        dto.setRequestedAt(request.getCreatedAt());
        
        // Calculate total days
        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        dto.setTotalDays((int) days);
        
        // Calcular pago vacacional según fórmula: (horas/día * salario/hora) * 3 * días
        if (request.getType() == LeaveType.VACATION) {
            BigDecimal vacationPay = calculateVacationPay(request.getEmployee(), dto.getTotalDays());
            dto.setVacationPay(vacationPay);
        }
        
        // Get review comments if exists
        leaveRepository.findByLeaveRequestId(request.getId())
                .ifPresent(leave -> dto.setReviewComments(leave.getAdminComments()));
        
        return dto;
    }
    
    private BigDecimal calculateVacationPay(Employee employee, int totalDays) {
        if (employee.getHourlyRate() == null || employee.getWorkSchedule() == null) {
            return BigDecimal.ZERO;
        }

        Integer hoursPerDay = employee.getWorkSchedule().getTotalHoursPerDay();
        if (hoursPerDay == null || hoursPerDay <= 0) {
            // Fallback si aún no está calculado: calcular con start/end
            hoursPerDay = (int) Duration.between(employee.getWorkSchedule().getStartTime(), employee.getWorkSchedule().getEndTime()).toHours();
            if (hoursPerDay < 0) hoursPerDay = 0;
        }

        BigDecimal dailySalary = employee.getHourlyRate().multiply(BigDecimal.valueOf(hoursPerDay));
        BigDecimal vacationDailySalary = dailySalary.multiply(VACATION_MULTIPLIER);
        return vacationDailySalary.multiply(BigDecimal.valueOf(totalDays));
    }
}