package com.cona.modules.system_config.controller.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PayrollConfigResponse {
    private Long id;
    private BigDecimal isrFixed;
    private BigDecimal imssFixed;
    private BigDecimal latePenalty;
    private BigDecimal bonusAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}