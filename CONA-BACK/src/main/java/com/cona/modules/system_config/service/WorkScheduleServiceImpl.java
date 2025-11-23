package com.cona.modules.system_config.service;



import com.cona.exception.types.BusinessException;
import com.cona.modules.system_config.dto.WorkScheduleRequest;
import com.cona.modules.system_config.dto.WorkScheduleResponse;
import com.cona.modules.system_config.entity.WorkSchedule;
import com.cona.modules.system_config.repository.WorkScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkScheduleServiceImpl implements WorkScheduleService{
    private final WorkScheduleRepository repository;

    @Override
    public WorkScheduleResponse create(WorkScheduleRequest request) {

        // Validar nombre único
        if (repository.existsByName(request.getName())) {
            throw new BusinessException("DUPLICATED_WORKSHEDULE_NAME","Ya existe un horario con ese nombre.");
        }

        // Validar horas
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BusinessException("INVALID_ENDTIME","La hora de salida debe ser mayor que la hora de entrada.");
        }

        WorkSchedule schedule = new WorkSchedule();
        schedule.setName(request.getName());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setToleranceMinutes(request.getToleranceMinutes());
        schedule.setDescription(request.getDescription());
        schedule.setActive(request.getActive());

        WorkSchedule saved = repository.save(schedule);

        return toResponse(saved);
    }

    @Override
    public WorkScheduleResponse update(Long id, WorkScheduleRequest request) {

        WorkSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND_WORCKSCHEDULE", "No se encontró el horario con ID " + id));

        // Validar nombre único excepto el mismo ID
        if (repository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BusinessException("WORKSCHEDULE_NAME_ALREADY_EXIST", "El nombre del horario ya está en uso.");
        }

        // Validar horas
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BusinessException("INVALID_ENDTIME","La hora de salida debe ser mayor que la hora de entrada.");
        }

        schedule.setName(request.getName());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setToleranceMinutes(request.getToleranceMinutes());
        schedule.setDescription(request.getDescription());
        schedule.setActive(request.getActive());

        WorkSchedule updated = repository.save(schedule);

        return toResponse(updated);
    }

    @Override
    public WorkScheduleResponse getById(Long id) {
        WorkSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND_WORKCHEDULE","No se encontró el horario con ID " + id));

        return toResponse(schedule);
    }

    @Override
    public List<WorkScheduleResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        WorkSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND_WORKCHEDULE", "No se encontró el horario con ID " + id));

        repository.delete(schedule);
    }

    @Override
    public void activate(Long id) {
        WorkSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND_WORKCHEDULE", "No se encontró el horario con ID " + id));

        schedule.setActive(true);
        repository.save(schedule);
    }

    @Override
    public void deactivate(Long id) {
        WorkSchedule schedule = repository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND_WORKCHEDULE", "No se encontró el horario con ID " + id));

        schedule.setActive(false);
        repository.save(schedule);
    }

    // Mapper manual
    private WorkScheduleResponse toResponse(WorkSchedule s) {
        WorkScheduleResponse response = new WorkScheduleResponse();

        response.setId(s.getId());
        response.setName(s.getName());
        response.setStartTime(s.getStartTime());
        response.setEndTime(s.getEndTime());
        response.setToleranceMinutes(s.getToleranceMinutes());
        response.setDescription(s.getDescription());
        response.setActive(s.getActive());
        response.setCreatedAt(s.getCreatedAt());
        response.setUpdatedAt(s.getUpdatedAt());

        return response;
    }
}
