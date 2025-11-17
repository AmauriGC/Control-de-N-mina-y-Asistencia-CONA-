package com.cona.modules.system_config.dto;

import java.time.LocalDateTime;

public record SystemConfigDTO(
        Long id,
        String key,
        String value,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
