package com.cona.modules.system_config.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.system_config.controller.dto.PayrollConfigRequest;
import com.cona.modules.system_config.controller.dto.PayrollConfigResponse;
import com.cona.modules.system_config.service.PayrollConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payroll-config")
@RequiredArgsConstructor
public class PayrollConfigController {

    private final PayrollConfigService service;

    // CREATE / UPDATE
    @PutMapping
    public ApiResponse<PayrollConfigResponse> createOrUpdate(@Valid @RequestBody PayrollConfigRequest dto) {
        PayrollConfigResponse response = service.createOrUpdate(dto);
        return ApiResponse.success("Configuración de nómina guardada con éxito", response);
    }

    // READ
    @GetMapping
    public ApiResponse<PayrollConfigResponse> getCurrentConfig() {
        PayrollConfigResponse config = service.getCurrentConfig();
        return ApiResponse.success("Configuración de nómina obtenida", config);
    }
}