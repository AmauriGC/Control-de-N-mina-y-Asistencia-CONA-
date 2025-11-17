package com.cona.modules.leaves.dto;

import com.cona.kernel.utils.Validations;
import com.cona.modules.leaves.enums.LeaveStatus;
import com.cona.modules.leaves.enums.LeaveType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record LeaveRequestRequest(
        @NotNull(message = "El ID del empleado es obligatorio")
        Long employeeId,

        @NotNull(message = "La fecha de inicio es obligatoria")
        LocalDate startDate,

        @NotNull(message = "La fecha de fin es obligatoria")
        LocalDate endDate,

        @NotNull(message = "El tipo de permiso es obligatorio")
        LeaveType type,

        @NotNull(message = "El estado del permiso es obligatorio")
        LeaveStatus status,

        @Size(max = 500, message = "La razón debe tener menos de 500 caracteres")
        String reason
) {}
