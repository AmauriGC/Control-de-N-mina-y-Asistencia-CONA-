package com.cona.modules.payroll.entity;

import com.cona.modules.employees.entity.Employee;
import com.cona.modules.payroll.enums.PayrollStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payrolls")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    // Días trabajados normalmente
    @Column(name = "normal_days_worked", nullable = false)
    private Integer normalDaysWorked = 0;

    @Column(name = "normal_days_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal normalDaysSalary = BigDecimal.ZERO;

    // Días de vacaciones
    @Column(name = "vacation_days", nullable = false)
    private Integer vacationDays = 0;

    @Column(name = "vacation_days_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal vacationDaysSalary = BigDecimal.ZERO;

    // Días de falta
    @Column(name = "absent_days", nullable = false)
    private Integer absentDays = 0;

    @Column(name = "absent_days_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal absentDaysSalary = BigDecimal.ZERO;

    // Días con retardo
    @Column(name = "late_days", nullable = false)
    private Integer lateDays = 0;

    @Column(name = "late_days_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal lateDaysSalary = BigDecimal.ZERO;

    // Descuentos por retardos
    @Column(name = "late_penalty_deduction", nullable = false, precision = 10, scale = 2)
    private BigDecimal latePenaltyDeduction = BigDecimal.ZERO;

    // Salario base (suma de todos los días)
    @Column(name = "base_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal baseSalary = BigDecimal.ZERO;

    // Bono (si aplica)
    @Column(name = "bonus", nullable = false, precision = 10, scale = 2)
    private BigDecimal bonus = BigDecimal.ZERO;

    // Salario total (base + bono)
    @Column(name = "total_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalSalary = BigDecimal.ZERO;

    // Para el bono: si tiene faltas sin justificar o días con retardo
    @Column(name = "has_bonus_penalties", nullable = false)
    private Boolean hasBonusPenalties = false;

    // Campos originales mantenidos para compatibilidad
    @Column(precision = 10, scale = 2)
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal bonuses = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal netSalary = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayrollStatus status;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
