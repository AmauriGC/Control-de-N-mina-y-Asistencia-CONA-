package com.cona.kernel.utils;

public final class Sanitizer {
    private Sanitizer() {}

    public static String trimAndLower(String value) {
        if (value == null) return null;
        return value.trim().toLowerCase();
    }

    public static String trim(String value) {
        if (value == null) return null;
        return value.trim();
    }

    public static String normalizeEmail(String email) {
        return email != null ? email.trim().toLowerCase().replaceAll("\\s+", "") : null;
    }

    public static String sanitizeString(String input) {
        return input != null ? input.trim().replaceAll("\\s+", " ") : null;
    }

    public static boolean isValidEmail(String email) {
        return email != null && email.matches(Validations.EMAIL_REGEX);
    }

    public static boolean isValidPassword(String password) {
        return password != null && password.matches(Validations.PASSWORD_REGEX);
    }
}
