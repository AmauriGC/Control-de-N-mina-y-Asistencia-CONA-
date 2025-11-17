package com.cona.modules.auth.dto;

import java.time.LocalDateTime;

public record AuthResponse(
        String token,
        LocalDateTime expiresAt
) {}
