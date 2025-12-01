package com.cona.modules.justifications.controller.dto;

import com.cona.kernel.utils.Validations;
import com.cona.modules.justifications.enums.DocumentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SubmitJustificationRequest(
        @NotNull Long employeeId,
        @NotNull Long attendanceId,
        @NotNull DocumentType documentType,
        @Size(max = 500) @Pattern(regexp = Validations.DESCRIPTION_REGEX, message = "La razón contiene caracteres no permitidos") String reason
) {}
