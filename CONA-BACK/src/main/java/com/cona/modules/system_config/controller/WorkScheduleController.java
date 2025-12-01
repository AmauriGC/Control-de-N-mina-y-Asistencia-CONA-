package com.cona.modules.system_config.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.system_config.controller.dto.WorkScheduleRequest;
import com.cona.modules.system_config.controller.dto.WorkScheduleResponse;
import com.cona.modules.system_config.service.WorkScheduleService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/system-config/work-schedules")
@RequiredArgsConstructor
@Validated
public class WorkScheduleController {

    private final WorkScheduleService service;

    @PostMapping
    public ApiResponse<WorkScheduleResponse> create(@Valid @RequestBody WorkScheduleRequest request) {
        WorkScheduleResponse response = service.create(request);
        return ApiResponse.success("Horario de trabajo creado exitosamente", response);
    }

    @PutMapping("/{id}")
    public ApiResponse<WorkScheduleResponse> update(
            @PathVariable @Positive(message = "El ID debe ser positivo") Long id,
            @Valid @RequestBody WorkScheduleRequest request
    ) {
        WorkScheduleResponse response = service.update(id, request);
        return ApiResponse.success("Horario de trabajo actualizado exitosamente", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<WorkScheduleResponse> getById(@PathVariable @Positive(message = "El ID debe ser positivo") Long id) {
        WorkScheduleResponse response = service.getById(id);
        return ApiResponse.success("Horario de trabajo obtenido exitosamente", response);
    }

    @GetMapping
    public ApiResponse<List<WorkScheduleResponse>> getAll() {
        List<WorkScheduleResponse> responses = service.getAll();
        return ApiResponse.success("Horarios de trabajo obtenidos exitosamente", responses);
    }

    @GetMapping("/active")
    public ApiResponse<List<WorkScheduleResponse>> getActive() {
        List<WorkScheduleResponse> responses = service.getActive();
        return ApiResponse.success("Horarios de trabajo activos obtenidos exitosamente", responses);
    }

    @PutMapping("/{id}/toggle-status")
    public ApiResponse<WorkScheduleResponse> toggleStatus(@PathVariable @Positive(message = "El ID debe ser positivo") Long id) {
        WorkScheduleResponse response = service.toggleStatus(id);
        return ApiResponse.success("Estado del horario cambiado exitosamente", response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable @Positive(message = "El ID debe ser positivo") Long id) {
        service.delete(id);
        return ApiResponse.success("Horario de trabajo eliminado exitosamente");
    }
}
