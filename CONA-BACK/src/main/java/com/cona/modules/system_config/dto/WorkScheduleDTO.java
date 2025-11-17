package com.cona.modules.system_config.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record WorkScheduleDTO(
        Long id,
        String dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        Boolean isWorkingDay,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
