package com.cona.modules.justifications.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.auth.entity.User;
import com.cona.modules.auth.repository.UserRepository;
import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.justifications.dto.*;
import com.cona.modules.justifications.service.JustificationService;
import com.cona.exception.types.BusinessException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/justifications")
@RequiredArgsConstructor
@Validated
public class JustificationController {

    private final JustificationService justificationService;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    // REGISTRAR JUSTIFICACIÓN (Empleado)
    @PostMapping
    public ApiResponse<JustificationResponseDto> createJustification(@Valid @RequestBody JustificationRequestDto request, Authentication authentication) {
        Long employeeId = getCurrentEmployeeId(authentication);
        return justificationService.createJustification(request, employeeId);
    }

    // CONSULTAR JUSTIFICACIONES (Admin) - Todas las justificaciones con filtros
    @GetMapping
    public ApiResponse<Page<JustificationResponseDto>> getJustifications(@Valid JustificationFilterDto filter) {
        return justificationService.getJustifications(filter);
    }

    // CONSULTAR MIS JUSTIFICACIONES (Empleado) - Solo las del empleado logueado
    @GetMapping("/my-justifications")
    public ApiResponse<Page<JustificationResponseDto>> getMyJustifications(@Valid JustificationFilterDto filter, Authentication authentication) {
        Long employeeId = getCurrentEmployeeId(authentication);
        return justificationService.getMyJustifications(employeeId, filter);
    }

    // APROBAR/RECHAZAR JUSTIFICACIÓN (Admin)
    @PatchMapping("/{justificationId}/decision")
    public ApiResponse<JustificationResponseDto> processJustification(
            @PathVariable Long justificationId,
            @Valid @RequestBody JustificationDecisionDto decision,
            Authentication authentication) {
        Long adminId = getCurrentUserId(authentication);
        return justificationService.processJustification(justificationId, decision, adminId);
    }

    // OBTENER JUSTIFICACIÓN POR ID
    @GetMapping("/{id}")
    public ApiResponse<JustificationResponseDto> getJustificationById(@PathVariable Long id) {
        return justificationService.getJustificationById(id);
    }

    // OBTENER CONTEO DE JUSTIFICACIONES PENDIENTES (Admin)
    @GetMapping("/pending-count")
    public ApiResponse<Long> getPendingJustificationsCount() {
        return justificationService.getPendingJustificationsCount();
    }

    // MÉTODOS AUXILIARES PRIVADOS
    private Long getCurrentUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Usuario no encontrado"));
        return user.getId();
    }

    private Long getCurrentEmployeeId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new BusinessException("USER_NOT_FOUND", "Usuario no encontrado"));
        
        Employee employee = employeeRepository.findByUserId(user.getId())
            .orElseThrow(() -> new BusinessException("EMPLOYEE_NOT_FOUND", "Empleado no encontrado"));
        
        return employee.getId();
    }
}