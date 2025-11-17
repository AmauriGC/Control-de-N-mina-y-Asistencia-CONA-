package com.cona.modules.employees.dto;

import com.cona.kernel.utils.Validations;
import com.cona.modules.employees.enums.EmployeeStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EmployeeRequest(
        @NotBlank(message = "El nombre completo es obligatorio")
        @Pattern(regexp = Validations.NAME_REGEX, message = "El nombre completo debe contener solo letras y espacios")
        @Size(min = 2, max = 100, message = "El nombre completo debe tener entre 2 y 100 caracteres")
        String fullName,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Pattern(regexp = Validations.EMAIL_REGEX, message = "Formato de correo electrónico inválido")
        String email,

        @NotBlank(message = "El teléfono es obligatorio")
        @Pattern(regexp = Validations.PHONE_REGEX, message = "Formato de teléfono inválido")
        String phone,

        @NotBlank(message = "El puesto es obligatorio")
        @Size(min = 2, max = 50, message = "El puesto debe tener entre 2 y 50 caracteres")
        String position,

        EmployeeStatus status
) {}
