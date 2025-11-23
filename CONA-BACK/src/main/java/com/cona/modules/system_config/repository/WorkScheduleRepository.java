package com.cona.modules.system_config.repository;

import com.cona.modules.system_config.entity.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;



public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {

    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
}
