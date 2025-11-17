package com.cona.modules.attendance.dto;

import com.cona.kernel.utils.Validations;
import com.cona.modules.attendance.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceRequest(
        @NotNull(message = "El ID del empleado es obligatorio")
        Long employeeId,

        @NotNull(message = "La fecha es obligatoria")
        LocalDate date,

        LocalTime checkInTime,

        LocalTime checkOutTime,

        @NotNull(message = "El estado es obligatorio")
        AttendanceStatus status
) {}
