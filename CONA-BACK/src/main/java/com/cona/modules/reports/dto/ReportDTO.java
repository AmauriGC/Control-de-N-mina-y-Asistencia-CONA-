package com.cona.modules.reports.dto;

import com.cona.modules.reports.enums.ReportType;

import java.time.LocalDateTime;

public record ReportDTO(
        Long id,
        ReportType type,
        Long generatedById,
        LocalDateTime generatedAt,
        String filePath,
        String parameters,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
