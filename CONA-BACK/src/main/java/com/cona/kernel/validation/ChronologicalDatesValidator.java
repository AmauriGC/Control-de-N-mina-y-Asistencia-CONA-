package com.cona.kernel.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.lang.reflect.Field;
import java.time.LocalDate;

public class ChronologicalDatesValidator implements ConstraintValidator<ChronologicalDates, Object> {
    private String startField;
    private String endField;

    @Override
    public void initialize(ChronologicalDates constraintAnnotation) {
        this.startField = constraintAnnotation.startField();
        this.endField = constraintAnnotation.endField();
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
            return !e.isBefore(s);
        } catch (NoSuchFieldException | IllegalAccessException ex) {
            return true; // Si no se puede validar, no interrumpir
        }
    }
}

