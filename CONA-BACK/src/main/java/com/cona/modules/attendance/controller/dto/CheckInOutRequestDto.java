package com.cona.modules.attendance.controller.dto;

import jakarta.validation.constraints.NotBlank;
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
    private String employeeKey;
}