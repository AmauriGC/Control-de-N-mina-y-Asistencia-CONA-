package com.cona.modules.system_config.controller.dto;

import com.cona.modules.system_config.enums.HolidayType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HolidayRequest {

    @NotNull(message = "La fecha del día festivo es obligatoria")
    private LocalDate date;

    @NotBlank(message = "El nombre del día festivo es obligatorio")
    private String name;

    @NotNull(message = "El tipo de festivo es obligatorio")
    private HolidayType type;

    private String description;
}