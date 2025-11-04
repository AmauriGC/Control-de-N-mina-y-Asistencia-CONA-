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
}

