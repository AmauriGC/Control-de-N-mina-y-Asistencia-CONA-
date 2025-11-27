package com.cona.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record GoogleLoginRequest(
        @NotBlank(message = "El ID token es obligatorio")
        String idToken
) {}
