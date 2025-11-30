package com.cona.modules.payroll.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class PayrollDetailDto {
    private Long employeeId;
    private String employeeName;
    private String employeeKey;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    
    // Desglose de días
    private Integer normalDaysWorked;
    private BigDecimal normalDaysSalary;
    
    private Integer vacationDays;
    private BigDecimal vacationDaysSalary;
    
    private Integer absentDays;
    private BigDecimal absentDaysSalary;
    
    private Integer lateDays;
    private BigDecimal lateDaysSalary;
    
    // Descuentos y bonos
    private BigDecimal latePenaltyDeduction;
    private BigDecimal bonus;
    private Boolean hasBonusPenalties;
    
    // Totales
    private BigDecimal baseSalary;
    private BigDecimal totalSalary;
}