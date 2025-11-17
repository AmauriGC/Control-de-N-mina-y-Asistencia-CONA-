package com.cona.kernel.initializer;

import com.cona.modules.auth.enums.Role;
import com.cona.kernel.utils.Sanitizer;
import com.cona.modules.auth.entity.User;
import com.cona.modules.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Value("${app.seed.admin.email}")
    private String adminEmail;

    @Value("${app.seed.admin.password}")
    private String adminPassword;

    @Value("${app.seed.employee.email}")
    private String employeeEmail;

    @Value("${app.seed.employee.password}")
    private String employeePassword;

    public DataInitializer(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        seedUser(adminEmail, adminPassword, Role.ADMIN);
        seedUser(employeeEmail, employeePassword, Role.EMPLOYEE);
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
}
