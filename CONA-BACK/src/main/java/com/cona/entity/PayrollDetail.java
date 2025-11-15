package com.cona.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "payroll_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payroll_id", nullable = false)
    private Payroll nomina;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee empleado;

    @Column(precision = 8, scale = 2)
    private BigDecimal horasTrabajadas;

    @Column(precision = 14, scale = 2)
    private BigDecimal montoBruto;

    @Column(precision = 14, scale = 2)
    private BigDecimal isr;

    @Column(precision = 14, scale = 2)
    private BigDecimal imss;

    @Column(precision = 14, scale = 2)
    private BigDecimal otrasDeducciones;

    @Column(precision = 14, scale = 2)
    private BigDecimal bonos;

    @Column(precision = 14, scale = 2)
    private BigDecimal montoNeto;

    @Column(precision = 14, scale = 2)
    private BigDecimal percepcionesTotales;

    @Column(precision = 14, scale = 2)
    private BigDecimal deduccionesTotales;

    @OneToOne(mappedBy = "detalleNomina", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PaymentReceipt recibo;
}

