package com.cona.modules.leaves.controller.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveReviewDto {
    
    @NotNull(message = "La decisión es requerida")
    private Boolean approved;
    
    @Size(max = 500, message = "Los comentarios no pueden exceder 500 caracteres")
    private String comments;
}