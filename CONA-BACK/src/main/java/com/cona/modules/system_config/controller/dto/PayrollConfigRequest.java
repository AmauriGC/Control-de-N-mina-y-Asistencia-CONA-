package com.cona.modules.system_config.controller.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayrollConfigRequest {

    @NotNull(message = "El monto fijo de ISR es obligatorio")
    @DecimalMin(value = "0.00", message = "El ISR fijo debe ser mayor o igual a 0")
    @Digits(integer = 8, fraction = 2, message = "El ISR fijo debe tener máximo 2 decimales")
    private BigDecimal isrFixed;

    @NotNull(message = "El monto fijo de IMSS es obligatorio")
    @DecimalMin(value = "0.00", message = "El IMSS fijo debe ser mayor o igual a 0")
    @Digits(integer = 8, fraction = 2, message = "El IMSS fijo debe tener máximo 2 decimales")
    private BigDecimal imssFixed;

    @NotNull(message = "La penalización por retardo es obligatoria")
    @DecimalMin(value = "0.00", message = "La penalización debe ser mayor o igual a 0")
    @Digits(integer = 8, fraction = 2, message = "La penalización debe tener máximo 2 decimales")
    private BigDecimal latePenalty;
}