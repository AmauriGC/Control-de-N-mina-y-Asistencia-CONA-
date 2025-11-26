package com.cona.modules.justifications.service;

import com.cona.exception.types.BusinessException;
import com.cona.kernel.response.ApiResponse;
import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.justifications.dto.*;
import com.cona.modules.justifications.entity.Justification;
import com.cona.modules.justifications.enums.JustificationStatus;
import com.cona.modules.justifications.repository.JustificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class JustificationService {

    private final JustificationRepository justificationRepository;
    private final EmployeeRepository employeeRepository;

    // REGISTRAR JUSTIFICACIÓN (Empleado)
    @Transactional
    public ApiResponse<JustificationResponseDto> createJustification(JustificationRequestDto request, Long employeeId) {
        try {
            Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado"));

            // Validar que la fecha no sea futura
            if (request.getDate().isAfter(LocalDate.now())) {
                throw new BusinessException("", "No se puede justificar una fecha futura");
            }

            // Validar que no tenga una justificación pendiente o aprobada para esa fecha
            if (justificationRepository.existsByEmployeeAndDate(employee, request.getDate())) {
                throw new BusinessException("", "Ya existe una justificación para esta fecha");
            }

            // Crear justificación
            Justification justification = new Justification();
            justification.setEmployee(employee);
            justification.setDate(request.getDate());
            justification.setReason(request.getReason());
            justification.setDocumentType(request.getDocumentType());
            justification.setDocumentPath(request.getDocumentPath());
            justification.setStatus(JustificationStatus.PENDING);

            justificationRepository.save(justification);
            
            log.info("Justificación creada - ID: {}, Empleado: {}, Fecha: {}", 
                    justification.getId(), employee.getFullName(), request.getDate());

            return ApiResponse.success("Justificación registrada con éxito", mapToResponse(justification));

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error al crear justificación: {}", e.getMessage(), e);
            throw new BusinessException("", "Error al registrar la justificación");
        }
    }

    // CONSULTAR JUSTIFICACIONES (Admin/Empleado)
    @Transactional(readOnly = true)
    public ApiResponse<Page<JustificationResponseDto>> getJustifications(JustificationFilterDto filter) {
        try {
            Page<Justification> justifications = justificationRepository.findByFilters(
                filter.getEmployeeId(),
                filter.getStatus(),
                filter.getDocumentType(),
                filter.getStartDate(),
                filter.getEndDate(),
                filter.toPageable()
            );

            return ApiResponse.success("Justificaciones obtenidas exitosamente", 
                                     justifications.map(this::mapToResponse));

        } catch (Exception e) {
            log.error("Error al obtener justificaciones: {}", e.getMessage(), e);
            throw new BusinessException("", "Error al obtener las justificaciones");
        }
    }

    // CONSULTAR MIS JUSTIFICACIONES (Empleado)
    @Transactional(readOnly = true)
    public ApiResponse<Page<JustificationResponseDto>> getMyJustifications(Long employeeId, JustificationFilterDto filter) {
        try {
            Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("", "Empleado no encontrado"));

            filter.setEmployeeId(employeeId); // Forzar que solo vea sus propias justificaciones
            Page<Justification> justifications = justificationRepository.findByFilters(
                filter.getEmployeeId(),
                filter.getStatus(),
                filter.getDocumentType(),
                filter.getStartDate(),
                filter.getEndDate(),
                filter.toPageable()
            );

            return ApiResponse.success("Mis justificaciones obtenidas exitosamente", 
                                     justifications.map(this::mapToResponse));

        } catch (Exception e) {
            log.error("Error al obtener mis justificaciones: {}", e.getMessage(), e);
            throw new BusinessException("", "Error al obtener las justificaciones");
        }
    }

    // APROBAR/RECHAZAR JUSTIFICACIÓN (Admin)
    @Transactional
    public ApiResponse<JustificationResponseDto> processJustification(Long justificationId, JustificationDecisionDto decision, Long adminId) {
        try {
            Justification justification = justificationRepository.findById(justificationId)
                .orElseThrow(() -> new BusinessException("","Justificación no encontrada"));

            if (justification.getStatus() != JustificationStatus.PENDING) {
                throw new BusinessException("", "La justificación ya fue procesada");
            }

            if (decision.getApproved()) {
                justification.setStatus(JustificationStatus.APPROVED);
                log.info("Justificación APROBADA - ID: {}, Empleado: {}", 
                        justificationId, justification.getEmployee().getFullName());
            } else {
                justification.setStatus(JustificationStatus.REJECTED);
                log.info("Justificación RECHAZADA - ID: {}, Empleado: {}", 
                        justificationId, justification.getEmployee().getFullName());
            }

            justification.setAdminComments(decision.getComments());
            justification.setReviewedAt(LocalDateTime.now());
            justification.setReviewedBy(adminId);

            justificationRepository.save(justification);

            return ApiResponse.success(
                "Justificación " + (decision.getApproved() ? "aprobada" : "rechazada") + " exitosamente",
                mapToResponse(justification)
            );

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error al procesar justificación: {}", e.getMessage(), e);
            throw new BusinessException("", "Error al procesar la justificación");
        }
    }

    // OBTENER JUSTIFICACIÓN POR ID
    @Transactional(readOnly = true)
    public ApiResponse<JustificationResponseDto> getJustificationById(Long id) {
        try {
            Justification justification = justificationRepository.findById(id)
                .orElseThrow(() -> new BusinessException("", "Justificación no encontrada"));

            return ApiResponse.success("Justificación obtenida exitosamente", mapToResponse(justification));

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error al obtener justificación: {}", e.getMessage(), e);
            throw new BusinessException("", "Error al obtener la justificación");
        }
    }

    // OBTENER ESTADÍSTICAS DE JUSTIFICACIONES
    @Transactional(readOnly = true)
    public ApiResponse<Long> getPendingJustificationsCount() {
        try {
            long count = justificationRepository.countPending();
            return ApiResponse.success("Conteo obtenido exitosamente", count);
        } catch (Exception e) {
            log.error("Error al obtener conteo de justificaciones pendientes: {}", e.getMessage(), e);
            throw new BusinessException("", "Error al obtener el conteo");
        }
    }

    // MÉTODOS AUXILIARES PRIVADOS
    private JustificationResponseDto mapToResponse(Justification justification) {
        JustificationResponseDto response = new JustificationResponseDto();
        response.setId(justification.getId());
        response.setEmployeeId(justification.getEmployee().getId());
        response.setEmployeeName(justification.getEmployee().getFullName());
        response.setEmployeeEmail(justification.getEmployee().getUser().getEmail());
        response.setDate(justification.getDate());
        response.setReason(justification.getReason());
        response.setDocumentType(justification.getDocumentType());
        response.setDocumentPath(justification.getDocumentPath());
        response.setStatus(justification.getStatus());
        response.setAdminComments(justification.getAdminComments());
        response.setReviewedAt(justification.getReviewedAt());
        response.setCreatedAt(justification.getCreatedAt());
        response.setUpdatedAt(justification.getUpdatedAt());
        return response;
    }
}