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
import com.cona.modules.attendance.entity.Attendance;
import com.cona.modules.attendance.enums.AttendanceStatus;
import com.cona.modules.attendance.repository.AttendanceRepository;
import com.cona.modules.leaves.entity.LeaveRequest;
import com.cona.modules.leaves.enums.LeaveStatus;
import com.cona.modules.leaves.enums.LeaveType;
import com.cona.modules.leaves.repository.LeaveRequestRepository;
import com.cona.modules.system_config.entity.PayrollConfig;
import com.cona.modules.system_config.repository.PayrollConfigRepository;

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
import java.util.Random;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class    DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final WorkScheduleRepository workSchedules;
    private final EmployeeRepository employees;
    private final AttendanceRepository attendances;
    private final LeaveRequestRepository leaveRequests;
    private final PayrollConfigRepository payrollConfigs;

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
                           EmployeeRepository employees,
                           AttendanceRepository attendances,
                           LeaveRequestRepository leaveRequests,
                           PayrollConfigRepository payrollConfigs) {
        this.users = users;
        this.encoder = encoder;
        this.workSchedules = workSchedules;
        this.employees = employees;
        this.attendances = attendances;
        this.leaveRequests = leaveRequests;
        this.payrollConfigs = payrollConfigs;
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

        // PayrollConfig de prueba
        seedPayrollConfig();

        // Asistencias de prueba
        seedAttendances();

        // Solicitudes de vacaciones de prueba
        seedLeaveRequests();
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
        
        // Calcular horas totales por día
        long totalHours;
        if (end.isBefore(start)) {
            // Turno nocturno que cruza la medianoche
            totalHours = java.time.Duration.between(start, LocalTime.MIDNIGHT).toHours() +
                        java.time.Duration.between(LocalTime.MIDNIGHT, end).toHours();
        } else {
            totalHours = java.time.Duration.between(start, end).toHours();
        }
        ws.setTotalHoursPerDay((int) Math.max(totalHours, 0));

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

    private void seedPayrollConfig() {
        if (payrollConfigs.count() > 0) {
            log.info("PayrollConfig ya existe");
            return;
        }

        PayrollConfig config = PayrollConfig.builder()
                .isrFixed(BigDecimal.valueOf(250.00))
                .imssFixed(BigDecimal.valueOf(150.00))
                .latePenalty(BigDecimal.valueOf(50.00))
                .bonusAmount(BigDecimal.valueOf(500.00))
                .isActive(true)
                .build();

        payrollConfigs.save(config);
        log.info("PayrollConfig creado con bono de: {}", config.getBonusAmount());
    }

    private void seedAttendances() {
        Employee employee = employees.findAll().stream().findFirst().orElse(null);
        if (employee == null) {
            log.error("No hay empleado disponible para crear asistencias");
            return;
        }

        if (attendances.count() > 0) {
            log.info("Ya existen asistencias en el sistema");
            return;
        }

        Random random = new Random();
        LocalDate startDate = LocalDate.now().minusDays(20);

        for (int i = 0; i < 20; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            
            // Skip weekends (opcional, puedes comentar estas líneas si quieres incluir fines de semana)
            if (currentDate.getDayOfWeek().getValue() >= 6) {
                continue;
            }

            Attendance attendance = new Attendance();
            attendance.setEmployee(employee);
            attendance.setDate(currentDate);

            // Generar diferentes tipos de asistencia con probabilidades
            int statusRandom = random.nextInt(100);
            
            if (statusRandom < 60) { // 60% Present
                attendance.setStatus(AttendanceStatus.PRESENT);
                attendance.setCheckInTime(LocalTime.of(8, random.nextInt(30)));
                attendance.setCheckOutTime(LocalTime.of(16, random.nextInt(60)));
                attendance.setHoursWorked(8.0); // Solo horas completas
                attendance.setDailySalary(employee.getHourlyRate().multiply(BigDecimal.valueOf(attendance.getHoursWorked())));
                
            } else if (statusRandom < 75) { // 15% Late
                attendance.setStatus(AttendanceStatus.LATE);
                attendance.setCheckInTime(LocalTime.of(8, 30 + random.nextInt(30))); // Llegada tardía (max 30 minutos)
                attendance.setCheckOutTime(LocalTime.of(16, random.nextInt(60)));
                attendance.setHoursWorked(7.0); // Solo horas completas
                // El salario con descuento se calculará en el servicio
                attendance.setDailySalary(employee.getHourlyRate().multiply(BigDecimal.valueOf(attendance.getHoursWorked())));
                
            } else if (statusRandom < 85) { // 10% Absent
                attendance.setStatus(AttendanceStatus.ABSENT);
                attendance.setHoursWorked(0.0);
                attendance.setDailySalary(BigDecimal.ZERO);
                
            } else if (statusRandom < 95) { // 10% Justified Absence
                attendance.setStatus(AttendanceStatus.JUSTIFIED_ABSENCE);
                attendance.setHoursWorked(0.0);
                attendance.setDailySalary(BigDecimal.ZERO);
                attendance.setComments("Cita médica");
                
            } else { // 5% Ya será marcado como Vacation por las solicitudes aprobadas
                attendance.setStatus(AttendanceStatus.ABSENT); // Inicialmente como falta, luego se convertirá en vacation
                attendance.setHoursWorked(0.0);
                attendance.setDailySalary(BigDecimal.ZERO);
            }

            attendances.save(attendance);
        }

        log.info("Creadas {} asistencias de prueba para el empleado {}", 
                attendances.count(), employee.getFullName());
    }

    private void seedLeaveRequests() {
        Employee employee = employees.findAll().stream().findFirst().orElse(null);
        if (employee == null) {
            log.error("No hay empleado disponible para crear solicitudes de vacaciones");
            return;
        }

        if (leaveRequests.count() > 0) {
            log.info("Ya existen solicitudes de vacaciones en el sistema");
            return;
        }

        // Crear algunas solicitudes de vacaciones aprobadas para fechas donde hay faltas
        LocalDate vacationStart1 = LocalDate.now().minusDays(15);
        LocalDate vacationEnd1 = LocalDate.now().minusDays(14);

        LeaveRequest vacation1 = new LeaveRequest();
        vacation1.setEmployee(employee);
        vacation1.setStartDate(vacationStart1);
        vacation1.setEndDate(vacationEnd1);
        vacation1.setType(LeaveType.VACATION);
        vacation1.setStatus(LeaveStatus.APPROVED);
        vacation1.setReason("Vacaciones programadas");

        leaveRequests.save(vacation1);

        // Otra solicitud aprobada
        LocalDate vacationStart2 = LocalDate.now().minusDays(8);
        LocalDate vacationEnd2 = LocalDate.now().minusDays(8);

        LeaveRequest vacation2 = new LeaveRequest();
        vacation2.setEmployee(employee);
        vacation2.setStartDate(vacationStart2);
        vacation2.setEndDate(vacationEnd2);
        vacation2.setType(LeaveType.VACATION);
        vacation2.setStatus(LeaveStatus.APPROVED);
        vacation2.setReason("Día personal");

        leaveRequests.save(vacation2);

        // Una solicitud pendiente
        LocalDate vacationStart3 = LocalDate.now().plusDays(5);
        LocalDate vacationEnd3 = LocalDate.now().plusDays(7);

        LeaveRequest vacation3 = new LeaveRequest();
        vacation3.setEmployee(employee);
        vacation3.setStartDate(vacationStart3);
        vacation3.setEndDate(vacationEnd3);
        vacation3.setType(LeaveType.SICK_LEAVE);
        vacation3.setStatus(LeaveStatus.PENDING);
        vacation3.setReason("Solicitud futura de incapacidad");

        leaveRequests.save(vacation3);

        log.info("Creadas {} solicitudes de vacaciones de prueba", leaveRequests.count());
    }
}
