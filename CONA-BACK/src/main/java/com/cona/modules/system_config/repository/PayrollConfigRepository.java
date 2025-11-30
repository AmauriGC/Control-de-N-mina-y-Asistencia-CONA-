package com.cona.modules.system_config.repository;

import com.cona.modules.system_config.entity.PayrollConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository; // Aunque JpaRepository ya implica Repository, es buena práctica.

import java.util.Optional;

@Repository
public interface PayrollConfigRepository extends JpaRepository<PayrollConfig, Long> {
    Optional<PayrollConfig> findByIsActiveTrue();
}