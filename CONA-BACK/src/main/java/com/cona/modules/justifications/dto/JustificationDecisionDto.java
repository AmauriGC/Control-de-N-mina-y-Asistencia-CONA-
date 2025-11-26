package com.cona.modules.justifications.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JustificationDecisionDto {
    @NotNull(message = "La decisión es obligatoria")
    private Boolean approved;
    
    @Size(max = 500, message = "Los comentarios no pueden exceder los 500 caracteres")
    private String comments;
}
