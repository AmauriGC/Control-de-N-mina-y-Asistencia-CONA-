package com.cona.modules.system_config.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class WorkScheduleResponse {

    private LocalDateTime updatedAt;
    private Long id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer toleranceMinutes;
    private String description;
    private Boolean active;
    private LocalDateTime createdAt;

}
