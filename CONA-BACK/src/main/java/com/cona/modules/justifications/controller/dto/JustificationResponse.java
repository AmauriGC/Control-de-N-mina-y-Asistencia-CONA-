package com.cona.modules.justifications.controller.dto;

import com.cona.modules.justifications.enums.DocumentType;
import com.cona.modules.justifications.enums.JustificationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record JustificationResponse(
        Long id,
        Long employeeId,
        Long attendanceId,
        LocalDate date,
        String reason,
        DocumentType documentType,
        String documentPath,
        JustificationStatus status,
        String reviewComments,
        LocalDateTime createdAt
) {}
