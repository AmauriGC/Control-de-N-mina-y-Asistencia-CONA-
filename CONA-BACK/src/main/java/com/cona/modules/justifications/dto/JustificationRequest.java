package com.cona.modules.justifications.dto;

import com.cona.kernel.utils.Validations;
import com.cona.modules.justifications.enums.DocumentType;
import com.cona.modules.justifications.enums.JustificationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record JustificationRequest(
        @NotNull(message = "El ID del empleado es obligatorio")
        Long employeeId,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate date,

        @NotBlank(message = "La razón es obligatoria")
        @Size(max = 500, message = "La razón debe tener menos de 500 caracteres")
        String reason,

        @NotNull(message = "El tipo de documento es obligatorio")
        DocumentType documentType,

        String documentPath,

        @NotNull(message = "El estado es obligatorio")
        JustificationStatus status
) {}
