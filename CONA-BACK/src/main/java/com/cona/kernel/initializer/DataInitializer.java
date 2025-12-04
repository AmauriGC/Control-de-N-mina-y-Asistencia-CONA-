package com.cona.kernel.initializer;

import com.cona.kernel.utils.Sanitizer;
import com.cona.modules.auth.entity.User;
import com.cona.modules.auth.enums.Role;
import com.cona.modules.auth.repository.UserRepository;
import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.repository.EmployeeRepository;
import com.cona.modules.attendance.entity.Attendance;
import com.cona.modules.attendance.enums.AttendanceStatus;
import com.cona.modules.attendance.repository.AttendanceRepository;
import com.cona.modules.leaves.entity.LeaveRequest;
import com.cona.modules.leaves.enums.LeaveStatus;
import com.cona.modules.leaves.enums.LeaveType;
import com.cona.modules.leaves.repository.LeaveRequestRepository;
import com.cona.modules.justifications.entity.Justification;
import com.cona.modules.justifications.enums.DocumentType;
import com.cona.modules.justifications.enums.JustificationStatus;
import com.cona.modules.justifications.repository.JustificationRepository;
import com.cona.modules.system_config.entity.WorkSchedule;
import com.cona.modules.system_config.repository.WorkScheduleRepository;
import com.cona.modules.system_config.entity.Holiday;
import com.cona.modules.system_config.enums.HolidayType;
import com.cona.modules.system_config.repository.HolidayRepository;
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
import java.util.List;

