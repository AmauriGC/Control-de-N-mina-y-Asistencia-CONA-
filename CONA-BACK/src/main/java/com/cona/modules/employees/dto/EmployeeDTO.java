package com.cona.modules.employees.dto;

import com.cona.kernel.utils.Validations;
import com.cona.modules.employees.enums.EmployeeStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record EmployeeDTO(
        Long id,
        String fullName,
        String email,
        String phone,
        String position,
        EmployeeStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
