package com.cona.modules.justifications.dto;

import com.cona.modules.justifications.enums.DocumentType;
import com.cona.modules.justifications.enums.JustificationStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class JustificationResponseDto {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private LocalDate date;
    private String reason;
    private DocumentType documentType;
    private String documentPath;
    private JustificationStatus status;
    private String adminComments;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
