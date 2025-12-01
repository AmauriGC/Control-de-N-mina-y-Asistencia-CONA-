package com.cona.modules.notification.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.cona.kernel.utils.Sanitizer;
import com.cona.kernel.utils.Validations;
import com.cona.exception.types.BusinessException;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${SMTP_USERNAME}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        // Sanitización básica de entrada
        String toEmail = Sanitizer.normalizeEmail(to);
        if (toEmail == null || !toEmail.matches(Validations.EMAIL_REGEX)) {
            throw new BusinessException("INVALID_EMAIL", "Correo no permitido o inválido");
        }
        String safeSubject = Sanitizer.collapseSpaces(subject);
        String safeBody = Sanitizer.sanitizeString(body);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject(safeSubject != null ? safeSubject : "");
        message.setText(safeBody != null ? safeBody : "");
        try {
            mailSender.send(message);
        } catch (Exception e) {
            throw new BusinessException("EMAIL_SEND_FAILED", "No se pudo enviar el correo");
        }
    }

    public void sendPasswordResetEmail(String to, String resetUrl) {
        String subject = "Restablecimiento de Contraseña - CONA";
        String body = """
                Hola,
                
                Has solicitado restablecer tu contraseña para CONA.
                
                Haz clic en el siguiente enlace para restablecer tu contraseña:
                %s
                
                Si no solicitaste este cambio, ignora este correo.
                
                Saludos,
                Equipo CONA
                """.formatted(resetUrl);

        sendEmail(to, subject, body);
    }
}
