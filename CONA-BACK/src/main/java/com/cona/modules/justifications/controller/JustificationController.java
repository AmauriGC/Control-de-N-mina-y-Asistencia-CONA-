package com.cona.modules.justifications.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.justifications.controller.dto.JustificationResponse;
import com.cona.modules.justifications.controller.dto.SubmitJustificationRequest;
import com.cona.modules.justifications.enums.DocumentType;
import com.cona.modules.justifications.service.JustificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/justifications")
public class JustificationController {

    private final JustificationService service;

    @GetMapping("")
    public ApiResponse<List<JustificationResponse>> listAll() {
        return ApiResponse.success("Justificaciones obtenidas", service.listAll());
    }

    @GetMapping("/employee/{employeeId}")
    public ApiResponse<List<JustificationResponse>> listByEmployee(@PathVariable Long employeeId) {
        return ApiResponse.success("Justificaciones obtenidas", service.listByEmployee(employeeId));
    }

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<JustificationResponse> submit(
            @RequestPart("payload") @Valid SubmitJustificationRequest payload,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        JustificationResponse res = service.submit(
                payload.employeeId(),
                payload.attendanceId(),
                payload.reason(),
                payload.documentType(),
                file
        );
        return ApiResponse.success("Justificación enviada", res);
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<JustificationResponse> approve(@PathVariable Long id,
                                                       @RequestParam Long adminUserId,
                                                       @RequestParam(required = false) String adminComments) {
        return ApiResponse.success("Justificación aprobada", service.approve(id, adminUserId, adminComments));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<JustificationResponse> reject(@PathVariable Long id,
                                                      @RequestParam Long adminUserId,
                                                      @RequestParam(required = false) String adminComments) {
        return ApiResponse.success("Justificación rechazada", service.reject(id, adminUserId, adminComments));
    }
}
