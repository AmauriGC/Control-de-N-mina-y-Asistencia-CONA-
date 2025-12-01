package com.cona.modules.system_config.service;

import com.cona.exception.types.BusinessException;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.system_config.controller.dto.WorkScheduleRequest;
import com.cona.modules.system_config.controller.dto.WorkScheduleResponse;
import com.cona.modules.system_config.entity.WorkSchedule;
import com.cona.modules.system_config.repository.WorkScheduleRepository;
import com.cona.kernel.utils.Sanitizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;
    private final EmployeeRepository employeeRepository;

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
        entity.setName(Sanitizer.sanitizeString(request.getName()));
        entity.setStartTime(request.getEntryTime());
        entity.setEndTime(request.getExitTime());
        entity.setToleranceMinutes(request.getToleranceMinutes());
        entity.setDescription(Sanitizer.sanitizeComment(request.getDescription()));
        entity.setActive(true);

        int totalHours = (int) java.time.Duration.between(
                entity.getStartTime(),
                entity.getEndTime()
        ).toHours();
        entity.setTotalHoursPerDay(Math.max(totalHours, 0));

        WorkSchedule saved = workScheduleRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public WorkScheduleResponse update(Long id, WorkScheduleRequest request) {
        WorkSchedule entity = workScheduleRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("WORKSCHEDULE_NOT_FOUND", "El horario de trabajo no existe"));

        entity.setName(Sanitizer.sanitizeString(request.getName()));
        entity.setStartTime(request.getEntryTime());
        entity.setEndTime(request.getExitTime());
        entity.setToleranceMinutes(request.getToleranceMinutes());
        entity.setDescription(Sanitizer.sanitizeComment(request.getDescription()));

        int totalHours = (int) java.time.Duration.between(
                entity.getStartTime(),
                entity.getEndTime()
        ).toHours();
        entity.setTotalHoursPerDay(Math.max(totalHours, 0));

        WorkSchedule saved = workScheduleRepository.save(entity);
        return toDto(saved);
    }

    public WorkScheduleResponse getById(Long id) {
        WorkSchedule entity = workScheduleRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("WORKSCHEDULE_NOT_EXIST", "El horario de trabajo no existe"));
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
                .orElseThrow(() ->
                        new BusinessException("WORKSCHEDULE_NOT_FOUND", "El horario de trabajo no existe"));

        entity.setActive(!entity.getActive());
        WorkSchedule saved = workScheduleRepository.save(entity);
        return toDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        WorkSchedule entity = workScheduleRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("WORKSCHEDULE_NOT_FOUND", "El horario de trabajo no existe"));

        if (employeeRepository.existsByWorkSchedule(entity)) {
            throw new BusinessException(
                    "WORKSCHEDULE_IN_USE",
                    "El horario está siendo usado por empleados y no puede eliminarse"
            );
        }

        workScheduleRepository.delete(entity);
    }
}
