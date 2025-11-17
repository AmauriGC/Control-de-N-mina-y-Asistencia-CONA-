package com.cona.modules.auth.dto;

import com.cona.kernel.utils.Validations;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ResetPasswordRequest(
        @NotBlank(message = "El token es obligatorio")
        String token,

        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Pattern(regexp = Validations.PASSWORD_REGEX, message = "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, dígito y carácter especial")
        String newPassword,

        @NotBlank(message = "La confirmación de contraseña es obligatoria")
        String confirmPassword
) {}
