package com.cona.modules.auth.service;

import com.cona.modules.auth.dto.AuthRequest;
import com.cona.modules.auth.dto.AuthResponse;
import com.cona.modules.auth.dto.ChangePasswordRequest;
import com.cona.modules.auth.dto.ForgotPasswordRequest;
import com.cona.modules.auth.dto.ResetPasswordRequest;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    void register(AuthRequest request, String role);
    void changePassword(ChangePasswordRequest request, String email);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
}
