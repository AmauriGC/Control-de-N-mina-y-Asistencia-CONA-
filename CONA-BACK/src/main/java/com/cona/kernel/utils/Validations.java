package com.cona.kernel.utils;

public class Validations {
    public static final String EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@(cona\\.mx|utez\\.edu\\.mx|cona\\.com|gmail\\.com)$";
    public static final String NAME_REGEX = "^[a-zA-Z\\s]+$";
    public static final String PHONE_REGEX = "^\\+?[0-9]{10,15}$";
    public static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.])[A-Za-z\\d@$!%*?&.]{8,}$";
    public static final String ALPHANUMERIC_REGEX = "^[a-zA-Z0-9\\s]+$";
    public static final String DATE_REGEX = "^\\d{4}-\\d{2}-\\d{2}$";
    public static final String TIME_REGEX = "^\\d{2}:\\d{2}$";
    public static final String DESCRIPTION_REGEX = "^[a-zA-Z0-9\\s.,!?;:'\"()-]{1,500}$";
    public static final String RFC_REGEX = "^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$";
    public static final String CLAVE = "^[0-9]{18}$";


    public static boolean isValidEmail(String email) {
        return email != null && email.matches(EMAIL_REGEX);
    }

    public static boolean isValidPassword(String password) {
        return password != null && password.matches(PASSWORD_REGEX);
    }

    public static boolean isValidName(String name) {
        return name != null && name.matches(NAME_REGEX);
    }

    public static boolean isValidPhone(String phone) {
        return phone != null && phone.matches(PHONE_REGEX);
    }

    public static boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
