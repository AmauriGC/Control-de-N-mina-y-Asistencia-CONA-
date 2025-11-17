package com.cona.modules.payroll.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PaySlipDTO(
        Long id,
        Long payrollId,
        LocalDate issueDate,
        String filePath,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
