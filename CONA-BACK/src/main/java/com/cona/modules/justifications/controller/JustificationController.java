package com.cona.modules.justifications.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.kernel.response.FileDownloadResponse;
import com.cona.modules.justifications.controller.dto.JustificationResponse;
import com.cona.modules.justifications.controller.dto.SubmitJustificationRequest;
import com.cona.modules.justifications.service.JustificationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/justifications")
@Validated
public class JustificationController {

    private final JustificationService service;

    @GetMapping("")
    public ApiResponse<List<JustificationResponse>> listAll() {
        return ApiResponse.success("Justificaciones obtenidas", service.listAll());
    }

    @GetMapping("/{id}/file")
    public ApiResponse<FileDownloadResponse> getFile(@PathVariable @Positive(message = "El ID debe ser positivo") Long id) {
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
            String base64 = Base64.getEncoder().encodeToString(bytes);
            FileDownloadResponse file = new FileDownloadResponse(filename, contentType, base64, bytes.length);
            return ApiResponse.success("Archivo obtenido", file);
        } catch (IOException e) {
            throw new com.cona.exception.types.BusinessException("FILE_READ_ERROR", "No se pudo leer el archivo");
        }
    }

    @GetMapping("/{id}/file/raw")
    public ResponseEntity<byte[]> getFileRaw(@PathVariable @Positive(message = "El ID debe ser positivo") Long id) {
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
            return ResponseEntity
                    .ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=" + filename)
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .contentLength(bytes.length)
                    .body(bytes);
        } catch (IOException e) {
            throw new com.cona.exception.types.BusinessException("FILE_READ_ERROR", "No se pudo leer el archivo");
        }
    }

    @GetMapping("/employee/{employeeId}")
    public ApiResponse<List<JustificationResponse>> listByEmployee(@PathVariable @Positive(message = "El ID debe ser positivo") Long employeeId) {
        return ApiResponse.success("Justificaciones obtenidas", service.listByEmployee(employeeId));
    }

    @PostMapping(value = "", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<JustificationResponse> submit(
            @RequestPart("payload") @Valid SubmitJustificationRequest payload,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        var res = service.submit(payload.employeeId(), payload.attendanceId(), payload.reason(), payload.documentType(), file);
        return ApiResponse.success("Justificación enviada", res);
    }

    @PostMapping("/{id}/approve")
    public ApiResponse<JustificationResponse> approve(@PathVariable @Positive(message = "El ID debe ser positivo") Long id,
                                                      @RequestParam @Positive(message = "El ID de admin debe ser positivo") Long adminUserId,
                                                      @RequestParam(required = false) String adminComments) {
        return ApiResponse.success("Justificación aprobada", service.approve(id, adminUserId, adminComments));
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<JustificationResponse> reject(@PathVariable @Positive(message = "El ID debe ser positivo") Long id,
                                                     @RequestParam @Positive(message = "El ID de admin debe ser positivo") Long adminUserId,
                                                     @RequestParam(required = false) String adminComments) {
        return ApiResponse.success("Justificación rechazada", service.reject(id, adminUserId, adminComments));
    }
}
