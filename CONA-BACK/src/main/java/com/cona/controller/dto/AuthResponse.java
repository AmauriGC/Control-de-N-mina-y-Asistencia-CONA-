package com.cona.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Instant expiresAt;
}
