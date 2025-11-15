package com.cona.controller;

import com.cona.controller.dto.AuthRequest;
import com.cona.controller.dto.AuthResponse;
import com.cona.kernel.response.ApiResponse;
import com.cona.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody AuthRequest reqBody, HttpServletRequest request) {
        AuthResponse data = authService.login(reqBody);
        return new ApiResponse<>(true, "OK", data, request.getRequestURI());
    }

    @PostMapping("/register")
    public ApiResponse<String> register(@Valid @RequestBody AuthRequest reqBody, @RequestParam(defaultValue = "EMPLOYEE") String role, HttpServletRequest request) {
        authService.register(reqBody, role);
        return new ApiResponse<>(true, "Usuario creado", "OK", request.getRequestURI());
    }
}
