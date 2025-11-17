package com.cona.modules.notification.dto;

import com.cona.modules.notification.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record NotificationRequest(
        @NotNull(message = "El ID del destinatario es obligatorio")
        Long recipientId,

        @NotBlank(message = "El mensaje es obligatorio")
        @Size(max = 1000, message = "El mensaje debe tener menos de 1000 caracteres")
        String message,

        @NotNull(message = "El tipo de notificación es obligatorio")
        NotificationType type,

        LocalDateTime sentAt,

        @NotNull(message = "El indicador de leído es obligatorio")
        Boolean isRead
) {}
