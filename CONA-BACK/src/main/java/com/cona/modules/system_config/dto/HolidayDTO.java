package com.cona.modules.system_config.dto;

import com.cona.modules.system_config.enums.HolidayType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record HolidayDTO(
        Long id,
        LocalDate date,
        String name,
        HolidayType type,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
