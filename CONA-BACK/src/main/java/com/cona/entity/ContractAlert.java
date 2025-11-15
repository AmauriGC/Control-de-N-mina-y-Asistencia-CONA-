package com.cona.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "contract_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contrato;

    @Column(nullable = false)
    private LocalDate fechaAlerta;

    private Integer diasAnticipacion;

    @Column(nullable = false)
    private Boolean atendido = false;

    private LocalDate fechaAtencion;
}

