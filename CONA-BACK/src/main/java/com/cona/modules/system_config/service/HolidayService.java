package com.cona.modules.system_config.service;

import com.cona.modules.system_config.controller.dto.HolidayRequest;
import com.cona.modules.system_config.controller.dto.HolidayResponse;
import com.cona.modules.system_config.enums.HolidayType;

import java.util.List;

public interface HolidayService {

    HolidayResponse create(HolidayRequest request);

    HolidayResponse update(Long id, HolidayRequest request);

    HolidayResponse getById(Long id);

    List<HolidayResponse> getAll(Integer year, HolidayType type, Boolean upcoming);

    void delete(Long id);
}