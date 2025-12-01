package com.cona.modules.attendance.controller.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record AttendanceRangeRequestDto(
        @NotNull(message = "La fecha de inicio es requerida") LocalDate startDate,
        @NotNull(message = "La fecha de fin es requerida") LocalDate endDate
) {}

