package com.cona.modules.leaves.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.leaves.controller.dto.LeaveRequestDto;
import com.cona.modules.leaves.controller.dto.LeaveRequestResponseDto;
import com.cona.modules.leaves.controller.dto.LeaveReviewDto;
import com.cona.modules.leaves.service.LeaveRequestService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave-requests")
@RequiredArgsConstructor
@Validated
public class LeaveRequestController {
    
    private final LeaveRequestService leaveRequestService;

    @PostMapping("/user/{userId}")
    public ApiResponse<LeaveRequestResponseDto> createRequest(@PathVariable @Positive(message = "El ID de usuario debe ser positivo") Long userId,
                                                            @Valid @RequestBody LeaveRequestDto dto) {
        LeaveRequestResponseDto response = leaveRequestService.createRequest(dto, userId);
        return ApiResponse.success("Solicitud de permiso creada exitosamente", response);
    }
    
    @GetMapping
    public ApiResponse<Page<LeaveRequestResponseDto>> getAllRequests(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "El page debe ser >= 0") int page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "El size debe ser >= 1") @Max(value = 100, message = "El size máximo es 100") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String employeeName) {
        Page<LeaveRequestResponseDto> requests = leaveRequestService.getAllRequests(page, size, status, employeeName);
        return ApiResponse.success("Solicitudes obtenidas exitosamente", requests);
    }
    
    @GetMapping("/user/{userId}/requests")
    public ApiResponse<List<LeaveRequestResponseDto>> getMyRequests(@PathVariable @Positive(message = "El ID de usuario debe ser positivo") Long userId) {
        List<LeaveRequestResponseDto> requests = leaveRequestService.getEmployeeRequests(userId);
        return ApiResponse.success("Mis solicitudes obtenidas exitosamente", requests);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<LeaveRequestResponseDto> getById(@PathVariable @Positive(message = "El ID debe ser positivo") Long id) {
        LeaveRequestResponseDto request = leaveRequestService.getById(id);
        return ApiResponse.success("Solicitud encontrada", request);
    }
    
    @PostMapping("/{id}/review/user/{reviewerId}")
    public ApiResponse<Void> reviewRequest(@PathVariable @Positive(message = "El ID debe ser positivo") Long id,
                                         @PathVariable @Positive(message = "El ID de revisor debe ser positivo") Long reviewerId,
                                         @Valid @RequestBody LeaveReviewDto reviewDto) {
        leaveRequestService.reviewRequest(id, reviewDto, reviewerId);
        String message = reviewDto.getApproved() ? "Solicitud aprobada exitosamente" : "Solicitud rechazada";
        return ApiResponse.success(message);
    }
    
    @GetMapping("/stats/pending")
    public ApiResponse<Long> getPendingCount() {
        long count = leaveRequestService.countPendingRequests();
        return ApiResponse.success("Conteo de solicitudes pendientes", count);
    }
}