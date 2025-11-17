package com.cona.modules.payroll.dto;

import com.cona.modules.payroll.enums.PayrollStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PayrollRequest(
        @NotNull(message = "El ID del empleado es obligatorio")
        Long employeeId,

        @NotNull(message = "La fecha de inicio del período es obligatoria")
        LocalDate periodStart,

        @NotNull(message = "La fecha de fin del período es obligatoria")
        LocalDate periodEnd,

        @NotNull(message = "El salario base es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El salario base debe ser mayor a 0")
        BigDecimal baseSalary,

        BigDecimal deductions,

        BigDecimal bonuses,

        @NotNull(message = "El salario neto es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El salario neto debe ser mayor a 0")
        BigDecimal netSalary,

        @NotNull(message = "El estado es obligatorio")
        PayrollStatus status
) {}
