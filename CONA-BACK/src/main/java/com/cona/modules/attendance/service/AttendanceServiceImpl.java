package com.cona.modules.attendance.service;

import com.cona.exception.types.BusinessException;
import com.cona.modules.attendance.controller.dto.AttendanceResponseDto;
import com.cona.modules.attendance.controller.dto.AttendanceStatsDto;
import com.cona.modules.attendance.controller.dto.CheckInOutRequestDto;
import com.cona.modules.attendance.entity.Attendance;
import com.cona.modules.attendance.enums.AttendanceStatus;
import com.cona.modules.attendance.repository.AttendanceRepository;
import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.leaves.entity.Leave;
import com.cona.modules.leaves.repository.LeaveRepository;
import com.cona.modules.system_config.entity.Holiday;
import com.cona.modules.system_config.entity.WorkSchedule;
import com.cona.modules.system_config.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final HolidayRepository holidayRepository;
    private final LeaveRepository leaveRepository;

    @Override
    public AttendanceResponseDto processCheckInOut(CheckInOutRequestDto request) {
        Employee employee = employeeRepository.findByEmployeeKey(request.getEmployeeKey())
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado con clave: " + request.getEmployeeKey()));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        Optional<Attendance> existingAttendance = attendanceRepository.findByEmployeeAndDate(employee, today);

        if (existingAttendance.isPresent()) {
            // Check Out
            return processCheckOut(existingAttendance.get(), now);
        } else {
            // Check In
            return processCheckIn(employee, today, now);
        }
    }

    private AttendanceResponseDto processCheckIn(Employee employee, LocalDate date, LocalTime checkInTime) {
        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(date);
        attendance.setCheckInTime(checkInTime);
        
        // Determinar el status basado en el horario
        AttendanceStatus status = determineAttendanceStatus(employee, checkInTime);
        attendance.setStatus(status);

        attendance = attendanceRepository.save(attendance);
        log.info("Check-in registrado para empleado: {} a las {}", employee.getEmployeeKey(), checkInTime);

        return mapToResponseDto(attendance);
    }

    private AttendanceResponseDto processCheckOut(Attendance attendance, LocalTime checkOutTime) {
        attendance.setCheckOutTime(checkOutTime);
        
        // Calcular horas trabajadas
        if (attendance.getCheckInTime() != null) {
            Duration duration = Duration.between(attendance.getCheckInTime(), checkOutTime);
            double hoursWorked = duration.toMinutes() / 60.0;
            attendance.setHoursWorked(hoursWorked);
            
            // Calcular salario diario
            BigDecimal dailySalary = calculateDailySalary(attendance);
            attendance.setDailySalary(dailySalary);
        }

        attendance = attendanceRepository.save(attendance);
        log.info("Check-out registrado para empleado: {} a las {}", 
                attendance.getEmployee().getEmployeeKey(), checkOutTime);

        return mapToResponseDto(attendance);
    }

    private AttendanceStatus determineAttendanceStatus(Employee employee, LocalTime checkInTime) {
        WorkSchedule workSchedule = employee.getWorkSchedule();
        if (workSchedule == null) {
            return AttendanceStatus.PRESENT; // Default si no hay horario definido
        }

        LocalTime scheduledStart = workSchedule.getStartTime();
        Integer toleranceMinutes = workSchedule.getToleranceMinutes() != null ? 
                                 workSchedule.getToleranceMinutes() : 0;
        
        LocalTime lateThreshold = scheduledStart.plusMinutes(toleranceMinutes);
        
        if (checkInTime.isAfter(lateThreshold)) {
            return AttendanceStatus.LATE;
        } else {
            return AttendanceStatus.PRESENT;
        }
    }

    private BigDecimal calculateDailySalary(Attendance attendance) {
        Employee employee = attendance.getEmployee();
        LocalDate date = attendance.getDate();
        
        if (attendance.getHoursWorked() == null || employee.getHourlyRate() == null) {
            return BigDecimal.ZERO;
        }

        // Solo contar horas enteras para el pago
        int hoursForPayment = (int) Math.floor(attendance.getHoursWorked());
        BigDecimal baseSalary = employee.getHourlyRate()
                .multiply(BigDecimal.valueOf(hoursForPayment));

        // Verificar si es día festivo (pago x2)
        Optional<Holiday> holiday = holidayRepository.findByDate(date);
        if (holiday.isPresent()) {
            return baseSalary.multiply(BigDecimal.valueOf(2));
        }

        // Verificar si está en vacaciones (pago x3)
        Optional<Leaeve> vacationLeave = leaveRepository.findByEmployeeAndDateBetweenStartAndEndDate(
                employee, date);
        if (vacationLeave.isPresent()) {
            return baseSalary.multiply(BigDecimal.valueOf(3));
        }

        return baseSalary;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getEmployeeAttendance(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado con ID: " + employeeId));
        
        List<Attendance> attendances = attendanceRepository.findByEmployeeOrderByDateDesc(employee);
        return attendances.stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getEmployeeAttendanceByDateRange(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado con ID: " + employeeId));
        
        List<Attendance> attendances = attendanceRepository.findByEmployeeAndDateBetweenOrderByDateDesc(
                employee, startDate, endDate);
        return attendances.stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceStatsDto getEmployeeAttendanceStats(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado con ID: " + employeeId));

        long presentDays = attendanceRepository.countPresentDaysByEmployeeAndDateRange(employee, startDate, endDate);
        long lateDays = attendanceRepository.countLateDaysByEmployeeAndDateRange(employee, startDate, endDate);
        long absentDays = attendanceRepository.countAbsentDaysByEmployeeAndDateRange(employee, startDate, endDate);
        long totalDays = presentDays + lateDays + absentDays;

        return new AttendanceStatsDto(totalDays, presentDays, lateDays, absentDays);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> getTodayAttendance() {
        LocalDate today = LocalDate.now();
        List<Attendance> attendances = attendanceRepository.findByDateOrderByCreatedAtDesc(today);
        return attendances.stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    private AttendanceResponseDto mapToResponseDto(Attendance attendance) {
        AttendanceResponseDto dto = new AttendanceResponseDto();
        dto.setId(attendance.getId());
        dto.setEmployeeId(attendance.getEmployee().getId());
        dto.setEmployeeName(attendance.getEmployee().getFullName());
        dto.setEmployeeKey(attendance.getEmployee().getEmployeeKey());
        dto.setDate(attendance.getDate());
        dto.setCheckInTime(attendance.getCheckInTime());
        dto.setCheckOutTime(attendance.getCheckOutTime());
        dto.setHoursWorked(attendance.getHoursWorked());
        dto.setDailySalary(attendance.getDailySalary());
        dto.setStatus(attendance.getStatus());
        dto.setComments(attendance.getComments());
        return dto;
    }
}