package com.cona.kernel.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ChronologicalDatesValidator.class)
@Documented
public @interface ChronologicalDates {
    String message() default "La fecha de fin debe ser posterior o igual a la fecha de inicio";
    String startField();
    String endField();
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

