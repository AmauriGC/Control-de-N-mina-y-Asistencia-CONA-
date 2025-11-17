package com.cona.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @Email(message = "Formato de correo electrónico inválido")
        @NotBlank(message = "El correo electrónico es obligatorio")
        String email
) {}
