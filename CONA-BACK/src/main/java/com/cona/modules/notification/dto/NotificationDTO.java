package com.cona.modules.notification.dto;

import com.cona.modules.notification.enums.NotificationType;

import java.time.LocalDateTime;

public record NotificationDTO(
        Long id,
        Long recipientId,
        String message,
        NotificationType type,
        LocalDateTime sentAt,
        Boolean isRead,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
