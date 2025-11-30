package com.cona.modules.system_config.service;

import com.cona.modules.system_config.controller.dto.WorkScheduleRequest;
import com.cona.modules.system_config.controller.dto.WorkScheduleResponse;
import com.cona.modules.system_config.entity.WorkSchedule;
import com.cona.modules.system_config.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;

    private WorkScheduleResponse toDto(WorkSchedule entity) {
        WorkScheduleResponse dto = new WorkScheduleResponse();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setEntryTime(entity.getStartTime());
        dto.setExitTime(entity.getEndTime());
        dto.setToleranceMinutes(entity.getToleranceMinutes());
        dto.setDescription(entity.getDescription());
        dto.setActive(entity.getActive());
        dto.setTotalHoursPerDay(entity.getTotalHoursPerDay());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    @Transactional
    public WorkScheduleResponse create(WorkScheduleRequest request) {
        WorkSchedule entity = new WorkSchedule();
        entity.setName(request.getName());
        entity.setStartTime(request.getEntryTime());
        entity.setEndTime(request.getExitTime());
        entity.setToleranceMinutes(request.getToleranceMinutes());
        entity.setDescription(request.getDescription());
        entity.setActive(true);

        // Calcular horas totales por día (enteras)
        int totalHours = (int) java.time.Duration.between(entity.getStartTime(), entity.getEndTime()).toHours();
        entity.setTotalHoursPerDay(Math.max(totalHours, 0));

        WorkSchedule saved = workScheduleRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public WorkScheduleResponse update(Long id, WorkScheduleRequest request) {
        WorkSchedule entity = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkSchedule not found"));

        entity.setName(request.getName());
        entity.setStartTime(request.getEntryTime());
        entity.setEndTime(request.getExitTime());
        entity.setToleranceMinutes(request.getToleranceMinutes());
        entity.setDescription(request.getDescription());

        // Recalcular horas totales por día
        int totalHours = (int) java.time.Duration.between(entity.getStartTime(), entity.getEndTime()).toHours();
        entity.setTotalHoursPerDay(Math.max(totalHours, 0));

        WorkSchedule saved = workScheduleRepository.save(entity);
        return toDto(saved);
    }

    public WorkScheduleResponse getById(Long id) {
        WorkSchedule entity = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkSchedule not found"));
        return toDto(entity);
    }

    public List<WorkScheduleResponse> getAll() {
        return workScheduleRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<WorkScheduleResponse> getActive() {
        return workScheduleRepository.findByActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkScheduleResponse toggleStatus(Long id) {
        WorkSchedule entity = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkSchedule not found"));
        entity.setActive(!entity.getActive());
        WorkSchedule saved = workScheduleRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        WorkSchedule entity = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkSchedule not found"));
        workScheduleRepository.delete(entity);
    }
}
