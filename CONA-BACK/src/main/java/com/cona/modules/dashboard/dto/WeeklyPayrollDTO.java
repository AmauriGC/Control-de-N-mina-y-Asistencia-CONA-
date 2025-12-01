package com.cona.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class WeeklyPayrollDTO {
    private LocalDate weekStart;
    private LocalDate weekEnd;
    private Double totalPayroll;


}


