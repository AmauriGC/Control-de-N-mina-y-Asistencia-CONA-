package com.cona.modules.dashboard.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class ContractAlertDTO {
    private Long id;
    private String employeeName;
    private LocalDate endDate;
    private long daysRemaining;
    private String priority;
}

