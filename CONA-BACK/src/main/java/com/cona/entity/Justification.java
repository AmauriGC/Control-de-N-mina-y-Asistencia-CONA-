package com.cona.entity;

import com.cona.enums.DocumentType;
import com.cona.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "justifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Justification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attendance_id", nullable = false, unique = true)
    private Attendance ausencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee empleado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType tipoDocumento;

    private String archivoComprobatorio;

    private String comentariosEmpleado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus estatus = RequestStatus.PENDIENTE;

    @Column(nullable = false)
    private Instant fechaCarga;

    private Instant fechaValidacion;

    private String comentariosAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User administrador;

    private Integer diasRestantesValidacion;
}

