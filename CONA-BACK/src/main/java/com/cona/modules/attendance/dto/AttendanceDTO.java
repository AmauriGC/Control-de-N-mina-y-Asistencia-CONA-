package com.cona.modules.attendance.dto;

import com.cona.modules.attendance.enums.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AttendanceDTO(
        Long id,
        Long employeeId,
        LocalDate date,
        LocalTime checkInTime,
        LocalTime checkOutTime,
        AttendanceStatus status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
