package com.cona.modules.system_config.controller.dto;

import com.cona.modules.system_config.enums.HolidayType;
import lombok.Data;

import java.time.LocalDate;
@Data
public class HolidayResponse {
    private Long id;
    private LocalDate date;
    private String name;
    private HolidayType type;
    private String description;
}