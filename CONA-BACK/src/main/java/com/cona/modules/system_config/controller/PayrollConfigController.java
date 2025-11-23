package com.cona.modules.system_config.controller;

import com.cona.modules.system_config.controller.dto.PayrollConfigRequest;
import com.cona.modules.system_config.entity.PayrollConfig;
import com.cona.modules.system_config.service.PayrollConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RequestMapping("/payroll-configs")
@RestController
public class PayrollConfigController {

    private final PayrollConfigService payrollConfigService;

    @Autowired
    public PayrollConfigController(PayrollConfigService payrollConfigService) {
        this.payrollConfigService = payrollConfigService;
    }

    @GetMapping
    public ResponseEntity<List<PayrollConfig>> getAllPayrollConfigs() {
        List<PayrollConfig> configs = payrollConfigService.findAllConfigs();
        return ResponseEntity.ok(configs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollConfig> getConfigById(@PathVariable Long id) {
        return payrollConfigService.findConfigById(id)
                .map(ResponseEntity::ok) // If found, return 200 OK with the object
                .orElseGet(() -> ResponseEntity.notFound().build()); // If not found, return 404 Not Found
    }

    @PostMapping
    public ResponseEntity<PayrollConfig> createConfig(@RequestBody PayrollConfigRequest config) {
        PayrollConfig savedConfig = payrollConfigService.saveConfig(config);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedConfig);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PayrollConfig> updateConfig(@PathVariable Long id, @RequestBody PayrollConfigRequest configDetails) {
        // Check if the config exists before attempting to update
        return payrollConfigService.findConfigById(id)
                .map(existingConfig -> {
                    // Update the fields with the new details
                    existingConfig.setIsrFixed(configDetails.getIsrFixed());
                    existingConfig.setImssFixed(configDetails.getImssFixed());
                    existingConfig.setLatePenalty(configDetails.getLatePenalty());
                    var configDto = new PayrollConfigRequest();
                    configDto.setImssFixed(existingConfig.getImssFixed());
                    configDto.setIsrFixed(existingConfig.getIsrFixed());
                    configDto.setLatePenalty(existingConfig.getLatePenalty());
                    // Save the updated entity
                    PayrollConfig updatedConfig = payrollConfigService.saveConfig(configDto);
                    return ResponseEntity.ok(updatedConfig); // Return 200 OK
                })
                .orElseGet(() -> ResponseEntity.notFound().build()); // Return 404 if ID not found
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfig(@PathVariable Long id) {
        // Check if the config exists before deleting (optional but good practice)
        if (payrollConfigService.findConfigById(id).isPresent()) {
            payrollConfigService.deleteConfig(id);
            // Returns 204 No Content for a successful deletion
            return ResponseEntity.noContent().build();
        } else {
            // Returns 404 Not Found if the config doesn't exist
            return ResponseEntity.notFound().build();
        }
    }

}
