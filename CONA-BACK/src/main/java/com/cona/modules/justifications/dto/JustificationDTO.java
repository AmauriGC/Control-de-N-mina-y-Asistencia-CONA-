package com.cona.modules.justifications.dto;

import com.cona.modules.justifications.enums.DocumentType;
import com.cona.modules.justifications.enums.JustificationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record JustificationDTO(
        Long id,
        Long employeeId,
        LocalDate date,
        String reason,
        DocumentType documentType,
        String documentPath,
        JustificationStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
