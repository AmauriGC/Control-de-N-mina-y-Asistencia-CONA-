package com.cona.modules.payroll.dto;

import com.cona.modules.payroll.enums.PayrollStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record PayrollDTO(
        Long id,
        Long employeeId,
        LocalDate periodStart,
        LocalDate periodEnd,
        BigDecimal baseSalary,
        BigDecimal deductions,
        BigDecimal bonuses,
        BigDecimal netSalary,
        PayrollStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
