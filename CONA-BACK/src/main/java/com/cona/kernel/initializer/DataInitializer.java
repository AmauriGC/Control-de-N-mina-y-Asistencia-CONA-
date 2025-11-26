package com.cona.kernel.initializer;

import com.cona.modules.auth.enums.Role;
import com.cona.kernel.utils.Sanitizer;
import com.cona.modules.auth.entity.User;
import com.cona.modules.auth.repository.UserRepository;
import com.cona.modules.system_config.entity.WorkSchedule;
import com.cona.modules.system_config.repository.WorkScheduleRepository;
import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.enums.ContractType;
import com.cona.modules.employees.enums.EmployeeStatus;
import com.cona.modules.employees.repository.EmployeeRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final WorkScheduleRepository workSchedules;
    private final EmployeeRepository employees;

    @Value("${app.seed.admin.email}")
    private String adminEmail;

    @Value("${app.seed.admin.password}")
    private String adminPassword;

    @Value("${app.seed.employee.email}")
    private String employeeEmail;

    @Value("${app.seed.employee.password}")
    private String employeePassword;

    public DataInitializer(UserRepository users,
                           PasswordEncoder encoder,
                           WorkScheduleRepository workSchedules,
                           EmployeeRepository employees) {
        this.users = users;
        this.encoder = encoder;
        this.workSchedules = workSchedules;
        this.employees = employees;
    }

    @Override
    public void run(String... args) {
        // Usuarios
        seedUser(adminEmail, adminPassword, Role.ADMIN);
        seedUser(employeeEmail, employeePassword, Role.EMPLOYEE);

        // Horarios laborales
        seedWorkSchedule(
                "Matutino",
                LocalTime.of(8, 0),
                LocalTime.of(16, 0),
                15,
                "Turno matutino estándar"
        );

        seedWorkSchedule(
                "Vespertino",
                LocalTime.of(14, 0),
                LocalTime.of(22, 0),
                10,
                "Turno vespertino"
        );

        seedWorkSchedule(
                "Nocturno",
                LocalTime.of(22, 0),
                LocalTime.of(6, 0),
                5,
                "Turno nocturno"
        );

        // Empleado de prueba
        seedEmployee();
    }

    private void seedUser(String email, String rawPassword, Role role) {
        String normalizedEmail = Sanitizer.trimAndLower(email);

        if (users.existsByEmail(normalizedEmail)) {
            log.info("Usuario ya existe: {}", normalizedEmail);
            return;
        }

        User u = new User();
        u.setEmail(normalizedEmail);
        u.setPassword(encoder.encode(rawPassword));
        u.setRole(role);
        users.save(u);

        log.info("Usuario creado: {} ({})", normalizedEmail, role);
    }

    private void seedWorkSchedule(
            String name,
            LocalTime start,
            LocalTime end,
            Integer tolerance,
            String description
    ) {

        if (workSchedules.existsByName(name)) {
            log.info("Horario ya existe: {}", name);
            return;
        }

        WorkSchedule ws = new WorkSchedule();
        ws.setName(name);
        ws.setStartTime(start);
        ws.setEndTime(end);
        ws.setToleranceMinutes(tolerance);
        ws.setDescription(description);
        ws.setActive(true);

        workSchedules.save(ws);

        log.info("Horario laboral creado: {}", name);
    }

    private void seedEmployee() {
        User employeeUser = users.findByEmail(Sanitizer.trimAndLower(employeeEmail)).orElse(null);
        if (employeeUser == null) {
            log.error("Usuario empleado no encontrado");
            return;
        }

        if (employees.findByUserId(employeeUser.getId()).isPresent()) {
            log.info("Empleado ya existe para el usuario: {}", employeeEmail);
            return;
        }

        WorkSchedule workSchedule = workSchedules.findAll().stream().findFirst().orElse(null);
        if (workSchedule == null) {
            log.error("No hay horarios laborales disponibles");
            return;
        }

        String key;
        do {
            key = String.format("%05d", (int) (Math.random() * 100000));
        } while (employees.existsByEmployeeKey(key));

        Employee employee = new Employee();
        employee.setUser(employeeUser);
        employee.setEmployeeKey(key);
        employee.setFullName("Empleado de Prueba");
        employee.setPhone("555-1234");
        employee.setPosition("Desarrollador");
        employee.setRfc("XAXX010101000");
        employee.setHourlyRate(BigDecimal.valueOf(100.00));
        employee.setContractType(ContractType.FULL_TIME);
        employee.setContractStartDate(LocalDate.now());
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee.setWorkSchedule(workSchedule);

        employees.save(employee);

        log.info("Empleado creado: {} con clave {}", employee.getFullName(), key);
    }
}
