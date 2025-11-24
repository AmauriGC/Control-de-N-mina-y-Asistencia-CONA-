package com.cona.modules.system_config.repository;

import com.cona.modules.system_config.entity.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, Long> {
    Optional<WorkSchedule> findById(Long id);
    boolean existsByName(String name);
}
