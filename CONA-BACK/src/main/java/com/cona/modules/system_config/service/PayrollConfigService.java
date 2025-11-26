package com.cona.modules.system_config.service;

import com.cona.exception.types.BusinessException;
import com.cona.modules.system_config.controller.dto.PayrollConfigRequest;
import com.cona.modules.system_config.controller.dto.PayrollConfigResponse;
import com.cona.modules.system_config.entity.PayrollConfig;
import com.cona.modules.system_config.repository.PayrollConfigRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PayrollConfigService {

    private final PayrollConfigRepository payrollConfigRepository;

    private PayrollConfigResponse toDto(PayrollConfig entity) {
        PayrollConfigResponse dto = new PayrollConfigResponse();
        dto.setId(entity.getId());
        dto.setIsrFixed(entity.getIsrFixed());
        dto.setImssFixed(entity.getImssFixed());
        dto.setLatePenalty(entity.getLatePenalty());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    @Transactional
    public PayrollConfigResponse createOrUpdate(PayrollConfigRequest dto) {
        Optional<PayrollConfig> existingConfig = payrollConfigRepository.findById(1L);

        PayrollConfig config;

        if (existingConfig.isPresent()) {
            config = existingConfig.get();
        } else {
            config = new PayrollConfig();
        }

        config.setIsrFixed(dto.getIsrFixed());
        config.setImssFixed(dto.getImssFixed());
        config.setLatePenalty(dto.getLatePenalty());

        PayrollConfig savedConfig = payrollConfigRepository.save(config);
        return toDto(savedConfig);
    }

    public PayrollConfigResponse getCurrentConfig() {
        PayrollConfig config = payrollConfigRepository.findById(1L)
                .orElseGet(() -> {
                    List<PayrollConfig> allConfigs = payrollConfigRepository.findAll();
                    if (allConfigs.isEmpty()) {
                        throw new BusinessException("NOT_FOUND", "No se ha establecido una configuración de nómina.");
                    }
                    return allConfigs.get(0);
                });

        return toDto(config);
    }
}