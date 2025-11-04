package com.cona.service;

import com.cona.controller.dto.AuthRequest;
import com.cona.controller.dto.AuthResponse;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    void register(AuthRequest request, String role);
}
