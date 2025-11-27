package com.cona.modules.attendance.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodayAttendanceCountsDto {
    private long presentCount;
    private long activeEmployeesCount;
}
