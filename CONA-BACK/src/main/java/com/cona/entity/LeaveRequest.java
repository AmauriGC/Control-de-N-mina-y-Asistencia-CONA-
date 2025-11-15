package com.cona.entity;

import com.cona.enums.LeaveType;
import com.cona.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "leave_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee empleado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType tipo;

    @Column(nullable = false)
    private LocalDate fechaInicio;

    @Column(nullable = false)
    private LocalDate fechaFin;

    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus estatus = RequestStatus.PENDIENTE;

    @Column(nullable = false)
    private Instant fechaSolicitud;

    private Instant fechaResolucion;

    private String comentariosAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User administrador;
}

