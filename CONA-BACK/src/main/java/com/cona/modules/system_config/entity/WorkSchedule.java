package com.cona.modules.system_config.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Duration;

@Entity
@Table(name = "work_schedules")
@Data
@EntityListeners(AuditingEntityListener.class)
public class WorkSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    private Integer toleranceMinutes;

    private String description;

    @Column(nullable = false)
    private Boolean active = true;

    // Número total de horas por jornada (calculado a partir de startTime y endTime)
    @Column(nullable = false)
    private Integer totalHoursPerDay = 0;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
