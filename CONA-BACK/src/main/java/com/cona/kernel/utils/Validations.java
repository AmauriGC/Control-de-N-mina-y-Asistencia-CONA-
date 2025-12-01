package com.cona.kernel.utils;

public class Validations {
    public static final String EMAIL_REGEX = "^[a-zA-Z0-9._%+-]+@(cona\\.mx|utez\\.edu\\.mx|cona\\.com|gmail\\.com)$";
    public static final String NAME_REGEX = "^[A-Za-zÁÉÍÓÚÑáéíóúñ\\s]+$";
    public static final String PHONE_REGEX = "^\\d{10}$";
    public static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.])[A-Za-z\\d@$!%*?&.]{8,}$";
    public static final String ALPHANUMERIC_REGEX = "^[a-zA-Z0-9]+$";
    public static final String DATE_REGEX = "^\\d{4}-\\d{2}-\\d{2}$";
    public static final String TIME_REGEX = "^\\d{2}:\\d{2}$";
    public static final String DESCRIPTION_REGEX = "^[a-zA-Z0-9\\s.,!?;:'\"()-]{1,500}$";
    public static final String RFC_REGEX = "^([A-ZÑ&]{3,4})(\\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])([A-Z\\d]{2})([A\\d])$";
    public static final String CLABE_REGEX = "^\\d{18}$";


    public static boolean isValidEmail(String email) {
        return email == null || !email.matches(EMAIL_REGEX);
    }

    public static boolean isValidPassword(String password) {
        return password == null || !password.matches(PASSWORD_REGEX);
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
