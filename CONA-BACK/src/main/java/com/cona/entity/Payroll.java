package com.cona.entity;

import com.cona.enums.PayrollStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payrolls")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate periodoInicio;

    @Column(nullable = false)
    private LocalDate periodoFin;

    @Column(nullable = false)
    private Instant fechaCalculo;

    @Column(precision = 14, scale = 2)
    private BigDecimal totalGeneral;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayrollStatus estatus;

    @OneToMany(mappedBy = "nomina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PayrollDetail> detalles = new ArrayList<>();
}

