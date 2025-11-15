package com.cona.entity;

import com.cona.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType tipo;

    @Column(nullable = false)
    private String mensaje;

    @Column(nullable = false)
    private Instant fechaCreacion;

    @Column(nullable = false)
    private Boolean leida = false;

    private Instant fechaLectura;

    private Long referenciaId;

    private String referenciaTipo;
}

