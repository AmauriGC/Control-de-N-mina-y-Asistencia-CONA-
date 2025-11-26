package com.cona.modules.system_config.controller.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class WorkScheduleResponse {
    private Long id;
    private String name;
    private LocalTime entryTime;
    private LocalTime exitTime;
    private Integer toleranceMinutes;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
