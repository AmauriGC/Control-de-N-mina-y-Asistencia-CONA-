package com.cona.modules.dashboard.service;

import com.cona.modules.attendance.entity.Attendance;
import com.cona.modules.attendance.repository.AttendanceRepository;
import com.cona.modules.dashboard.dto.*;
import com.cona.modules.employees.enums.EmployeeStatus;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.justifications.repository.JustificationRepository;
import com.cona.modules.payroll.repository.PayrollRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final JustificationRepository justificationRepository;
    private final PayrollRepository payrollRepository;

    // --- 1. PRESENTES HOY + EMPLEADOS ACTIVOS ---
    public TodayCountsDTO getTodayCounts() {
        LocalDate today = LocalDate.now();

        long present = attendanceRepository.countPresentByDate(today);
        long active = employeeRepository.countByStatus(EmployeeStatus.ACTIVE);

        return new TodayCountsDTO(present, active);
    }


    // --- 2. JUSTIFICACIONES PENDIENTES ---
    public List<PendingJustificationDTO> getPendingJustifications() {
        LocalDate today = LocalDate.now();

        return justificationRepository.findPendingJustifications()
                .stream()
                .map(j -> new PendingJustificationDTO(
                        j.getId(),
                        j.getEmployee().getFullName(),
                        j.getDate(),
                        j.getDate().toEpochDay() - today.toEpochDay()
                ))
                .toList();
    }


    // --- 3. CONTRATOS POR VENCER ---
    public List<ContractAlertDTO> getContractAlerts() {
        LocalDate today = LocalDate.now();
        LocalDate limit = today.plusDays(30);

        return employeeRepository.findContractsExpiringSoon(limit)
                .stream()
                .map(e -> {
                    long daysLeft = ChronoUnit.DAYS.between(today, e.getContractEndDate());
                    String priority = daysLeft <= 15 ? "high" : "normal";

                    return new ContractAlertDTO(
                            e.getId(),
                            e.getFullName(),
                            e.getContractEndDate(),
                            daysLeft,
                            priority
                    );
                })
                .toList();
    }


    // --- 4. TOTAL DE NÓMINA SEMANAL ---
    public Double getCurrentWeekPayrollTotal() {

        LocalDate today = LocalDate.now();

        // Calcular inicio y fin de semana (lunes a domingo)
        LocalDate weekStart = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate weekEnd = today.with(java.time.DayOfWeek.SUNDAY);

        // Llamar al query del repositorio
        Double total = payrollRepository.getWeeklyTotalPayroll(weekStart, weekEnd);

        return total != null ? total : 0.0;
    }


    public WeeklyPayrollDTO getWeeklyPayrollForDashboard() {

        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate weekEnd = today.with(java.time.DayOfWeek.SUNDAY);

        Double total = payrollRepository.getWeeklyTotalPayroll(weekStart, weekEnd);

        return new WeeklyPayrollDTO(
                weekStart,
                weekEnd,
                total != null ? total : 0.0
        );
    }

    public List<WeeklyAttendanceDTO> getWeeklyAttendance() {
        // Calcular inicio y fin de la semana actual
        LocalDate start = LocalDate.now().with(DayOfWeek.MONDAY);
        LocalDate end = LocalDate.now().with(DayOfWeek.SUNDAY);

        // Consultar los datos
        List<Object[]> raw = attendanceRepository.getWeeklyAttendanceRaw(start, end);

        // Crear mapa de fecha -> DTO
        Map<LocalDate, WeeklyAttendanceDTO> map = new HashMap<>();
        for (Object[] r : raw) {
            LocalDate date = (LocalDate) r[0];
            int present = ((Number) r[1]).intValue();
            int late = ((Number) r[2]).intValue();
            int absent = ((Number) r[3]).intValue();

            map.put(date, new WeeklyAttendanceDTO(
                    date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("es")),
                    present, late, absent
            ));
        }

        // Generar lista de todos los días de la semana (llenar con 0s si no hay datos)
        List<WeeklyAttendanceDTO> result = new ArrayList<>();
        LocalDate current = start;
        while (!current.isAfter(end)) {
            WeeklyAttendanceDTO dto = map.getOrDefault(current,
                    new WeeklyAttendanceDTO(
                            current.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.forLanguageTag("es")),
                            0, 0, 0
                    ));
            result.add(dto);
            current = current.plusDays(1);
        }

        return result;
    }


    public List<WeeklyOvertimeDTO> getMonthlyOvertime() {
        LocalDate today = LocalDate.now();
        LocalDate startMonth = today.withDayOfMonth(1);
        LocalDate endMonth = today.withDayOfMonth(today.lengthOfMonth());

        List<Attendance> attendances = attendanceRepository.findByDateBetween(startMonth, endMonth);

        Map<Integer, Integer> weekHoursMap = new HashMap<>();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());

        for (Attendance a : attendances) {
            if (a.getHoursWorked() != null) {
                int weekNumber = a.getDate().get(weekFields.weekOfMonth());
                int overtime = (int) Math.max(0, a.getHoursWorked() - 8);
                weekHoursMap.put(weekNumber, weekHoursMap.getOrDefault(weekNumber, 0) + overtime);
            }
        }

        int weeksInMonth = endMonth.get(weekFields.weekOfMonth());

        List<WeeklyOvertimeDTO> result = new ArrayList<>();
        for (int i = 1; i <= weeksInMonth; i++) {
            result.add(new WeeklyOvertimeDTO("Sem " + i, weekHoursMap.getOrDefault(i, 0)));
        }

        return result;
    }


}
