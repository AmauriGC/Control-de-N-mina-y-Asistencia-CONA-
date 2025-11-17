package com.cona.modules.system_config.dto;

import jakarta.validation.constraints.NotBlank;

public record SystemConfigRequest(
        @NotBlank(message = "La clave es obligatoria")
        String key,

        @NotBlank(message = "El valor es obligatorio")
        String value,

        String description
) {}
