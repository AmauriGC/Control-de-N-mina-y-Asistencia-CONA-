package com.cona.modules.attendance.controller.dto;

import com.cona.kernel.utils.Validations;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInOutRequestDto {
    
    @NotBlank(message = "El número de empleado es requerido")
    @Size(min = 1, max = 5, message = "El número de empleado debe tener entre 1 y 5 caracteres")
    @Pattern(regexp = Validations.ALPHANUMERIC_REGEX, message = "El número de empleado debe contener solo letras y números")
    private String employeeKey;
}