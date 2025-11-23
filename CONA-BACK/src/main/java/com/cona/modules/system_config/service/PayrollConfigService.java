package com.cona.modules.system_config.service;

import com.cona.modules.system_config.controller.dto.PayrollConfigRequest;
import com.cona.modules.system_config.entity.PayrollConfig;
import com.cona.modules.system_config.repository.PayrollConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PayrollConfigService {

    private PayrollConfigRepository payrollConfigRepository;

    @Autowired
    public PayrollConfigService(PayrollConfigRepository payrollConfigRepository) {
        this.payrollConfigRepository = payrollConfigRepository;
    }

    public List<PayrollConfig> findAllConfigs() {
        return payrollConfigRepository.findAll();
    }

    public Optional<PayrollConfig> findConfigById(Long id) {
        return payrollConfigRepository.findById(id);
    }

    public PayrollConfig saveConfig(PayrollConfigRequest config) {
        var configEntity = new PayrollConfig();
        configEntity.setIsrFixed(config.getIsrFixed());
        configEntity.setImssFixed(config.getImssFixed());
        configEntity.setLatePenalty(config.getLatePenalty());
        // The save method handles both creation (new ID) and update (existing ID)
        return payrollConfigRepository.save(configEntity);
    }

    public PayrollConfig createConfigFromDto(PayrollConfigRequest configRequest) {
        // Map DTO fields to a new Entity
        PayrollConfig newConfig = new PayrollConfig();
        newConfig.setIsrFixed(configRequest.getIsrFixed());
        newConfig.setImssFixed(configRequest.getImssFixed());
        newConfig.setLatePenalty(configRequest.getLatePenalty());

        // Save the new Entity
        return payrollConfigRepository.save(newConfig);
    }

    public Optional<PayrollConfig> updateConfigFromDto(Long id, PayrollConfigRequest configRequest) {
        // Find the existing entity by ID
        return payrollConfigRepository.findById(id)
                .map(existingConfig -> {
                    // Update the existing Entity fields from the DTO
                    existingConfig.setIsrFixed(configRequest.getIsrFixed());
                    existingConfig.setImssFixed(configRequest.getImssFixed());
                    existingConfig.setLatePenalty(configRequest.getLatePenalty());

                    // Save the updated entity (JPA handles the update since the ID is present)
                    return payrollConfigRepository.save(existingConfig);
                });
    }

    public void deleteConfig(Long id) {
        payrollConfigRepository.deleteById(id);
    }


}
