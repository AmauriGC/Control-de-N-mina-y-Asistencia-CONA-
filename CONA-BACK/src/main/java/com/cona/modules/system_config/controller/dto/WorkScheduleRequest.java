package com.cona.modules.system_config.controller.dto;

import com.cona.kernel.utils.Validations;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalTime;

@Data
public class WorkScheduleRequest {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    @Pattern(regexp = Validations.NAME_REGEX, message = "El nombre debe contener solo letras y espacios")
    private String name;

    @NotNull(message = "La hora de entrada es obligatoria")
    private LocalTime entryTime;

    @NotNull(message = "La hora de salida es obligatoria")
    private LocalTime exitTime;

    @Min(value = 0, message = "Los minutos de tolerancia deben ser positivos")
    private Integer toleranceMinutes;

    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    @Pattern(regexp = Validations.DESCRIPTION_REGEX, message = "La descripción contiene caracteres no permitidos")
    private String description;
}
