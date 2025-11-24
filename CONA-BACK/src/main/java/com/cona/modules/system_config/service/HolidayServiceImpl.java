package com.cona.modules.system_config.service;

import com.cona.exception.types.BusinessException;
import com.cona.modules.system_config.controller.dto.HolidayRequest;
import com.cona.modules.system_config.controller.dto.HolidayResponse;
import com.cona.modules.system_config.entity.Holiday;
import com.cona.modules.system_config.enums.HolidayType;
import com.cona.modules.system_config.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HolidayServiceImpl implements HolidayService {

    private final HolidayRepository repository;

    @Override
    public HolidayResponse create(HolidayRequest request) {

        if (request.getDate().isBefore(LocalDate.now().withDayOfYear(1))) {
            throw new BusinessException("INVALID_DATE", "La fecha debe ser del año en curso o futura");
        }

        if (repository.existsByDate(request.getDate())) {
            throw new BusinessException("DUPLICATED_HOLIDAY_DATE", "Ya existe un festivo registrado para la fecha: " + request.getDate());
        }

        Holiday holiday = new Holiday();
        holiday.setDate(request.getDate());
        holiday.setName(request.getName());
        holiday.setType(request.getType());
        holiday.setDescription(request.getDescription());

        Holiday saved = repository.save(holiday);

        return toResponse(saved);
    }

    @Override
    public HolidayResponse update(Long id, HolidayRequest request) {

        Holiday holiday = repository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND_HOLIDAY", "No se encontró el día festivo con ID " + id));

        if (!holiday.getDate().equals(request.getDate())) {
            if (repository.existsByDateAndIdNot(request.getDate(), id)) {
                throw new BusinessException("HOLIDAY_DATE_ALREADY_EXIST", "Ya existe un festivo registrado para la fecha: " + request.getDate());
            }

            if (request.getDate().isBefore(LocalDate.now().withDayOfYear(1))) {
                throw new BusinessException("INVALID_DATE", "La fecha debe ser del año en curso o futura");
            }

            holiday.setDate(request.getDate());
        }

        holiday.setName(request.getName());
        holiday.setType(request.getType());
        holiday.setDescription(request.getDescription());

        Holiday updated = repository.save(holiday);

        return toResponse(updated);
    }

    @Override
    public HolidayResponse getById(Long id) {
        Holiday holiday = repository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND_HOLIDAY", "No se encontró el día festivo con ID " + id));

        return toResponse(holiday);
    }

    @Override
    public List<HolidayResponse> getAll() {
        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        Holiday holiday = repository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND_HOLIDAY", "No se encontró el día festivo con ID " + id));

        repository.delete(holiday);
    }

    @Override
    public List<HolidayResponse> getByYear(int year) {
        return repository.findByYear(year)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<HolidayResponse> getByType(HolidayType type) {
        return repository.findByTypeOrderByDateAsc(type)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<HolidayResponse> getUpcoming() {
        return repository.findUpcomingHolidays(LocalDate.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private HolidayResponse toResponse(Holiday h) {
        HolidayResponse response = new HolidayResponse();

        response.setId(h.getId());
        response.setDate(h.getDate());
        response.setName(h.getName());
        response.setType(h.getType());
        response.setDescription(h.getDescription());
        response.setCreatedAt(h.getCreatedAt());
        response.setUpdatedAt(h.getUpdatedAt());

        return response;
    }
}
