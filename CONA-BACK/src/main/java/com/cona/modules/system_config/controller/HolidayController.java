package com.cona.modules.system_config.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.system_config.controller.dto.HolidayRequest;
import com.cona.modules.system_config.controller.dto.HolidayResponse;
import com.cona.modules.system_config.enums.HolidayType;
import com.cona.modules.system_config.service.HolidayService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/system-config/holidays")
@RequiredArgsConstructor
public class HolidayController {

    private final HolidayService service;

    @PostMapping
    public ApiResponse<HolidayResponse> create(@Valid @RequestBody HolidayRequest request) {
        HolidayResponse response = service.create(request);
        return ApiResponse.success("Día festivo creado exitosamente", response);
    }

    @PutMapping("/{id}")
    public ApiResponse<HolidayResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody HolidayRequest request
    ) {
        HolidayResponse response = service.update(id, request);
        return ApiResponse.success("Día festivo actualizado exitosamente", response);
    }

    @GetMapping("/{id}")
    public ApiResponse<HolidayResponse> getById(@PathVariable Long id) {
        HolidayResponse response = service.getById(id);
        return ApiResponse.success("Día festivo obtenido exitosamente", response);
    }

    @GetMapping
    public ApiResponse<List<HolidayResponse>> getAll(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) HolidayType type,
            @RequestParam(required = false) Boolean upcoming
    ) {
        List<HolidayResponse> responses = service.getAll(year, type, upcoming);
        return ApiResponse.success("Días festivos obtenidos exitosamente", responses);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Día festivo eliminado exitosamente");
    }
}