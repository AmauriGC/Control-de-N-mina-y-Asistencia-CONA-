package com.cona.modules.system_config.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record WorkScheduleRequest(
        @NotBlank(message = "El día de la semana es obligatorio")
        String dayOfWeek,

        LocalTime startTime,

        LocalTime endTime,

        @NotNull(message = "El indicador de día laboral es obligatorio")
        Boolean isWorkingDay
) {}
