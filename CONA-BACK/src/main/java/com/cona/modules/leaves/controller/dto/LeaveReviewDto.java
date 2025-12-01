package com.cona.modules.leaves.controller.dto;

import com.cona.kernel.utils.Validations;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
    @Pattern(regexp = Validations.DESCRIPTION_REGEX, message = "Los comentarios contienen caracteres no permitidos")
    private String comments;
}