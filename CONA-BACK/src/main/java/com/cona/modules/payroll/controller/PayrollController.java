package com.cona.modules.payroll.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.payroll.dto.PayrollDetailDto;
import com.cona.modules.payroll.entity.Payroll;
import com.cona.modules.payroll.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PayrollController {

    private final PayrollService payrollService;

    @PostMapping("/calculate/{employeeId}")
    public ResponseEntity<ApiResponse<Payroll>> calculatePayroll(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        
        try {
            Payroll payroll = payrollService.calculatePayroll(employeeId, periodStart, periodEnd);
            return ResponseEntity.ok(ApiResponse.success("Nómina calculada exitosamente", payroll));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al calcular nómina: " + e.getMessage()));
        }
    }

    @GetMapping("/detail/{employeeId}")
    public ResponseEntity<ApiResponse<PayrollDetailDto>> getPayrollDetail(
            @PathVariable Long employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate periodEnd) {
        
        try {
            PayrollDetailDto detail = payrollService.getPayrollDetail(employeeId, periodStart, periodEnd);
            return ResponseEntity.ok(ApiResponse.success("Detalle de nómina obtenido", detail));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al obtener detalle: " + e.getMessage()));
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<Payroll>>> getEmployeePayrolls(@PathVariable Long employeeId) {
        try {
            List<Payroll> payrolls = payrollService.getEmployeePayrolls(employeeId);
            return ResponseEntity.ok(ApiResponse.success("Nóminas del empleado obtenidas", payrolls));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al obtener nóminas: " + e.getMessage()));
        }
    }

    @GetMapping("/employee/{employeeId}/latest")
    public ResponseEntity<ApiResponse<PayrollDetailDto>> getLatestPayroll(@PathVariable Long employeeId) {
        try {
            // Calcular nómina para los últimos 15 días desde hoy
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(14); // 15 días incluyendo hoy
            
            System.out.println("Calculating payroll for employee " + employeeId + " from " + startDate + " to " + endDate);
            
            // Calcular la nómina
            payrollService.calculatePayroll(employeeId, startDate, endDate);
            
            // Obtener el detalle
            PayrollDetailDto detail = payrollService.getPayrollDetail(employeeId, startDate, endDate);
            
            System.out.println("Payroll detail: " + detail);
            
            return ResponseEntity.ok(ApiResponse.success("Última nómina calculada", detail));
            
        } catch (Exception e) {
            e.printStackTrace(); // Para debug
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al obtener última nómina: " + e.getMessage()));
        }
    }

    @PostMapping("/calculate-last-15-days/{employeeId}")
    public ResponseEntity<ApiResponse<Payroll>> calculateLastFifteenDays(@PathVariable Long employeeId) {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(15);
            
            Payroll payroll = payrollService.calculatePayroll(employeeId, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success("Nómina de últimos 15 días calculada", payroll));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al calcular nómina: " + e.getMessage()));
        }
    }
}