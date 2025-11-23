package com.cona.modules.system_config.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalTime;

@Data
public class WorkScheduleRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotNull(message = "La hora de entrada es obligatoria")
    private LocalTime startTime;

    @NotNull(message = "La hora de salida es obligatoria")
    private LocalTime endTime;

    @NotNull(message = "La tolerancia es obligatoria")
    @Max(value = 30, message = "La tolerancia máxima es 30 minutos")
    @Min(value = 0, message = "La tolerancia no puede ser negativa")
    private Integer toleranceMinutes;

    private String description;

    private Boolean active = true;

}