@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    // nuevos repositorios para sembrado
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final JustificationRepository justificationRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final HolidayRepository holidayRepository;

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
                           EmployeeRepository employeeRepository,
                           AttendanceRepository attendanceRepository,
                           LeaveRequestRepository leaveRequestRepository,
                           JustificationRepository justificationRepository,
                           WorkScheduleRepository workScheduleRepository,
                           HolidayRepository holidayRepository) {
        this.users = users;
        this.encoder = encoder;
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.justificationRepository = justificationRepository;
        this.workScheduleRepository = workScheduleRepository;
        this.holidayRepository = holidayRepository;
    }

    @Override
    public void run(String... args) {
        // Mantener admin tal cual
        seedUser(adminEmail, adminPassword, Role.ADMIN);
        // Sembrar empleado base
        seedUser(employeeEmail, employeePassword, Role.EMPLOYEE);
        seedEmployeeData(employeeEmail);
        // Sembrar configuración de sistema
        seedWorkScheduleAndHolidays();
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

    private void seedEmployeeData(String employeeEmail) {
        String normalizedEmail = Sanitizer.trimAndLower(employeeEmail);
        User user = users.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            log.warn("Usuario empleado no encontrado para {}", normalizedEmail);
            return;
        }
        // Crear empleado si no existe
        Employee emp = employeeRepository.findByUserId(user.getId()).orElseGet(() -> {
            Employee e = new Employee();
            e.setUser(user);
            e.setFullName("Juan Pérez López");
            e.setPosition("Analista de Sistemas");
            e.setContractType(com.cona.modules.employees.enums.ContractType.FULL_TIME);
            e.setHourlyRate(new BigDecimal("85.00"));
            e.setRfc("POPV051002484");
            e.setPhone("7771234567");
            e.setBankAccount("0123456789");
            e.setBankName("BBVA");
            e.setClabe("002910012345678901");
            // Generar employeeKey único
            String baseKey = "EMP-" + user.getId();
            String key = baseKey;
            int suffix = 1;
            while (employeeRepository.existsByEmployeeKey(key)) {
                key = baseKey + "-" + (suffix++);
            }
            e.setEmployeeKey(key);
            e.setStatus(com.cona.modules.employees.enums.EmployeeStatus.ACTIVE);
            e.setContractStartDate(LocalDate.now().minusMonths(8));
            e.setContractEndDate(LocalDate.now().plusYears(1));
            return employeeRepository.save(e);
        });

        // Generar asistencias de los últimos 10 días con variedad de estados
        LocalDate today = LocalDate.now();
        for (int i = 10; i >= 1; i--) {
            LocalDate d = today.minusDays(i);
            List<Attendance> existing = attendanceRepository.findByEmployeeIdAndDate(emp.getId(), d);
            if (existing != null && !existing.isEmpty()) {
                continue;
            }
            Attendance a = new Attendance();
            a.setEmployee(emp);
            a.setDate(d);
            // alternar estados: presentes, retardo, falta, vacaciones
            AttendanceStatus status;
            if (i % 7 == 0) status = AttendanceStatus.VACATION;
            else if (i % 5 == 0) status = AttendanceStatus.ABSENT;
            else if (i % 3 == 0) status = AttendanceStatus.LATE;
            else status = AttendanceStatus.PRESENT;
            a.setStatus(status);
            if (status != AttendanceStatus.ABSENT && status != AttendanceStatus.VACATION) {
                a.setCheckInTime(LocalTime.of(9, (status == AttendanceStatus.LATE ? 30 : 0)));
                a.setCheckOutTime(LocalTime.of(18, 0));
            } else {
                a.setCheckInTime(null);
                a.setCheckOutTime(null);
            }
            attendanceRepository.save(a);
        }

        // Crear una solicitud de vacaciones aprobada en el rango de la semana pasada
        LocalDate vacStart = today.minusDays(9);
        LocalDate vacEnd = today.minusDays(7);
        // Verificar si ya existe solicitud en ese rango
        List<com.cona.modules.leaves.entity.LeaveRequest> existingVac = leaveRequestRepository.findByEmployeeIdAndDateAndStatus(emp.getId(), vacStart.plusDays(1), LeaveStatus.APPROVED);
        boolean hasVac = existingVac != null && !existingVac.isEmpty();
        if (!hasVac) {
            LeaveRequest lr = new LeaveRequest();
            lr.setEmployee(emp);
            lr.setType(LeaveType.VACATION);
            lr.setReason("Vacaciones familiares");
            lr.setStartDate(vacStart);
            lr.setEndDate(vacEnd);
            lr.setStatus(LeaveStatus.APPROVED);
            lr.setCreatedAt(java.time.LocalDateTime.now().minusDays(10));
            leaveRequestRepository.save(lr);
        }

        // Crear justificación pendiente para la última falta
        LocalDate lastAbsent = today.minusDays(5);
        List<Attendance> absentList = attendanceRepository.findByEmployeeIdAndDate(emp.getId(), lastAbsent);
        Attendance absent = (absentList != null && !absentList.isEmpty()) ? absentList.get(0) : null;
        if (absent != null && absent.getStatus() == AttendanceStatus.ABSENT) {
            boolean hasJust = justificationRepository.findByAttendanceId(absent.getId()).isPresent();
            if (!hasJust) {
                Justification j = new Justification();
                j.setEmployee(emp);
                j.setAttendance(absent);
                j.setDate(lastAbsent);
                j.setReason("Cita médica");
                j.setDocumentType(DocumentType.MEDICAL_CERTIFICATE);
                j.setStatus(JustificationStatus.PENDING);
                j.setCreatedAt(java.time.LocalDateTime.now().minusDays(4));
                // sin documento físico en seed; el flujo permite subir posteriormente
                j.setDocumentPath(null);
                justificationRepository.save(j);
            }
        }
        log.info("Datos de empleado sembrados: {} (ID {})", emp.getFullName(), emp.getId());
    }

    private void seedWorkScheduleAndHolidays() {
        // Horario por defecto
        WorkSchedule ws = workScheduleRepository.findAll().stream().findFirst().orElseGet(() -> {
            WorkSchedule w = new WorkSchedule();
            w.setName("Horario Estándar");
            w.setStartTime(LocalTime.of(9, 0));
            w.setEndTime(LocalTime.of(18, 0));
            w.setToleranceMinutes(10);
            w.setDescription("Horario de oficina");
            w.setActive(true);
            // calcular horas totales por día
            int totalHours = java.time.Duration.between(w.getStartTime(), w.getEndTime()).toHoursPart();
            w.setTotalHoursPerDay(totalHours);
            return workScheduleRepository.save(w);
        });
        // Asignar a empleado sembrado
        users.findByEmail(Sanitizer.trimAndLower(employeeEmail)).flatMap(u -> employeeRepository.findByUserId(u.getId())).ifPresent(e -> {
            if (e.getWorkSchedule() == null) {
                e.setWorkSchedule(ws);
                employeeRepository.save(e);
            }
        });
        // Días festivos básicos
        if (holidayRepository.findAll().isEmpty()) {
            Holiday h1 = new Holiday();
            h1.setName("Día de la Independencia");
            h1.setDate(LocalDate.of(LocalDate.now().getYear(), 9, 16));
            h1.setType(HolidayType.OBLIGATORY);
            h1.setDescription("Fiesta nacional");
            holidayRepository.save(h1);

            Holiday h2 = new Holiday();
            h2.setName("Navidad");
            h2.setDate(LocalDate.of(LocalDate.now().getYear(), 12, 25));
            h2.setType(HolidayType.OPTIONAL);
            h2.setDescription("Conmemoración");
            holidayRepository.save(h2);
        }
    }
}
