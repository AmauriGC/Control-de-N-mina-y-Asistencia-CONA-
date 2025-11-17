package com.cona.modules.system_config.dto;

import com.cona.modules.system_config.enums.HolidayType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record HolidayRequest(
        @NotNull(message = "La fecha es obligatoria")
        LocalDate date,

        @NotBlank(message = "El nombre es obligatorio")
        String name,

        @NotNull(message = "El tipo de festivo es obligatorio")
        HolidayType type
) {}
