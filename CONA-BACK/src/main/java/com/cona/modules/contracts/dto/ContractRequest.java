package com.cona.modules.contracts.dto;

import com.cona.modules.contracts.enums.ContractStatus;
import com.cona.modules.contracts.enums.ContractType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContractRequest(
        @NotNull(message = "El ID del empleado es obligatorio")
        Long employeeId,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate startDate,

        LocalDate endDate,

        @NotNull(message = "El tipo de contrato es obligatorio")
        ContractType type,

        @NotNull(message = "El estado del contrato es obligatorio")
        ContractStatus status,

        @NotNull(message = "El salario es obligatorio")
        @DecimalMin(value = "0.0", inclusive = false, message = "El salario debe ser mayor a 0")
        BigDecimal salary
) {}
