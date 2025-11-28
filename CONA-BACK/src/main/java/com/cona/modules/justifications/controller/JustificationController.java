package com.cona.modules.justifications.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.justifications.controller.dto.JustificationResponse;
import com.cona.modules.justifications.controller.dto.SubmitJustificationRequest;
import com.cona.modules.justifications.enums.DocumentType;
import com.cona.modules.justifications.service.JustificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @GetMapping("/{id}/file")
    public ResponseEntity<byte[]> getFile(@PathVariable Long id) {
        var j = service.listAll().stream().filter(x -> x.id().equals(id)).findFirst()
                .orElseThrow(() -> new com.cona.exception.types.BusinessException("JUSTIFICATION_NOT_FOUND", "Justificación no encontrada"));
        if (j.documentPath() == null || j.documentPath().isBlank()) {
            throw new com.cona.exception.types.BusinessException("FILE_NOT_FOUND", "La justificación no tiene documento adjunto");
        }
        try {
            Path path = Paths.get(j.documentPath());
            byte[] bytes = Files.readAllBytes(path);
            String contentType = Files.probeContentType(path);
            if (contentType == null) contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            String filename = path.getFileName().toString();
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                    .body(bytes);
        } catch (IOException e) {
            throw new com.cona.exception.types.BusinessException("FILE_READ_ERROR", "No se pudo leer el archivo");
        }
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
