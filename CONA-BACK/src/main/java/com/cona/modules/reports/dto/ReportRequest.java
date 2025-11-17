package com.cona.modules.reports.dto;

import com.cona.modules.reports.enums.ReportType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ReportRequest(
        @NotNull(message = "El tipo de reporte es obligatorio")
        ReportType type,

        @NotNull(message = "El ID del generador es obligatorio")
        Long generatedById,

        @NotNull(message = "La fecha de generación es obligatoria")
        LocalDateTime generatedAt,

        @NotBlank(message = "La ruta del archivo es obligatoria")
        String filePath,

        String parameters
) {}
