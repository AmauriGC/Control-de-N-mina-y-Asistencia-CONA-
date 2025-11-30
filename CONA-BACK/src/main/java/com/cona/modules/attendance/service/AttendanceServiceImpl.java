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
import com.cona.modules.employees.enums.EmployeeStatus;
import com.cona.modules.leaves.entity.Leave;
import com.cona.modules.leaves.repository.LeaveRepository;
import com.cona.modules.system_config.entity.Holiday;
import com.cona.modules.system_config.entity.PayrollConfig;
import com.cona.modules.system_config.entity.WorkSchedule;
import com.cona.modules.system_config.repository.HolidayRepository;
import com.cona.modules.attendance.controller.dto.TodayAttendanceCountsDto;
import com.cona.modules.leaves.enums.LeaveType;
import com.cona.modules.system_config.repository.PayrollConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    private final PayrollConfigRepository payrollConfigRepository;

    @Override
    public AttendanceResponseDto processCheckInOut(CheckInOutRequestDto request) {
        Employee employee = employeeRepository.findByEmployeeKey(request.getEmployeeKey())
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado con clave: " + request.getEmployeeKey()));

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Attendance> existingAttendanceList = attendanceRepository.findByEmployeeAndDate(employee, today);

        if (!existingAttendanceList.isEmpty()) {
            Attendance todayAttendance = existingAttendanceList.get(0);
            if (todayAttendance.getCheckInTime() != null && todayAttendance.getCheckOutTime() != null) {
                log.info("Intento adicional de registro: empleado {} ya completó entrada y salida hoy", employee.getEmployeeKey());
                throw new BusinessException(
                        "ATTENDANCE_ALREADY_COMPLETED",
                        "Ya ha completado su registro del día"
                );
            }
            return processCheckOut(todayAttendance, now);
        } else {
            return processCheckIn(employee, today, now);
        }
    }

    private AttendanceResponseDto processCheckIn(Employee employee, LocalDate date, LocalTime checkInTime) {
        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(date);
        attendance.setCheckInTime(checkInTime);
        
        AttendanceStatus status = determineAttendanceStatus(employee, checkInTime);
        attendance.setStatus(status);

        attendance = attendanceRepository.save(attendance);
        log.info("Check-in registrado para empleado: {} a las {}", employee.getEmployeeKey(), checkInTime);

        return mapToResponseDto(attendance);
    }

    private AttendanceResponseDto processCheckOut(Attendance attendance, LocalTime checkOutTime) {
        attendance.setCheckOutTime(checkOutTime);
        
        Employee employee = attendance.getEmployee();
        WorkSchedule workSchedule = employee.getWorkSchedule();
        if (workSchedule != null && checkOutTime.isBefore(workSchedule.getEndTime())) {
            attendance.setStatus(AttendanceStatus.ABSENT);
            attendance.setHoursWorked(0.0);
            attendance.setDailySalary(BigDecimal.ZERO);
            attendance.setComments("Salida antes del horario programado - Falta");
        } else {
            if (attendance.getCheckInTime() != null) {
                Duration duration = Duration.between(attendance.getCheckInTime(), checkOutTime);
                double hoursWorked = (double) duration.toHours(); // Solo horas completas
                attendance.setHoursWorked(hoursWorked);
                BigDecimal dailySalary = calculateDailySalary(attendance);
                attendance.setDailySalary(dailySalary);
            }
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
            return AttendanceStatus.ABSENT;
        } else if (checkInTime.isAfter(scheduledStart)) {
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

        int hoursForPayment = (int) Math.floor(attendance.getHoursWorked());
        BigDecimal baseSalary = employee.getHourlyRate()
                .multiply(BigDecimal.valueOf(hoursForPayment));

        Optional<Holiday> holiday = holidayRepository.findByDate(date);
        if (holiday.isPresent()) {
            return baseSalary.multiply(BigDecimal.valueOf(3));
        }

        Optional<Leave> vacationLeave = leaveRepository.findByEmployeeAndDateBetweenStartAndEndDate(
                employee, date);
        if (vacationLeave.isPresent()) {
            return baseSalary.multiply(BigDecimal.valueOf(3));
        }

        if (attendance.getStatus() == AttendanceStatus.LATE) {
            Optional<PayrollConfig> configOpt = payrollConfigRepository.findByIsActiveTrue();
            if (configOpt.isPresent()) {
                PayrollConfig config = configOpt.get();
                BigDecimal penalty = config.getLatePenalty();
                if (penalty != null && penalty.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal finalSalary = baseSalary.subtract(penalty);
                    return finalSalary.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : finalSalary;
                }
            }
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
    @Transactional
    public Page<AttendanceResponseDto> getEmployeeAttendancePaginated(Long employeeId, int page, int size) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado con ID: " + employeeId));
        
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        ensureAttendanceRange(employee, startDate, endDate);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<Attendance> attendancePage = attendanceRepository.findByEmployee(employee, pageable);
        
        return attendancePage.map(this::mapToResponseDto);
    }

        @Override
        @Transactional
        public List<AttendanceResponseDto> getEmployeeAttendanceByDateRange(Long employeeId, LocalDate startDate, LocalDate endDate) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado con ID: " + employeeId));
        ensureAttendanceRange(employee, startDate, endDate);

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

    @Override
    @Transactional(readOnly = true)
    public TodayAttendanceCountsDto getTodayCounts() {
        long presentCount = getTodayAttendance().size();
        long activeEmployees = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);
        return new TodayAttendanceCountsDto(presentCount, activeEmployees);
    }

    private void ensureAttendanceRange(Employee employee, LocalDate startDate, LocalDate endDate) {
        LocalDate date = startDate;
        while (!date.isAfter(endDate)) {
            ensureAttendanceForDate(employee, date);
            date = date.plusDays(1);
        }
    }

    private Attendance ensureAttendanceForDate(Employee employee, LocalDate date) {
        List<Attendance> existing = attendanceRepository.findByEmployeeAndDate(employee, date);
        if (!existing.isEmpty()) return existing.get(0);

        Attendance newAttendance = new Attendance();
        newAttendance.setEmployee(employee);
        newAttendance.setDate(date);

        if (date.getDayOfWeek().getValue() == 7) {
            newAttendance.setStatus(AttendanceStatus.NON_WORKING_DAY);
            newAttendance.setDailySalary(BigDecimal.ZERO);
            newAttendance.setComments("Día no laboral - Domingo");
            return attendanceRepository.save(newAttendance);
        }

        Optional<Holiday> holiday = holidayRepository.findByDate(date);
        if (holiday.isPresent()) {
            newAttendance.setStatus(AttendanceStatus.HOLIDAY);
            newAttendance.setDailySalary(BigDecimal.ZERO);
            newAttendance.setComments("Día festivo - " + holiday.get().getName());
            return attendanceRepository.save(newAttendance);
        }

        Optional<Leave> approvedLeave = leaveRepository.findByEmployeeAndDateBetweenStartAndEndDate(employee, date);

        if (approvedLeave.isPresent()) {
            Leave leave = approvedLeave.get();
            if (leave.getLeaveRequest().getType() == LeaveType.VACATION) {
                newAttendance.setStatus(AttendanceStatus.VACATION);
                WorkSchedule ws = employee.getWorkSchedule();
                Integer hoursPerDay = ws != null && ws.getTotalHoursPerDay() != null ? ws.getTotalHoursPerDay() : 0;
                if (employee.getHourlyRate() != null && hoursPerDay > 0) {
                    BigDecimal dailySalary = employee.getHourlyRate()
                            .multiply(BigDecimal.valueOf(hoursPerDay))
                            .multiply(BigDecimal.valueOf(3));
                    newAttendance.setDailySalary(dailySalary);
                }
            } else {
                newAttendance.setStatus(AttendanceStatus.JUSTIFIED_ABSENCE);
                WorkSchedule ws = employee.getWorkSchedule();
                Integer hoursPerDay = ws != null && ws.getTotalHoursPerDay() != null ? ws.getTotalHoursPerDay() : 0;
                if (employee.getHourlyRate() != null && hoursPerDay > 0) {
                    BigDecimal dailySalary = employee.getHourlyRate()
                            .multiply(BigDecimal.valueOf(hoursPerDay))
                            .multiply(BigDecimal.valueOf(3));
                    newAttendance.setDailySalary(dailySalary);
                }
            }
            return attendanceRepository.save(newAttendance);
        }

        newAttendance.setStatus(AttendanceStatus.ABSENT);
        newAttendance.setDailySalary(BigDecimal.ZERO);
        return attendanceRepository.save(newAttendance);
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