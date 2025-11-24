package com.cona.modules.auth.service;

import com.cona.modules.auth.dto.*;

public interface AuthService {
    AuthResponse login(AuthRequest request);

    void register(AuthRequest request, String role);

    void changePassword(ChangePasswordRequest request, String email);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void logout(String email);
}
