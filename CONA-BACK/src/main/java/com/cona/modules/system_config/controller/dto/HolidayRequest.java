package com.cona.modules.system_config.controller.dto;

import com.cona.kernel.utils.Validations;
import com.cona.modules.system_config.enums.HolidayType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HolidayRequest {

    @NotNull(message = "La fecha del día festivo es obligatoria")
    private LocalDate holidayDate;

    @NotBlank(message = "El nombre del día festivo es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = Validations.NAME_REGEX, message = "El nombre debe contener solo letras y espacios")
    private String name;

    @NotNull(message = "El tipo de festivo es obligatorio")
    private HolidayType type;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    @Pattern(regexp = Validations.DESCRIPTION_REGEX, message = "La descripción contiene caracteres no permitidos")
    private String description;
}