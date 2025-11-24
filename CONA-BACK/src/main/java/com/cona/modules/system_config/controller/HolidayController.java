package com.cona.modules.system_config.controller;

import com.cona.modules.system_config.controller.dto.HolidayRequest;
import com.cona.modules.system_config.controller.dto.HolidayResponse;
import com.cona.modules.system_config.enums.HolidayType;
import com.cona.modules.system_config.service.HolidayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayService service;

    @PostMapping
    public ResponseEntity<HolidayResponse> create(@Valid @RequestBody HolidayRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HolidayResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody HolidayRequest request
    ) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HolidayResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<HolidayResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<HolidayResponse>> getByYear(@PathVariable int year) {
        return ResponseEntity.ok(service.getByYear(year));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<HolidayResponse>> getByType(@PathVariable HolidayType type) {
        return ResponseEntity.ok(service.getByType(type));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<HolidayResponse>> getUpcoming() {
        return ResponseEntity.ok(service.getUpcoming());
    }
}
