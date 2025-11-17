package com.cona.modules.contracts.dto;

import com.cona.modules.contracts.enums.ContractStatus;
import com.cona.modules.contracts.enums.ContractType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ContractDTO(
        Long id,
        Long employeeId,
        LocalDate startDate,
        LocalDate endDate,
        ContractType type,
        ContractStatus status,
        BigDecimal salary,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
