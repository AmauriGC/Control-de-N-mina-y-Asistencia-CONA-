package com.cona.modules.auth.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.auth.dto.*;
import com.cona.modules.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
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
        return ApiResponse.success("Login exitoso", data);
    }

    @PostMapping("/register")
    public ApiResponse<String> register(@Valid @RequestBody AuthRequest reqBody, @RequestParam(defaultValue = "EMPLOYEE") String role, HttpServletRequest request) {
        authService.register(reqBody, role);
        return ApiResponse.success("Usuario registrado exitosamente");
    }

    @PostMapping("/change-password")
    public ApiResponse<String> changePassword(@Valid @RequestBody ChangePasswordRequest reqBody, Authentication authentication, HttpServletRequest request) {
        String email = authentication.getName();
        authService.changePassword(reqBody, email);
        return ApiResponse.success("Contraseña actualizada exitosamente");
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest reqBody, HttpServletRequest request) {
        authService.forgotPassword(reqBody);
        return ApiResponse.success("Si el correo electrónico existe, se ha enviado un enlace para restablecer la contraseña");
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@Valid @RequestBody ResetPasswordRequest reqBody, HttpServletRequest request) {
        authService.resetPassword(reqBody);
        return ApiResponse.success("Contraseña restablecida exitosamente");
    }
}
