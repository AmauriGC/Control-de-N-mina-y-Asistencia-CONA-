package com.cona.kernel.utils;

public final class Sanitizer {
    private Sanitizer() {}

    public static String trimAndLower(String value) {
        if (value == null) return null;
        return value.trim().toLowerCase();
    }

    public static String normalizeEmail(String email) {
        return email != null ? email.trim().toLowerCase().replaceAll("\\s+", "") : null;
    }

    public static String sanitizeString(String input) {
        return input != null ? input.trim().replaceAll("\\s+", " ") : null;
    }

    // --- Nuevos métodos de apoyo de sanitización ---

    /**
     * Colapsa espacios múltiples en uno y hace trim.
     */
    public static String collapseSpaces(String input) {
        return input == null ? null : input.trim().replaceAll("\\s+", " ");
    }

    /**
     * Devuelve null si la cadena es null o queda vacía tras trim.
     */
    public static String nullIfBlank(String input) {
        if (input == null) return null;
        String trimmed = input.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Trunca la cadena a maxLength si excede ese tamaño.
     */
    public static String truncate(String input, int maxLength) {
        if (input == null) return null;
        if (maxLength < 0) return input;
        return input.length() <= maxLength ? input : input.substring(0, maxLength);
    }

    /**
     * Sanitiza comentarios para almacenamiento: colapsa espacios y trunca a 500 caracteres.
     */
    public static String sanitizeComment(String comment) {
        String sanitized = collapseSpaces(comment);
        // Validar contra regex de descripción si se desea (opcional):
        if (sanitized != null && !sanitized.matches(Validations.DESCRIPTION_REGEX)) {
            // Si no cumple, limpiamos caracteres no permitidos básico y truncamos.
            sanitized = sanitized.replaceAll("[^a-zA-Z0-9\\s.,!?;:'\"()-]", "");
        }
        return truncate(sanitized, 500);
    }

    /** Sanitiza teléfono: elimina no dígitos y limita a 10 */
    public static String sanitizePhone(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("[^0-9]", "");
        return digits.length() > 10 ? digits.substring(0, 10) : digits;
    }

    /** Sanitiza RFC: trim, upper y elimina espacios internos múltiples. */
    public static String sanitizeRfc(String rfc) {
        if (rfc == null) return null;
        String cleaned = collapseSpaces(rfc).toUpperCase();
        return cleaned.replaceAll("[^A-Z0-9&Ñ]", "");
    }

    /** Sanitiza CLABE: solo dígitos y longitud máxima 18 */
    public static String sanitizeClabe(String clabe) {
        if (clabe == null) return null;
        String digits = clabe.replaceAll("[^0-9]", "");
        return digits.length() > 18 ? digits.substring(0, 18) : digits;
    }

    /** Sanitiza cuenta bancaria: trim y colapsa espacios, máximo 20 caracteres */
    public static String sanitizeBankAccount(String account) {
        return truncate(collapseSpaces(account), 20);
    }
}
