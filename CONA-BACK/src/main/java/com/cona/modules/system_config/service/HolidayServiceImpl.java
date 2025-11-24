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
import java.util.stream.Collectors;

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
    public List<HolidayResponse> getAll(Integer year, HolidayType type, Boolean upcoming) {
        List<Holiday> holidays;

        if (upcoming != null && upcoming) {
            holidays = repository.findUpcomingHolidays(LocalDate.now());
        } else if (year != null && type != null) {
            holidays = repository.findByYear(year).stream()
                    .filter(h -> h.getType().equals(type))
                    .collect(Collectors.toList());
        } else if (year != null) {
            holidays = repository.findByYear(year);
        } else if (type != null) {
            holidays = repository.findByTypeOrderByDateAsc(type);
        } else {
            holidays = repository.findAll();
        }

        return holidays.stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void delete(Long id) {
        Holiday holiday = repository.findById(id)
                .orElseThrow(() -> new BusinessException("NOT_FOUND_HOLIDAY", "No se encontró el día festivo con ID " + id));

        repository.delete(holiday);
    }

    private HolidayResponse toResponse(Holiday h) {
        HolidayResponse response = new HolidayResponse();

        response.setId(h.getId());
        response.setDate(h.getDate());
        response.setName(h.getName());
        response.setType(h.getType());
        response.setDescription(h.getDescription());

        return response;
    }
}