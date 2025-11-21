package com.cona.modules.notification.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${SMTP_USERNAME}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
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
