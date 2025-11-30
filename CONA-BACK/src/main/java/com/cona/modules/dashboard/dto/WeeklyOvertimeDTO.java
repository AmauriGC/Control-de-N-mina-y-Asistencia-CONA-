package com.cona.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class WeeklyOvertimeDTO {
    private String week;
    private int hours;
}
