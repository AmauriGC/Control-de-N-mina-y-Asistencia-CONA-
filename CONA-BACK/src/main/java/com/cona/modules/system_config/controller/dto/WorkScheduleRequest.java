package com.cona.modules.system_config.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class WorkScheduleRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String name;

    @NotNull(message = "La hora de entrada es obligatoria")
    private LocalTime entryTime;

    @NotNull(message = "La hora de salida es obligatoria")
    private LocalTime exitTime;

    private Integer toleranceMinutes;

    private String description;
}
