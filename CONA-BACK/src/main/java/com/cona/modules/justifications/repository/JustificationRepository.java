package com.cona.modules.justifications.repository;

import com.cona.modules.justifications.entity.Justification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JustificationRepository extends JpaRepository<Justification, Long> {
    Optional<Justification> findByAttendanceId(Long attendanceId);
    List<Justification> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<Justification> findAllByOrderByCreatedAtDesc();

    @Query("SELECT j FROM Justification j WHERE j.status = 'PENDING'")
    List<Justification> findPendingJustifications();
}
