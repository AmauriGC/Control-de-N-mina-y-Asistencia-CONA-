package com.cona.entity;

import com.cona.enums.ReportType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportType tipo;

    @Column(nullable = false)
    private Instant fechaGeneracion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by")
    private User generadoPor;

    private LocalDate periodoInicio;

    private LocalDate periodoFin;

    @Lob
    private String parametros;

    private String archivo;
}

