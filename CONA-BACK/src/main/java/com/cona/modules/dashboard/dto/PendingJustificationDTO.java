package com.cona.modules.dashboard.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class PendingJustificationDTO {
    private Long id;
    private String employeeName;
    private LocalDate date;
    private Long daysLeft;
}

