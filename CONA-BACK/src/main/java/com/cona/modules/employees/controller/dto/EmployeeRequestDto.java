package com.cona.modules.employees.controller.dto;

import com.cona.kernel.utils.Validations;
import com.cona.modules.employees.enums.ContractType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequestDto {
    // Datos personales
    @NotBlank(message = "El nombre completo es obligatorio")
    @Pattern(regexp = Validations.NAME_REGEX, message = "El nombre completo debe contener solo letras y espacios")
    @Size(min = 2, max = 100, message = "El nombre completo debe tener entre 2 y 100 caracteres")
    private String fullName;

    @NotBlank(message = "El correo electrónico es obligatorio")
    @Pattern(regexp = Validations.EMAIL_REGEX, message = "Formato de correo electrónico inválido")
    private String email;

    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = Validations.PHONE_REGEX, message = "Formato de teléfono inválido")
    private String phone;

    @NotBlank(message = "El puesto es obligatorio")
    @Size(min = 2, max = 50, message = "El puesto debe tener entre 2 y 50 caracteres")
    private String position;

    // RFC
    @NotBlank(message = "El RFC es obligatorio")
    @Pattern(regexp = Validations.RFC_REGEX, message = "Formato de RFC inválido")
    private String rfc;

    // Datos de pago y contrato
    @NotNull(message = "El pago por hora es obligatorio")
    @DecimalMin(value = "0.01", message = "El pago por hora debe ser mayor a 0")
    @Digits(integer = 6, fraction = 2, message = "El pago por hora debe tener máximo 2 decimales")
    private BigDecimal hourlyRate;

    @NotNull(message = "El tipo de contrato es obligatorio")
    private ContractType contractType;

    @NotNull(message = "La fecha de inicio del contrato es obligatoria")
    private LocalDate contractStartDate;

    private LocalDate contractEndDate;

    // Datos bancarios
    @Size(max = 20, message = "La cuenta bancaria debe tener máximo 20 caracteres")
    private String bankAccount;

    @Size(max = 50, message = "El nombre del banco debe tener máximo 50 caracteres")
    private String bankName;

    @Size(max = 18, message = "La CLABE debe tener 18 caracteres")
    @Pattern(regexp = "^[0-9]{18}$", message = "La CLABE debe contener exactamente 18 dígitos")
    private String clabe;

    // Horario de trabajo
    @NotNull(message = "El horario de trabajo es obligatorio")
    private Long workSchedule;

}
