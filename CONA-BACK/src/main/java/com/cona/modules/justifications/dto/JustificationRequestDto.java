package com.cona.modules.justifications.dto;

import com.cona.modules.justifications.enums.DocumentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class JustificationRequestDto {
    @NotNull(message = "La fecha es obligatoria")
    private LocalDate date;

    @NotBlank(message = "La razón es obligatoria")
    @Size(max = 500, message = "La razón no puede exceder los 500 caracteres")
    private String reason;

    @NotNull(message = "El tipo de documento es obligatorio")
    private DocumentType documentType;

    private String documentPath;
}
