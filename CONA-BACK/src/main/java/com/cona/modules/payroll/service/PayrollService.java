package com.cona.modules.payroll.service;

import com.cona.exception.types.BusinessException;
import com.cona.modules.attendance.entity.Attendance;
import com.cona.modules.attendance.enums.AttendanceStatus;
import com.cona.modules.attendance.repository.AttendanceRepository;
import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.leaves.entity.LeaveRequest;
import com.cona.modules.leaves.enums.LeaveStatus;
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
import java.time.LocalTime;
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
            .orElseGet(() -> {
                // Crear configuración por defecto si no existe
                PayrollConfig def = new PayrollConfig();
                def.setLatePenalty(new BigDecimal("0.00"));
                def.setBonusAmount(new BigDecimal("0.00"));
                def.setIsrFixed(new BigDecimal("0.00"));
                def.setImssFixed(new BigDecimal("0.00"));
                return payrollConfigRepository.save(def);
            });

        // ASEGURAR que todos los días tengan registro ANTES de consultar
        ensureAllDaysHaveAttendanceForEmployee(employee, periodStart, periodEnd);

        // Obtener todas las asistencias del empleado en el período (últimos 15 días)
        List<Attendance> attendances = attendanceRepository
                .findByEmployeeIdAndDateBetweenOrderByDateDesc(employeeId, periodStart, periodEnd);

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

    private PayrollCalculation calculatePayrollDetails(List<Attendance> attendances, Employee employee, PayrollConfig config) {
        PayrollCalculation calc = new PayrollCalculation();
        
        log.info("Calculating payroll for {} attendances", attendances.size());
        // Si no hay asistencias en el periodo, marcar como no elegible para bono
        if (attendances.isEmpty()) {
            calc.hasBonusPenalties = true;
        }
        
        for (Attendance attendance : attendances) {

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
                    calc.hasBonusPenalties = true; // Si quieres que afecte el bono
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
        
        // Regla 1: Si la nómina/base es 0, no hay bonos ni descuentos
        if (calc.baseSalary.compareTo(BigDecimal.ZERO) == 0) {
            log.info("Base salary is 0; setting bonus and deductions to 0");
            calc.bonus = BigDecimal.ZERO;
            calc.isrDeduction = BigDecimal.ZERO;
            calc.imssDeduction = BigDecimal.ZERO;
            calc.totalDeductions = BigDecimal.ZERO;
            calc.totalSalary = BigDecimal.ZERO;
            // También marcar como no elegible para bono en este periodo
            calc.hasBonusPenalties = true;
        } else {
            // Calcular bono solo si no hay faltas, rechazos o retardos
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
        }
        
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
        LocalDate effectiveStart = employee.getContractStartDate() != null && startDate.isBefore(employee.getContractStartDate())
                ? employee.getContractStartDate() : startDate;
        LocalDate currentDate = effectiveStart;
        while (!currentDate.isAfter(endDate)) {
            // Saltar domingos
            if (currentDate.getDayOfWeek().getValue() != 7) {
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
        WorkSchedule workSchedule = employee.getWorkSchedule();

        if(LocalTime.now().isBefore(workSchedule.getStartTime())){
            return;
        }

        // Crear registro con validación de festivo/día no laboral
        Attendance record = new Attendance();
        record.setEmployee(employee);
        record.setDate(date);
        Optional<Holiday> holidayOpt = holidayRepository.findByDate(date);
        Optional<LeaveRequest> leaveOpt = leaveRequestRepository
                .findActiveLeaveOnDate(employee.getId(), LeaveStatus.APPROVED, date);
        if (holidayOpt.isPresent()) {
            record.setStatus(AttendanceStatus.HOLIDAY);
            record.setDailySalary(BigDecimal.ZERO);
        } else if (leaveOpt.isPresent()) {
                double dailyHours = workSchedule.getTotalHoursPerDay().doubleValue();
                BigDecimal vacationPay = employee.getHourlyRate()
                        .multiply(BigDecimal.valueOf(dailyHours))
                        .multiply(BigDecimal.valueOf(3)); // x3 para vacaciones

                record.setDailySalary(vacationPay);
                record.setHoursWorked(dailyHours);
                record.setStatus(AttendanceStatus.VACATION);
        } else if (date.getDayOfWeek().getValue() == 7) {
            record.setStatus(AttendanceStatus.NON_WORKING_DAY);
            record.setDailySalary(BigDecimal.ZERO);
        } else {
            record.setStatus(AttendanceStatus.ABSENT);
            record.setHoursWorked(0.0);
            record.setDailySalary(BigDecimal.ZERO);
        }
        attendanceRepository.save(record);
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

