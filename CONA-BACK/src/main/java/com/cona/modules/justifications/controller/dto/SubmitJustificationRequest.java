package com.cona.modules.justifications.controller.dto;

import com.cona.modules.justifications.enums.DocumentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SubmitJustificationRequest(
        @NotNull Long employeeId,
        @NotNull Long attendanceId,
        @NotNull DocumentType documentType,
        @Size(max = 500) String reason
) {}
