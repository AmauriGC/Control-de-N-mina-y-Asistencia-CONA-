package com.cona.modules.employees.service;

import com.cona.exception.types.BusinessException;
import com.cona.kernel.utils.Sanitizer;
import com.cona.modules.auth.entity.User;
import com.cona.modules.auth.enums.Role;
import com.cona.modules.auth.repository.UserRepository;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.employees.controller.dto.EmployeeRequestDto;
import com.cona.modules.employees.controller.dto.EmployeeResponseDto;
import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.enums.EmployeeStatus;
import com.cona.modules.system_config.entity.WorkSchedule;
import com.cona.modules.system_config.repository.WorkScheduleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public EmployeeResponseDto register(EmployeeRequestDto dto) {

        dto.setFullName(Sanitizer.sanitizeString(dto.getFullName()));
        dto.setEmail(Sanitizer.normalizeEmail(dto.getEmail()));
        dto.setPhone(Sanitizer.trim(dto.getPhone()));
        dto.setRfc(Sanitizer.trimAndLower(dto.getRfc()));
        dto.setPosition(Sanitizer.sanitizeString(dto.getPosition()));
        dto.setBankAccount(Sanitizer.trim(dto.getBankAccount()));
        dto.setBankName(Sanitizer.sanitizeString(dto.getBankName()));

        if (userRepository.existsByEmail(dto.getEmail()))
            throw new BusinessException("INVALID_EMAIL", "El correo ya está registrado");

        if (employeeRepository.existsByRfc(dto.getRfc()))
            throw new BusinessException("INVALID_RFC", "El RFC ya está registrado");

        if (dto.getHourlyRate().doubleValue() <= 0)
            throw new BusinessException("INVALID_HOURLY_RATE", "El pago por hora debe ser mayor a 0");

        WorkSchedule workSchedule = workScheduleRepository.findById(dto.getWorkSchedule())
                .orElseThrow(() -> new RuntimeException("No se encontro el horario de trabajo"));

        String key;
        do {
            key = String.format("%05d", (int)(Math.random() * 100000));
        } while (employeeRepository.existsByEmployeeKey(key));

        User user = new User();
        user.setEmail(dto.getEmail());
        String pass = dto.getRfc().substring(dto.getRfc().length() - 3) + key;
        user.setPassword(passwordEncoder.encode(pass));
        System.out.println(pass);
        user.setActive(true);
        user.setRole(Role.EMPLOYEE);

        User savedUser = userRepository.save(user);

        Employee employee = new Employee();
        employee.setUser(savedUser);
        employee.setFullName(dto.getFullName());
        employee.setPosition(dto.getPosition());
        employee.setRfc(dto.getRfc().toUpperCase());
        employee.setHourlyRate(dto.getHourlyRate());
        employee.setContractType(dto.getContractType());
        employee.setContractStartDate(dto.getContractStartDate());
        employee.setContractEndDate(dto.getContractEndDate());
        employee.setBankAccount(dto.getBankAccount());
        employee.setBankName(dto.getBankName());
        employee.setClabe(dto.getClabe());
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee.setEmployeeKey(key);
        employee.setWorkSchedule(workSchedule);

        employeeRepository.save(employee);

        return toDto(employee);
    }


    public Page<EmployeeResponseDto> list(Integer page, Integer size, String name, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fullName").ascending());

        Page<Employee> result;

        boolean hasName = name != null && !name.isBlank();
        boolean hasStatus = status != null;

        if (!hasName && !hasStatus) {
            result = employeeRepository.findAll(pageable);
        } else if (hasName && !hasStatus) {
            result = employeeRepository.findByFullNameContainingIgnoreCase(name, pageable);
        } else if (!hasName) {
            EmployeeStatus st = EmployeeStatus.valueOf(status.toUpperCase());
            result = employeeRepository.findByStatus(st, pageable);
        } else {
            EmployeeStatus st = EmployeeStatus.valueOf(status.toUpperCase());
            result = employeeRepository.findByStatusAndFullNameContainingIgnoreCase(st, name, pageable);
        }

        return result.map(this::toDto);
    }

    public EmployeeResponseDto getById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("INVALID_ID", "No se encontró el empleado"));

        return toDto(employee);
    }


    @Transactional
    public void toggleStatus(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("INVALID_ID","No se encontró el empleado"));

        if (employee.getStatus() == EmployeeStatus.ACTIVE)
            employee.setStatus(EmployeeStatus.INACTIVE);
        else
            employee.setStatus(EmployeeStatus.ACTIVE);

        employeeRepository.save(employee);

        employee.getUser().setActive(employee.getStatus() == EmployeeStatus.ACTIVE);
        userRepository.save(employee.getUser());
    }

    private EmployeeResponseDto toDto(Employee e) {
        EmployeeResponseDto dto = new EmployeeResponseDto();
        dto.setId(e.getId());
        dto.setFullName(e.getFullName());
        dto.setEmail(e.getUser().getEmail());
        dto.setPosition(e.getPosition());
        dto.setRfc(e.getRfc());
        dto.setHourlyRate(e.getHourlyRate());
        dto.setContractType(e.getContractType());
        dto.setContractStartDate(e.getContractStartDate());
        dto.setContractEndDate(e.getContractEndDate());
        dto.setStatus(e.getStatus());
        return dto;
    }
}
