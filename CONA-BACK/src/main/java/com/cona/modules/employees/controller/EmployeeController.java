package com.cona.modules.employees.controller;

import com.cona.kernel.response.ApiResponse;
import com.cona.modules.employees.controller.dto.EmployeeRequestDto;
import com.cona.modules.employees.controller.dto.EmployeeResponseDto;
import com.cona.modules.employees.service.EmployeeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Validated
public class EmployeeController {

    private final EmployeeService service;

    @PostMapping
    public ApiResponse<EmployeeResponseDto> register(@Valid @RequestBody EmployeeRequestDto dto) {
        return ApiResponse.success("Empleado registrado con éxito", service.register(dto));
    }

    @GetMapping
    public ApiResponse<List<EmployeeResponseDto>> list(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "El page debe ser >= 0") Integer page,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "El size debe ser >= 1") @Max(value = 100, message = "El size máximo es 100") Integer size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status
    ) {
        return ApiResponse.success("Listado obtenido", service.list(page, size, name, status).getContent());
    }

    @GetMapping("/{id}")
    public ApiResponse<EmployeeResponseDto> getById(@PathVariable @Positive(message = "El ID debe ser positivo") Long id) {
        return ApiResponse.success("Empleado encontrado", service.getById(id));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<Void> toggleStatus(@PathVariable @Positive(message = "El ID debe ser positivo") Long id) {
        service.toggleStatus(id);
        return ApiResponse.success("Estado de empleado actualizado con éxito");
    }

    @PutMapping("/{id}")
    public ApiResponse<EmployeeResponseDto> update(@PathVariable @Positive(message = "El ID debe ser positivo") Long id, @Valid @RequestBody EmployeeRequestDto dto) {
        return ApiResponse.success("Empleado actualizado correctamente", service.update(id, dto));
    }

    @GetMapping("/by-user/{userId}")
    public ApiResponse<EmployeeResponseDto> getByUserId(@PathVariable @Positive(message = "El ID de usuario debe ser positivo") Long userId) {
        EmployeeResponseDto response = service.getByUserId(userId);
        return ApiResponse.success("Empleado obtenido exitosamente", response);
    }

}
