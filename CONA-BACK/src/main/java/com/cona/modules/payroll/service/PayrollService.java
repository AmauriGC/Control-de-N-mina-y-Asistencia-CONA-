package com.cona.modules.payroll.service;

import com.cona.exception.types.BusinessException;
import com.cona.kernel.utils.Sanitizer;
import com.cona.modules.attendance.entity.Attendance;
import com.cona.modules.attendance.enums.AttendanceStatus;
import com.cona.modules.attendance.repository.AttendanceRepository;
import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.leaves.entity.Leave;
import com.cona.modules.leaves.entity.LeaveRequest;
import com.cona.modules.leaves.enums.LeaveStatus;
import com.cona.modules.leaves.enums.LeaveType;
import com.cona.modules.leaves.repository.LeaveRepository;
import com.cona.modules.leaves.repository.LeaveRequestRepository;
import com.cona.modules.system_config.entity.Holiday;
import com.cona.modules.system_config.repository.HolidayRepository;
import com.cona.modules.payroll.dto.PayrollDetailDto;
import com.cona.modules.payroll.entity.Payroll;
import com.cona.modules.payroll.enums.PayrollStatus;
import com.cona.modules.payroll.repository.PayrollRepository;
import com.cona.modules.system_config.entity.PayrollConfig;
import com.cona.modules.system_config.entity.WorkSchedule;
import com.cona.modules.system_config.repository.PayrollConfigRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {
    
    private static final Logger log = LoggerFactory.getLogger(PayrollService.class);
    
    private final PayrollRepository payrollRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveRepository leaveRepository;
    private final HolidayRepository holidayRepository;
    private final PayrollConfigRepository payrollConfigRepository;

    @Transactional
    public Payroll calculatePayroll(Long employeeId, LocalDate periodStart, LocalDate periodEnd) {
        if (periodStart == null || periodEnd == null || periodEnd.isBefore(periodStart)) {
            throw new BusinessException("INVALID_PERIOD", "El periodo es inválido");
        }
        if (java.time.temporal.ChronoUnit.DAYS.between(periodStart, periodEnd) + 1 > 31) {
            throw new BusinessException("INVALID_PERIOD_LENGTH", "El periodo no debe exceder 31 días");
        }
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado"));

        PayrollConfig config = payrollConfigRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new BusinessException("PAYROLL_CONFIG_NOT_FOUND", "Configuración de nómina no encontrada"));

        // ASEGURAR que todos los días tengan registro ANTES de consultar
        ensureAllDaysHaveAttendanceForEmployee(employee, periodStart, periodEnd);

        // ASEGURAR que todos los días tengan registro ANTES de consultar
        ensureAllDaysHaveAttendanceForEmployee(employee, periodStart, periodEnd);

        // Obtener todas las asistencias del empleado en el período (últimos 15 días)
        List<Attendance> attendances = attendanceRepository
                .findByEmployeeIdAndDateBetweenOrderByDateDesc(employeeId, periodStart, periodEnd);
        
        log.info("Found {} attendances for employee {} between {} and {}", 
                attendances.size(), employeeId, periodStart, periodEnd);

        // Crear registros de falta para días sin asistencia registrada (método legacy)
        attendances = ensureAllDaysHaveAttendance(employeeId, periodStart, periodEnd, attendances);

        // Procesar asistencias y actualizar estados según vacaciones aprobadas
        processAttendancesWithVacations(attendances, employee);

        // Calcular los diferentes tipos de días y salarios
        PayrollCalculation calculation = calculatePayrollDetails(attendances, employee, config);

        // Crear o actualizar el registro de nómina (tolerante a duplicados)
        List<Payroll> existingPayrolls = payrollRepository
            .findAllByEmployeeIdAndPeriod(employeeId, periodStart, periodEnd);

        Payroll payroll;
        if (existingPayrolls.isEmpty()) {
            payroll = Payroll.builder()
                .employee(employee)
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .status(PayrollStatus.DRAFT)
                .build();
        } else {
            // Usar el primero y registrar si hay duplicados
            payroll = existingPayrolls.get(0);
            if (existingPayrolls.size() > 1) {
            log.warn("Detected {} duplicate payrolls for employee {} period {} - {}. Using the first one.",
                existingPayrolls.size(), employeeId, periodStart, periodEnd);
            }
        }

        // Asignar valores calculados
        payroll.setNormalDaysWorked(calculation.normalDaysWorked);
        payroll.setNormalDaysSalary(calculation.normalDaysSalary);
        payroll.setVacationDays(calculation.vacationDays);
        payroll.setVacationDaysSalary(calculation.vacationDaysSalary);
        payroll.setAbsentDays(calculation.absentDays);
        payroll.setAbsentDaysSalary(calculation.absentDaysSalary);
        payroll.setLateDays(calculation.lateDays);
        payroll.setLateDaysSalary(calculation.lateDaysSalary);
        payroll.setLatePenaltyDeduction(calculation.latePenaltyDeduction);
        payroll.setBaseSalary(calculation.baseSalary);
        payroll.setBonus(calculation.bonus);
        payroll.setIsrDeduction(calculation.isrDeduction);
        payroll.setImssDeduction(calculation.imssDeduction);
        payroll.setTotalDeductions(calculation.totalDeductions);
        payroll.setTotalSalary(calculation.totalSalary);
        payroll.setHasBonusPenalties(calculation.hasBonusPenalties);

        // Campos de compatibilidad
        payroll.setDeductions(calculation.totalDeductions);
        payroll.setNetSalary(calculation.totalSalary);
        payroll.setBonuses(calculation.bonus);

        return payrollRepository.save(payroll);
    }

    private void processAttendancesWithVacations(List<Attendance> attendances, Employee employee) {
        for (Attendance attendance : attendances) {
            if (attendance.getStatus() == AttendanceStatus.ABSENT) {
                // Verificar si hay una solicitud de vacaciones aprobada para esta fecha
                List<LeaveRequest> approvedVacations = leaveRequestRepository
                        .findByEmployeeIdAndDateAndStatus(
                                employee.getId(),
                                attendance.getDate(),
                                LeaveStatus.APPROVED
                        );

                if (!approvedVacations.isEmpty()) {
                    // Cambiar el estado a VACATION y calcular el pago x3
                    attendance.setStatus(AttendanceStatus.VACATION);
                    
                    WorkSchedule workSchedule = employee.getWorkSchedule();
                    if (workSchedule != null && workSchedule.getTotalHoursPerDay() != null) {
                        double dailyHours = workSchedule.getTotalHoursPerDay().doubleValue();
                        BigDecimal vacationPay = employee.getHourlyRate()
                                .multiply(BigDecimal.valueOf(dailyHours))
                                .multiply(BigDecimal.valueOf(3)); // x3 para vacaciones
                        
                        attendance.setDailySalary(vacationPay);
                        attendance.setHoursWorked(dailyHours);
                    }
                    
                    // Guardar la asistencia actualizada
                    attendanceRepository.save(attendance);
                    
                    log.info("Updated attendance {} to VACATION status with x3 pay", attendance.getId());
                }
            }
        }
    }

    private PayrollCalculation calculatePayrollDetails(List<Attendance> attendances, Employee employee, PayrollConfig config) {
        PayrollCalculation calc = new PayrollCalculation();
        
        log.info("Calculating payroll for {} attendances", attendances.size());
        
        for (Attendance attendance : attendances) {
            log.info("Processing attendance for date {} with status {}", attendance.getDate(), attendance.getStatus());
            
            switch (attendance.getStatus()) {
                case PRESENT:
                    calc.normalDaysWorked++;
                    if (attendance.getDailySalary() != null) {
                        calc.normalDaysSalary = calc.normalDaysSalary.add(attendance.getDailySalary());
                        log.info("Added daily salary from attendance: {}", attendance.getDailySalary());
                    } else {
                        // Calcular salario diario si no está establecido
                        BigDecimal dailySalary = calculateDailySalary(attendance, employee);
                        calc.normalDaysSalary = calc.normalDaysSalary.add(dailySalary);
                        log.info("Calculated and added daily salary: {}", dailySalary);
                    }
                    break;
                    
                case VACATION:
                    calc.vacationDays++;
                    if (attendance.getDailySalary() != null) {
                        calc.vacationDaysSalary = calc.vacationDaysSalary.add(attendance.getDailySalary());
                    }
                    break;
                    
                case ABSENT:
                    calc.absentDays++;
                    calc.hasBonusPenalties = true;
                    log.info("Found ABSENT day: {}", attendance.getDate());
                    // Las faltas no generan salario
                    break;
                    
                case JUSTIFICATION_REJECTED:
                    calc.absentDays++;
                    calc.hasBonusPenalties = true;
                    log.info("Found JUSTIFICATION_REJECTED day: {}", attendance.getDate());
                    // Las faltas no generan salario
                    break;
                    
                case LATE:
                    calc.lateDays++;
                    calc.hasBonusPenalties = true;
                    log.info("Found LATE day: {}", attendance.getDate());
                    
                    // Para días con retardo, aplicar descuento directamente al salario del día
                    BigDecimal dailySalary;
                    if (attendance.getDailySalary() != null) {
                        dailySalary = attendance.getDailySalary();
                    } else {
                        dailySalary = calculateDailySalary(attendance, employee);
                    }
                    
                    // Aplicar descuento por retardo directamente al salario del día
                    BigDecimal penalty = config.getLatePenalty();
                    BigDecimal salaryAfterPenalty = dailySalary.subtract(penalty);
                    calc.lateDaysSalary = calc.lateDaysSalary.add(salaryAfterPenalty);
                    
                    // Registrar el total de penalizaciones aplicadas (para mostrar en el DTO)
                    calc.latePenaltyDeduction = calc.latePenaltyDeduction.add(penalty);
                    
                    log.info("Late day salary: {} - penalty: {} = {}", dailySalary, penalty, salaryAfterPenalty);
                    break;
                    
                case JUSTIFIED_ABSENCE:
                    // Las ausencias justificadas con permisos aprobados pagan x3
                    if (attendance.getDailySalary() != null) {
                        calc.normalDaysSalary = calc.normalDaysSalary.add(attendance.getDailySalary());
                    }
                    log.info("Found JUSTIFIED_ABSENCE day: {}", attendance.getDate());
                    break;
                    
                case NON_WORKING_DAY:
                case HOLIDAY:
                    // Días no laborales y festivos no afectan cálculos
                    log.info("Found NON_WORKING_DAY/HOLIDAY: {}", attendance.getDate());
                    break;
            }
        }
        
        log.info("Final calculation - Normal days: {}, Absent days: {}, Late days: {}, Vacation days: {}", 
                calc.normalDaysWorked, calc.absentDays, calc.lateDays, calc.vacationDays);
        log.info("Has bonus penalties: {}", calc.hasBonusPenalties);
        
        // Calcular salario base
        calc.baseSalary = calc.normalDaysSalary
                .add(calc.vacationDaysSalary)
                .add(calc.absentDaysSalary)
                .add(calc.lateDaysSalary);
        
        // Calcular bono
        if (!calc.hasBonusPenalties) {
            calc.bonus = config.getBonusAmount();
        }
        
        // Calcular salario bruto (base + bono)
        BigDecimal grossSalary = calc.baseSalary.add(calc.bonus);
        
        // Calcular descuentos ISR e IMSS (las penalizaciones por retardo ya se aplicaron directamente)
        calc.isrDeduction = config.getIsrFixed();
        calc.imssDeduction = config.getImssFixed();
        calc.totalDeductions = calc.isrDeduction.add(calc.imssDeduction);
        
        // Calcular salario neto (bruto - descuentos)
        calc.totalSalary = grossSalary.subtract(calc.totalDeductions);
        
        return calc;
    }

    private BigDecimal calculateDailySalary(Attendance attendance, Employee employee) {
        if (attendance.getHoursWorked() != null && attendance.getHoursWorked() > 0) {
            return employee.getHourlyRate()
                    .multiply(BigDecimal.valueOf(attendance.getHoursWorked()))
                    .setScale(2, RoundingMode.HALF_UP);
        } else if (employee.getWorkSchedule() != null && employee.getWorkSchedule().getTotalHoursPerDay() != null) {
            return employee.getHourlyRate()
                    .multiply(BigDecimal.valueOf(employee.getWorkSchedule().getTotalHoursPerDay()))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    private List<Attendance> ensureAllDaysHaveAttendance(Long employeeId, LocalDate periodStart, LocalDate periodEnd, List<Attendance> existingAttendances) {
        // Crear un mapa de fechas existentes, manteniendo solo el primer registro por fecha para evitar duplicados
        Map<LocalDate, Attendance> attendanceMap = existingAttendances.stream()
                .collect(Collectors.toMap(
                        Attendance::getDate, 
                        a -> a,
                        (existing, duplicate) -> existing // En caso de duplicado, mantener el existente
                ));
        
        log.info("Found {} unique dates in existing attendances", attendanceMap.size());
        
        // Generar todas las fechas del período
        List<LocalDate> allDates = periodStart.datesUntil(periodEnd.plusDays(1))
                .collect(Collectors.toList());
        
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado"));

        // Crear registros para todos los días (incluyendo domingos como no laborales)
        for (LocalDate date : allDates) {
            // Saltar solo sábados
            if (date.getDayOfWeek().getValue() == 6) {
                continue;
            }
            
            if (!attendanceMap.containsKey(date)) {
                log.info("Creating ABSENT record for missing date: {}", date);
                
                // Verificar si ya existe un registro para esta fecha en la base de datos
                List<Attendance> existingForDate = attendanceRepository
                        .findByEmployeeIdAndDate(employeeId, date);
                
                if (existingForDate.isEmpty()) {
                    Attendance absentRecord = new Attendance();
                    absentRecord.setEmployee(employee);
                    absentRecord.setDate(date);
                    absentRecord.setStatus(AttendanceStatus.ABSENT);
                    absentRecord.setHoursWorked(0.0);
                    absentRecord.setDailySalary(BigDecimal.ZERO);
                    absentRecord.setComments(Sanitizer.sanitizeComment("Falta generada automáticamente"));

                    // Guardar el registro
                    absentRecord = attendanceRepository.save(absentRecord);
                    attendanceMap.put(date, absentRecord);
                } else {
                    // Si ya existe, usar el primero
                    attendanceMap.put(date, existingForDate.get(0));
                }
            }
        }
        
        // Retornar la lista completa ordenada por fecha descendente
        return attendanceMap.values().stream()
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .collect(Collectors.toList());
    }

    public PayrollDetailDto getPayrollDetail(Long employeeId, LocalDate periodStart, LocalDate periodEnd) {
        List<Payroll> payrolls = payrollRepository.findAllByEmployeeIdAndPeriod(employeeId, periodStart, periodEnd);
        if (payrolls.isEmpty()) {
            throw new BusinessException("PAYROLL_NOT_FOUND", "No se encontró nómina para el periodo especificado");
        }
        if (payrolls.size() > 1) {
            log.warn("Detected {} duplicate payrolls for employee {} period {} - {}. Returning the first.",
                    payrolls.size(), employeeId, periodStart, periodEnd);
        }
        Payroll payroll = payrolls.get(0);

        Employee employee = payroll.getEmployee();

        return PayrollDetailDto.builder()
                .employeeId(employee.getId())
                .employeeName(employee.getFullName())
                .employeeKey(employee.getEmployeeKey())
                .periodStart(payroll.getPeriodStart())
                .periodEnd(payroll.getPeriodEnd())
                .normalDaysWorked(payroll.getNormalDaysWorked())
                .normalDaysSalary(payroll.getNormalDaysSalary())
                .vacationDays(payroll.getVacationDays())
                .vacationDaysSalary(payroll.getVacationDaysSalary())
                .absentDays(payroll.getAbsentDays())
                .absentDaysSalary(payroll.getAbsentDaysSalary())
                .lateDays(payroll.getLateDays())
                .lateDaysSalary(payroll.getLateDaysSalary())
                .latePenaltyDeduction(payroll.getLatePenaltyDeduction())
                .isrDeduction(payroll.getIsrDeduction())
                .imssDeduction(payroll.getImssDeduction())
                .totalDeductions(payroll.getTotalDeductions())
                .bonus(payroll.getBonus())
                .hasBonusPenalties(payroll.getHasBonusPenalties())
                .baseSalary(payroll.getBaseSalary())
                .totalSalary(payroll.getTotalSalary())
                .build();
    }

    public List<Payroll> getEmployeePayrolls(Long employeeId) {
        return payrollRepository.findByEmployeeId(employeeId);
    }


    private void ensureAllDaysHaveAttendanceForEmployee(Employee employee, LocalDate startDate, LocalDate endDate) {
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            // Saltar solo sábados
            if (currentDate.getDayOfWeek().getValue() != 6) {
                ensureAttendanceRecordExists(employee, currentDate);
            }
            currentDate = currentDate.plusDays(1);
        }
    }

    private void ensureAttendanceRecordExists(Employee employee, LocalDate date) {
        // Verificar si ya existe registro para esta fecha
        List<Attendance> existing = attendanceRepository.findByEmployeeAndDate(employee, date);
        if (!existing.isEmpty()) {
            return; // Ya existe, no hacer nada
        }
        // Crear registro ABSENT sanitizando comentario
        Attendance absentRecord = new Attendance();
        absentRecord.setEmployee(employee);
        absentRecord.setDate(date);
        absentRecord.setStatus(AttendanceStatus.ABSENT);
        absentRecord.setHoursWorked(0.0);
        absentRecord.setDailySalary(BigDecimal.ZERO);
        absentRecord.setComments(Sanitizer.sanitizeComment("Falta generada automáticamente"));
        attendanceRepository.save(absentRecord);
    }

    // Clase interna para cálculos
    private static class PayrollCalculation {
        Integer normalDaysWorked = 0;
        BigDecimal normalDaysSalary = BigDecimal.ZERO;
        Integer vacationDays = 0;
        BigDecimal vacationDaysSalary = BigDecimal.ZERO;
        Integer absentDays = 0;
        BigDecimal absentDaysSalary = BigDecimal.ZERO;
        Integer lateDays = 0;
        BigDecimal lateDaysSalary = BigDecimal.ZERO;
        BigDecimal latePenaltyDeduction = BigDecimal.ZERO;
        BigDecimal baseSalary = BigDecimal.ZERO;
        BigDecimal bonus = BigDecimal.ZERO;
        BigDecimal isrDeduction = BigDecimal.ZERO;
        BigDecimal imssDeduction = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        BigDecimal totalSalary = BigDecimal.ZERO;
        Boolean hasBonusPenalties = false;
    }
}

