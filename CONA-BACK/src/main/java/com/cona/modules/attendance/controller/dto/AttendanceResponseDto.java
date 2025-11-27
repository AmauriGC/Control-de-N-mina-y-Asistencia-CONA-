package com.cona.modules.attendance.controller.dto;

import com.cona.modules.attendance.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceResponseDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeKey;
    private LocalDate date;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Double hoursWorked;
    private BigDecimal dailySalary;
    private AttendanceStatus status;
    private String comments;
}