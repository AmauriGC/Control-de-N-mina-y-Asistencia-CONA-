package com.cona.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bank_data")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BankData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", unique = true)
    private Employee employee;

    @Column(nullable = false)
    private String banco;

    @Column(nullable = false)
    private String numeroCuenta;

    @Column(nullable = false)
    private String clabeInterbancaria;
}

