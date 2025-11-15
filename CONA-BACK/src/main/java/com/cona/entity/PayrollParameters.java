package com.cona.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payroll_parameters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollParameters {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(precision = 12, scale = 2)
    private BigDecimal isrFijo;

    @Column(precision = 12, scale = 2)
    private BigDecimal imssFijo;

    @Column(precision = 12, scale = 2)
    private BigDecimal descuentoVacaciones;

    @Column(precision = 12, scale = 2)
    private BigDecimal salarioMinimoGeneral;

    private Integer diasPagoMes;

    private Integer horasLaboralesDia;

    @Column(precision = 12, scale = 2)
    private BigDecimal bonoPuntualidad;

    @Column(precision = 12, scale = 2)
    private BigDecimal descuentoRetardo;

    private LocalDate fechaVigencia;
}

