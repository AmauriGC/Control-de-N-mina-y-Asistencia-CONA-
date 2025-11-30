package com.cona.modules.system_config.service;

import com.cona.exception.types.BusinessException;
import com.cona.modules.system_config.controller.dto.PayrollConfigRequest;
import com.cona.modules.system_config.controller.dto.PayrollConfigResponse;
import com.cona.modules.system_config.entity.PayrollConfig;
import com.cona.modules.system_config.repository.PayrollConfigRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
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
        dto.setBonusAmount(entity.getBonusAmount());
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
        config.setBonusAmount(dto.getBonusAmount());

        PayrollConfig savedConfig = payrollConfigRepository.save(config);
        return toDto(savedConfig);
    }

    public PayrollConfigResponse getCurrentConfig() {
        Optional<PayrollConfig> configOpt = payrollConfigRepository.findById(1L);
        if (configOpt.isPresent()) {
            return toDto(configOpt.get());
        } else {
            // Return default config
            PayrollConfigResponse defaultConfig = new PayrollConfigResponse();
            defaultConfig.setId(null);
            defaultConfig.setIsrFixed(BigDecimal.valueOf(100.0));
            defaultConfig.setImssFixed(BigDecimal.valueOf(100.0));
            defaultConfig.setLatePenalty(BigDecimal.valueOf(0));
            defaultConfig.setBonusAmount(BigDecimal.valueOf(500.0));
            defaultConfig.setCreatedAt(null);
            defaultConfig.setUpdatedAt(null);
            return defaultConfig;
        }
    }
}