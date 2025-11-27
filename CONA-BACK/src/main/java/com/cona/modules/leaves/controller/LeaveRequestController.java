package com.cona.modules.leaves.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.leaves.controller.dto.LeaveRequestDto;
import com.cona.modules.leaves.controller.dto.LeaveRequestResponseDto;
import com.cona.modules.leaves.controller.dto.LeaveReviewDto;
import com.cona.modules.leaves.service.LeaveRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {
    
    private final LeaveRequestService leaveRequestService;
    
    @PostMapping("/user/{userId}")
    public ApiResponse<LeaveRequestResponseDto> createRequest(@PathVariable Long userId,
                                                            @Valid @RequestBody LeaveRequestDto dto) {
        LeaveRequestResponseDto response = leaveRequestService.createRequest(dto, userId);
        return ApiResponse.success("Solicitud de permiso creada exitosamente", response);
    }
    
    @GetMapping
    public ApiResponse<Page<LeaveRequestResponseDto>> getAllRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String employeeName) {
        Page<LeaveRequestResponseDto> requests = leaveRequestService.getAllRequests(page, size, status, employeeName);
        return ApiResponse.success("Solicitudes obtenidas exitosamente", requests);
    }
    
    @GetMapping("/user/{userId}/requests")
    public ApiResponse<List<LeaveRequestResponseDto>> getMyRequests(@PathVariable Long userId) {
        List<LeaveRequestResponseDto> requests = leaveRequestService.getEmployeeRequests(userId);
        return ApiResponse.success("Mis solicitudes obtenidas exitosamente", requests);
    }
    
    @GetMapping("/{id}")
    public ApiResponse<LeaveRequestResponseDto> getById(@PathVariable Long id) {
        LeaveRequestResponseDto request = leaveRequestService.getById(id);
        return ApiResponse.success("Solicitud encontrada", request);
    }
    
    @PostMapping("/{id}/review/user/{reviewerId}")
    public ApiResponse<Void> reviewRequest(@PathVariable Long id,
                                         @PathVariable Long reviewerId,
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