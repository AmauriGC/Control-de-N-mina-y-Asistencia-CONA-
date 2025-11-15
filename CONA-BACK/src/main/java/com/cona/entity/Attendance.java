package com.cona.entity;

import com.cona.enums.AttendanceType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance",
       uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "fecha"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate fecha;

    private LocalTime horaEntrada;

    private LocalTime horaSalida;

    @Column(precision = 6, scale = 2)
    private BigDecimal horasTrabajadas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceType tipoRegistro = AttendanceType.NORMAL;
}

