package com.cona.modules.attendance.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceStatsDto {
    private long totalDays;
    private long presentDays;
    private long lateDays;
    private long absentDays;
}