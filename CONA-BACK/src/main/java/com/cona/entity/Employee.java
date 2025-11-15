package com.cona.entity;

import com.cona.enums.ContractType;
import com.cona.enums.EmploymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;


@Builder
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Table(name = "employees")
@Entity

public class Employee {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;

    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    @Column(nullable = false)
    private String nombreCompleto;

    private String telefono;

    @Column(length = 13)
    private String rfc;

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal pagoPorHora;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EmploymentStatus estatus = EmploymentStatus.ACTIVO;

    private LocalDate fechaFinContrato;

    @Column(nullable = false)
    private LocalDate fechaInicioContrato;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ContractType tipoContrato;


    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private BankData bankData;

}
