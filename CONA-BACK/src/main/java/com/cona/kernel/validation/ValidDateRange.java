package com.cona.kernel.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ValidDateRangeValidator.class)
@Documented
public @interface ValidDateRange {
    String message() default "Rango de fechas inválido";
    String startField();
    String endField();
    boolean allowSame() default true;
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

