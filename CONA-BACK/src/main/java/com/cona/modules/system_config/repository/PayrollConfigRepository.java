package com.cona.modules.system_config.repository;


import com.cona.modules.system_config.entity.PayrollConfig;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayrollConfigRepository extends JpaRepository<PayrollConfig, Long> {
}
