package com.cona.modules.auth.service;

import com.cona.exception.types.BusinessException;
import com.cona.kernel.utils.Sanitizer;
import com.cona.kernel.utils.Validations;
import com.cona.modules.auth.dto.*;
import com.cona.modules.auth.entity.User;
import com.cona.modules.auth.enums.Role;
import com.cona.modules.auth.repository.UserRepository;
import com.cona.modules.notification.service.EmailService;
import com.cona.security.jwt.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final JwtTokenProvider jwt;
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final EmailService emailService;

    public AuthServiceImpl(JwtTokenProvider jwt, UserRepository users, PasswordEncoder encoder, EmailService emailService) {
        this.jwt = jwt;
        this.users = users;
        this.encoder = encoder;
        this.emailService = emailService;
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        // Sanitizar inputs
        String email = Sanitizer.normalizeEmail(request.email());
        String password = Sanitizer.sanitizeString(request.password());

        // Validaciones
        if (!Validations.isValidEmail(email)) {
            throw new BusinessException("INVALID_EMAIL", "Formato de correo electrónico inválido");
        }

        if (!Validations.isValidPassword(password)) {
            throw new BusinessException("INVALID_PASSWORD", "La contraseña no cumple con los requisitos de seguridad");
        }

        // Buscar usuario
        User user = users.findByEmail(email).orElseThrow(() -> new BusinessException("INVALID_CREDENTIALS", "Credenciales incorrectas"));

        // Verificar estado del usuario
        if (!user.getActive()) {
            throw new BusinessException("USER_INACTIVE", "Usuario inactivo");
        }

        // Verificar contraseña
        if (!encoder.matches(password, user.getPassword())) {
            throw new BusinessException("INVALID_CREDENTIALS", "Credenciales incorrectas");
        }

        // Generar token
        String token = jwt.generateToken(user.getEmail(), Map.of(
                "id", user.getId(),
                "role", user.getRole().name(),
                "email", user.getEmail()
        ));
        LocalDateTime expires = LocalDateTime.now().plusSeconds(jwt.getExpirationMs() / 1000);
        return new AuthResponse(token, expires);
    }

    @Override
    public void register(AuthRequest request, String roleStr) {
        // Sanitizar inputs
        String email = Sanitizer.normalizeEmail(request.email());
        String password = Sanitizer.sanitizeString(request.password());

        // Validaciones
        if (!Validations.isValidEmail(email)) {
            throw new BusinessException("INVALID_EMAIL", "Formato de correo electrónico inválido");
        }

        if (!Validations.isValidPassword(password)) {
            throw new BusinessException("INVALID_PASSWORD", "La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, dígito y carácter especial");
        }

        Role role;
        try {
            role = Role.valueOf(roleStr.trim().toUpperCase());
        } catch (Exception e) {
            throw new BusinessException("INVALID_ROLE", "Rol inválido: " + roleStr);
        }

        if (users.existsByEmail(email)) {
            throw new BusinessException("EMAIL_ALREADY_EXISTS", "Correo electrónico ya registrado");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRole(role);
        user.setActive(true);
        users.save(user);
    }

    @Override
    public void changePassword(ChangePasswordRequest request, String email) {
        // Sanitizar inputs
        String currentPassword = Sanitizer.sanitizeString(request.currentPassword());
        String newPassword = Sanitizer.sanitizeString(request.newPassword());
        String confirmPassword = Sanitizer.sanitizeString(request.confirmPassword());

        // Validaciones
        if (!Validations.isValidPassword(newPassword)) {
            throw new BusinessException("INVALID_NEW_PASSWORD", "La nueva contraseña no cumple con los requisitos de seguridad");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new BusinessException("PASSWORD_MISMATCH", "La confirmación de contraseña no coincide");
        }

        User user = users.findByEmail(email).orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Usuario no encontrado"));

        // Verificar contraseña actual
        if (!encoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException("INVALID_CURRENT_PASSWORD", "La contraseña actual es incorrecta");
        }

        // Actualizar contraseña
        user.setPassword(encoder.encode(newPassword));
        users.save(user);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        // Sanitizar input
        String email = Sanitizer.normalizeEmail(request.email());

        // Validaciones
        if (!Validations.isValidEmail(email)) {
            throw new BusinessException("INVALID_EMAIL", "Formato de correo electrónico inválido");
        }

        // Buscar usuario
        User user = users.findByEmail(email).orElseThrow(() -> new BusinessException("EMAIL_NOT_FOUND", "Correo electrónico no encontrado"));

        // Generar token único (UUID)
        String resetToken = java.util.UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(15); // 15 minutos

        // Guardar token en usuario
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiry);
        users.save(user);

        // Enviar email
        String resetUrl = "http://localhost:5173/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(user.getEmail(), resetUrl);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        // Sanitizar inputs
        String token = Sanitizer.sanitizeString(request.token());
        String newPassword = Sanitizer.sanitizeString(request.newPassword());
        String confirmPassword = Sanitizer.sanitizeString(request.confirmPassword());

        // Validaciones
        if (!Validations.isValidPassword(newPassword)) {
            throw new BusinessException("INVALID_NEW_PASSWORD", "La nueva contraseña no cumple con los requisitos de seguridad");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new BusinessException("PASSWORD_MISMATCH", "La confirmación de contraseña no coincide");
        }

        // Buscar usuario por token
        User user = users.findByResetToken(token).orElseThrow(() -> new BusinessException("INVALID_TOKEN", "Token inválido"));

        // Verificar expiración
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BusinessException("TOKEN_EXPIRED", "El token ha expirado");
        }

        // Actualizar contraseña
        user.setPassword(encoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        users.save(user);
    }
}
