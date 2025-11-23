package com.cona.modules.system_config.controller.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PayrollConfigRequest {
    @NotNull(message = "ISR fixed amount is required.")
    @DecimalMin(value = "0.00", inclusive = true, message = "ISR fixed amount must be zero or positive.")
    private BigDecimal isrFixed;

    @NotNull(message = "IMSS fixed amount is required.")
    @DecimalMin(value = "0.00", inclusive = true, message = "IMSS fixed amount must be zero or positive.")
    private BigDecimal imssFixed;

    @NotNull(message = "Late penalty amount is required.")
    @DecimalMin(value = "0.00", inclusive = true, message = "Late penalty amount must be zero or positive.")
    private BigDecimal latePenalty;
}
