package com.cona.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WeeklyAttendanceDTO {
    private String day;     // "Lun", "Mar", "Mié"...
    private long present;
    private long late;
    private long absent;
}
