package com.cona.modules.leaves.controller.dto;

import com.cona.modules.leaves.enums.LeaveType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    
    @NotNull(message = "La fecha de inicio es requerida")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @NotNull(message = "La fecha de fin es requerida")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    @NotNull(message = "El tipo de permiso es requerido")
    private LeaveType type;
    
    @Size(max = 500, message = "La razón no puede exceder 500 caracteres")
    private String reason;
}