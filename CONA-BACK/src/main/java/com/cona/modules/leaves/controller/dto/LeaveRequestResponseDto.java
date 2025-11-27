package com.cona.modules.leaves.controller.dto;

import com.cona.modules.leaves.enums.LeaveStatus;
import com.cona.modules.leaves.enums.LeaveType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestResponseDto {
    
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeKey;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    private Integer totalDays;
    private LeaveType type;
    private LeaveStatus status;
    private String reason;
    
    // For vacation calculations
    private BigDecimal vacationPay;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime requestedAt;
    
    private String reviewComments;
}