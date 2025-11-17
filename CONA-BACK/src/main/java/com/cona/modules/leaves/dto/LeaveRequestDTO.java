package com.cona.modules.leaves.dto;

import com.cona.modules.leaves.enums.LeaveStatus;
import com.cona.modules.leaves.enums.LeaveType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaveRequestDTO(
        Long id,
        Long employeeId,
        LocalDate startDate,
        LocalDate endDate,
        LeaveType type,
        LeaveStatus status,
        String reason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
