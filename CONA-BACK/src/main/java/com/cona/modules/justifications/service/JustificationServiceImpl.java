package com.cona.modules.justifications.service;

import com.cona.exception.types.BusinessException;
import com.cona.modules.attendance.entity.Attendance;
import com.cona.modules.attendance.enums.AttendanceStatus;
import com.cona.modules.attendance.repository.AttendanceRepository;
import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.justifications.controller.dto.JustificationResponse;
import com.cona.modules.justifications.enums.DocumentType;
import com.cona.modules.justifications.enums.JustificationStatus;
import com.cona.modules.justifications.entity.Justification;
import com.cona.modules.justifications.repository.JustificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class JustificationServiceImpl implements JustificationService {

    private final JustificationRepository justificationRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;

    private Path storageRoot() {
        return Paths.get("uploads", "justifications").toAbsolutePath();
    }

    @Override
    public JustificationResponse submit(Long employeeId, Long attendanceId, String reason, DocumentType documentType, MultipartFile file) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado"));
        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new BusinessException("ATTENDANCE_NOT_FOUND", "Registro de asistencia no encontrado"));

        if (!attendance.getEmployee().getId().equals(employee.getId())) {
            throw new BusinessException("INVALID_ATTENDANCE", "La asistencia no pertenece al empleado");
        }
        if (attendance.getStatus() != AttendanceStatus.ABSENT) {
            throw new BusinessException("NOT_ABSENT", "Solo se pueden justificar faltas");
        }
        long days = ChronoUnit.DAYS.between(attendance.getDate(), LocalDate.now());
        if (days > 2) {
            throw new BusinessException("JUSTIFICATION_WINDOW_EXPIRED", "El periodo para justificar ha vencido");
        }
        justificationRepository.findByAttendanceId(attendanceId).ifPresent(j -> {
            throw new BusinessException("JUSTIFICATION_ALREADY_EXISTS", "Ya existe una solicitud para esta falta");
        });

        String storedPath = null;
        if (file != null && !file.isEmpty()) {
            try {
                Path root = storageRoot();
                Files.createDirectories(root);
                String filename = employee.getId() + "_" + attendance.getId() + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path target = root.resolve(filename);
                Files.write(target, file.getBytes());
                storedPath = target.toString();
            } catch (IOException e) {
                throw new BusinessException("FILE_UPLOAD_ERROR", "No se pudo almacenar el archivo");
            }
        }

        Justification j = new Justification();
        j.setEmployee(employee);
        j.setAttendance(attendance);
        j.setDate(attendance.getDate());
        j.setReason(reason);
        j.setDocumentType(documentType);
        j.setDocumentPath(storedPath);
        j.setStatus(JustificationStatus.PENDING);
        j = justificationRepository.save(j);
        return map(j);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JustificationResponse> listByEmployee(Long employeeId) {
        return justificationRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId)
                .stream().map(this::map).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JustificationResponse> listAll() {
        return justificationRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::map).toList();
    }

    @Override
    public JustificationResponse approve(Long id, Long adminUserId, String adminComments) {
        Justification j = justificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("JUSTIFICATION_NOT_FOUND", "Justificación no encontrada"));
        j.setStatus(JustificationStatus.APPROVED);
        if (adminComments != null && !adminComments.isBlank()) {
            j.setReviewComments(adminComments.trim());
        }
        // Actualizar asistencia a JUSTIFIED_ABSENCE, sin pago
        Attendance attendance = j.getAttendance();
        if (attendance != null) {
            attendance.setStatus(AttendanceStatus.JUSTIFIED_ABSENCE);
            attendance.setDailySalary(java.math.BigDecimal.ZERO);
            attendanceRepository.save(attendance);
        }
        j = justificationRepository.save(j);
        return map(j);
    }

    @Override
    public JustificationResponse reject(Long id, Long adminUserId, String adminComments) {
        Justification j = justificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("JUSTIFICATION_NOT_FOUND", "Justificación no encontrada"));
        j.setStatus(JustificationStatus.REJECTED);
        if (adminComments != null && !adminComments.isBlank()) {
            j.setReviewComments(adminComments.trim());
        }
        Attendance attendance = j.getAttendance();
        if (attendance != null) {
            attendance.setStatus(AttendanceStatus.JUSTIFICATION_REJECTED);
            attendanceRepository.save(attendance);
        }
        j = justificationRepository.save(j);
        return map(j);
    }

    private JustificationResponse map(Justification j) {
        return new JustificationResponse(
            j.getId(),
            j.getEmployee().getId(),
            j.getAttendance() != null ? j.getAttendance().getId() : null,
            j.getDate(),
            j.getReason(),
            j.getDocumentType(),
            j.getDocumentPath(),
            j.getStatus(),
            j.getReviewComments(),
            j.getCreatedAt()
        );
    }
}
