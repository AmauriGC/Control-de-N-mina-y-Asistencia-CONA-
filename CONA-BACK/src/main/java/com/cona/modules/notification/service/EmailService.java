package com.cona.modules.notification.service;

import com.cona.exception.types.BusinessException;
import com.cona.kernel.utils.Sanitizer;
import com.cona.kernel.utils.Validations;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${SMTP_USERNAME}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String bodyHtml) {

        // Sanitizar entrada
        String toEmail = Sanitizer.normalizeEmail(to);
        if (toEmail == null || !toEmail.matches(Validations.EMAIL_REGEX)) {
            throw new BusinessException("INVALID_EMAIL", "Correo no permitido o inválido");
        }

        String safeSubject = Sanitizer.collapseSpaces(subject);
        String safeBodyHtml = Sanitizer.sanitizeString(bodyHtml);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(safeSubject != null ? safeSubject : "");

            // HTML template minimalista CONA
            String htmlTemplate = """
                    <table width='100%%' cellpadding='0' cellspacing='0'
                           style='font-family: Arial, sans-serif; background-color:#AFC2C3; padding:30px 0;'>
                        <tr>
                            <td align='center'>
                                <table width='600' cellpadding='0' cellspacing='0'
                                       style='background-color:#ffffff; border-radius:6px;'>

                                    <!-- Header -->
                                    <tr>
                                        <td style='background-color:#709486; padding:18px; text-align:center;'>
                                            <h2 style='color:#ffffff; margin:0; font-size:20px; font-weight:600;'>
                                                CONA · Control de Nómina y Asistencia
                                            </h2>
                                        </td>
                                    </tr>

                                    <!-- Content -->
                                    <tr>
                                        <td style='padding:28px; color:#333333; font-size:14px; line-height:1.6;'>
                                            %s
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style='padding:18px; text-align:center; font-size:11px;
                                                   color:#555555; background-color:#f7f7f7;'>
                                            Este correo fue generado automáticamente por el sistema CONA.
                                            No respondas a este mensaje.
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                    """.formatted(safeBodyHtml);

            helper.setText(htmlTemplate, true);
            mailSender.send(mimeMessage);

        } catch (Exception e) {
            // Log detallado para diagnóstico (pero no exponerlo al cliente)
            log.error("Fallo al enviar correo a {}: {}", to, e.getMessage(), e);
            throw new BusinessException("EMAIL_SEND_FAILED", "No se pudo enviar el correo");
        }
    }

    public void sendWelcomeEmail(String to, String subject, String employeeKey, String password) {
        String body = """
                <p>Hola,</p>
                <p>Bienvenido a CONA. Tu cuenta ha sido creada exitosamente.</p>

                <p>Tu numero de empleado es: <strong>%s</strong></p>
                <p><strong>Para iniciar sesion en el sistema<strong></p>
                <p>Correo electronico: <strong>%s</strong></p>
                <p>Contraseña: <strong>%s</strong></p>


                <p>Saludos,<br/>Equipo CONA</p>
                """.formatted(employeeKey, to, password);

        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String resetUrl) {
        String subject = "Restablecimiento de Contraseña - CONA";

        // Texto dentro del HTML (solo contenido, sin estructura)
        String body = """
                <p>Hola,</p>
                <p>Has solicitado restablecer tu contraseña para CONA.</p>

                <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                <p><a href="%s" style="color:#709486; font-weight:bold;">Restablecer contraseña</a></p>

                <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
                <p>Saludos,<br/>Equipo CONA</p>
                """.formatted(resetUrl);

        sendEmail(to, subject, body);
    }

    public void sendEmailWithAttachment(String to, String subject, String bodyHtml,
                                        String attachmentName, byte[] attachmentBytes, String contentType) {
        String toEmail = Sanitizer.normalizeEmail(to);
        if (toEmail == null || !toEmail.matches(Validations.EMAIL_REGEX)) {
            throw new BusinessException("INVALID_EMAIL", "Correo no permitido o inválido");
        }

        String safeSubject = Sanitizer.collapseSpaces(subject);
        String safeBodyHtml = Sanitizer.sanitizeString(bodyHtml);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(safeSubject != null ? safeSubject : "");

            String htmlTemplate = """
                    <table width='100%%' cellpadding='0' cellspacing='0'
                           style='font-family: Arial, sans-serif; background-color:#AFC2C3; padding:30px 0;'>
                        <tr>
                            <td align='center'>
                                <table width='600' cellpadding='0' cellspacing='0'
                                       style='background-color:#ffffff; border-radius:6px;'>

                                    <tr>
                                        <td style='background-color:#709486; padding:18px; text-align:center;'>
                                            <h2 style='color:#ffffff; margin:0; font-size:20px; font-weight:600;'>
                                                CONA · Control de Nómina y Asistencia
                                            </h2>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style='padding:28px; color:#333333; font-size:14px; line-height:1.6;'>
                                            %s
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style='padding:18px; text-align:center; font-size:11px;
                                                   color:#555555; background-color:#f7f7f7;'>
                                            Este correo fue generado automáticamente por el sistema CONA.
                                            No respondas a este mensaje.
                                        </td>
                                    </tr>

                                </table>
                            </td>
                        </tr>
                    </table>
                    """.formatted(safeBodyHtml);

            helper.setText(htmlTemplate, true);

            if (attachmentBytes != null && attachmentBytes.length > 0) {
                jakarta.mail.util.ByteArrayDataSource dataSource = new jakarta.mail.util.ByteArrayDataSource(attachmentBytes, contentType);
                helper.addAttachment(attachmentName != null ? attachmentName : "archivo.pdf", dataSource);
            }

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            log.error("Fallo al enviar correo con adjunto a {}: {}", to, e.getMessage(), e);
            throw new BusinessException("EMAIL_SEND_FAILED", "No se pudo enviar el correo");
        }
    }
}
