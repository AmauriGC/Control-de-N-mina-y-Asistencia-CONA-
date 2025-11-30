package com.cona.modules.dashboard.controller;

import com.cona.modules.dashboard.dto.*;
import com.cona.modules.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/today")
    public TodayCountsDTO getTodayCounts() {
        return dashboardService.getTodayCounts();
    }

    @GetMapping("/justifications/pending")
    public List<PendingJustificationDTO> getPendingJustifications() {
        return dashboardService.getPendingJustifications();
    }

    @GetMapping("/contracts/alerts")
    public List<ContractAlertDTO> getContractAlerts() {
        return dashboardService.getContractAlerts();
    }

    @GetMapping("/weekly-payroll")
    public ResponseEntity<WeeklyPayrollDTO> getWeeklyPayroll() {
        WeeklyPayrollDTO data = dashboardService.getWeeklyPayrollForDashboard();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/weekly-attendance")
    public List<WeeklyAttendanceDTO> getWeeklyAttendance() {
        // Llama al service que calcula la semana actual y retorna los DTOs con 0 si no hay datos
        return dashboardService.getWeeklyAttendance();
    }

    @GetMapping("/monthly-overtime")
    public List<WeeklyOvertimeDTO> getMonthlyOvertime() {
        return dashboardService.getMonthlyOvertime();
    }
}
