package com.cona.modules.system_config.service;

import com.cona.modules.system_config.controller.dto.HolidayRequest;
import com.cona.modules.system_config.controller.dto.HolidayResponse;
import com.cona.modules.system_config.enums.HolidayType;

import java.util.List;

public interface HolidayService {

    HolidayResponse create(HolidayRequest request);

    HolidayResponse update(Long id, HolidayRequest request);

    HolidayResponse getById(Long id);

    List<HolidayResponse> getAll();

    void delete(Long id);

    List<HolidayResponse> getByYear(int year);

    List<HolidayResponse> getByType(HolidayType type);

    List<HolidayResponse> getUpcoming();
}