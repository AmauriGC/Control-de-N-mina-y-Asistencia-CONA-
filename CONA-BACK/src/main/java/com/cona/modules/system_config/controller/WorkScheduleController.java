package com.cona.modules.system_config.controller;


import com.cona.kernel.response.ApiResponse;
import com.cona.modules.system_config.dto.WorkScheduleRequest;
import com.cona.modules.system_config.dto.WorkScheduleResponse;
import com.cona.modules.system_config.service.WorkScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-schedules")
@RequiredArgsConstructor
public class WorkScheduleController {

    private final WorkScheduleService service;

    // Crear
    @PostMapping
    public ResponseEntity<WorkScheduleResponse> create(@RequestBody WorkScheduleRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    // Actualizar
    @PutMapping("/{id}")
    public ResponseEntity<WorkScheduleResponse> update(
            @PathVariable Long id,
            @RequestBody WorkScheduleRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }

    // Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<WorkScheduleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // Obtener todos
    @GetMapping
    public ResponseEntity<List<WorkScheduleResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // Eliminar
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Activar
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Void> activate(@PathVariable Long id) {
        service.activate(id);
        return ResponseEntity.noContent().build();
    }

    // Desactivar
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
