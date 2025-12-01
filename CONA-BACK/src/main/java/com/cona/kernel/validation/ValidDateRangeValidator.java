package com.cona.kernel.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.lang.reflect.Field;
import java.time.LocalDate;

public class ValidDateRangeValidator implements ConstraintValidator<ValidDateRange, Object> {
    private String startField;
    private String endField;
    private boolean allowSame;

    @Override
    public void initialize(ValidDateRange constraintAnnotation) {
        this.startField = constraintAnnotation.startField();
        this.endField = constraintAnnotation.endField();
        this.allowSame = constraintAnnotation.allowSame();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        try {
            Field start = value.getClass().getDeclaredField(startField);
            Field end = value.getClass().getDeclaredField(endField);
            start.setAccessible(true);
            end.setAccessible(true);
            Object startVal = start.get(value);
            Object endVal = end.get(value);
            if (startVal == null || endVal == null) return true; // @NotNull se encarga
            if (!(startVal instanceof LocalDate) || !(endVal instanceof LocalDate)) return true;
            LocalDate s = (LocalDate) startVal;
            LocalDate e = (LocalDate) endVal;
            return allowSame ? !e.isBefore(s) : e.isAfter(s);
        } catch (NoSuchFieldException | IllegalAccessException ex) {
            return true;
        }
    }
}

