package com.cona.modules.auth.dto;

import com.cona.kernel.utils.Validations;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AuthRequest(
        @Email(message = "Formato de correo electrónico inválido")
        @NotBlank(message = "El correo electrónico es obligatorio")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {}
