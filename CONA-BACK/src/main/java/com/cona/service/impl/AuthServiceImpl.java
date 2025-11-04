package com.cona.service.impl;

import com.cona.controller.dto.AuthRequest;
import com.cona.controller.dto.AuthResponse;
import com.cona.entity.User;
import com.cona.enums.Role;
import com.cona.exception.types.BusinessException;
import com.cona.kernel.utils.Sanitizer;
import com.cona.repository.UserRepository;
import com.cona.security.jwt.JwtTokenProvider;
import com.cona.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authManager;
    private final JwtTokenProvider jwt;
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public AuthServiceImpl(AuthenticationManager authManager, JwtTokenProvider jwt, UserRepository users, PasswordEncoder encoder) {
        this.authManager = authManager;
        this.jwt = jwt;
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        String email = Sanitizer.trimAndLower(request.getEmail());
        String password = Sanitizer.trim(request.getPassword());
        Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        UserDetails principal = (UserDetails) auth.getPrincipal();
        User user = users.findByEmail(principal.getUsername()).orElseThrow();
        String token = jwt.generateToken(principal, Map.of(
                "id", user.getId(),
                "role", user.getRole().name(),
                "email", user.getEmail()
        ));
        Instant expires = Instant.now().plusMillis(jwt.getExpirationMs());
        return new AuthResponse(token, expires);
    }

    @Override
    public void register(AuthRequest request, String roleStr) {
        String email = Sanitizer.trimAndLower(request.getEmail());
        String password = Sanitizer.trim(request.getPassword());
        Role role;
        try {
            role = Role.valueOf(roleStr.trim().toUpperCase());
        } catch (Exception e) {
            throw new BusinessException("INVALID_ROLE", "Rol inválido: " + roleStr);
        }
        if (users.existsByEmail(email)) {
            throw new BusinessException("EMAIL_ALREADY_EXISTS", "Email ya registrado");
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setRole(role);
        users.save(user);
    }
}
