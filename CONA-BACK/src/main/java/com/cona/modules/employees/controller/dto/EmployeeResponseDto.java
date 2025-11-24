package com.cona.modules.employees.controller.dto;

import com.cona.modules.employees.enums.ContractType;
import com.cona.modules.employees.enums.EmployeeStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EmployeeResponseDto {
    private Long id;
    private String employeeKey;
    private String fullName;
    private String email;
    private String phone;
    private String position;
    private String rfc;
    private BigDecimal hourlyRate;
    private ContractType contractType;
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;
    private EmployeeStatus status;

    private String bankAccount;
    private String bankName;
    private String clabe;
    private Long workSchedule;
}
