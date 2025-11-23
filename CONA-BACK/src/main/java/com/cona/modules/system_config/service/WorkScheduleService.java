package com.cona.modules.system_config.service;

import com.cona.modules.system_config.dto.WorkScheduleRequest;
import com.cona.modules.system_config.dto.WorkScheduleResponse;

import java.util.List;
public interface WorkScheduleService {

    WorkScheduleResponse create(WorkScheduleRequest request);

    WorkScheduleResponse update(Long id, WorkScheduleRequest request);

    WorkScheduleResponse getById(Long id);

    List<WorkScheduleResponse> getAll();

    void delete(Long id);

    void activate(Long id);

    void deactivate(Long id);



}
