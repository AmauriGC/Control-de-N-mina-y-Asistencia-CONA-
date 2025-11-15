package com.cona.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "payment_receipts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payroll_detail_id", nullable = false, unique = true)
    private PayrollDetail detalleNomina;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee empleado;

    @Column(nullable = false)
    private Instant fechaGeneracion;

    private String periodo;

    private String archivoPdf;

    @Column(unique = true)
    private String folio;
}

