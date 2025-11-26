package com.cona.modules.justifications.repository;

import com.cona.modules.employees.entity.Employee;
import com.cona.modules.justifications.entity.Justification;
import com.cona.modules.justifications.enums.DocumentType;
import com.cona.modules.justifications.enums.JustificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface JustificationRepository extends JpaRepository<Justification, Long> {
    
    List<Justification> findByEmployeeAndStatus(Employee employee, JustificationStatus status);
    
    Page<Justification> findByEmployee(Employee employee, Pageable pageable);
    
    Page<Justification> findByStatus(JustificationStatus status, Pageable pageable);
    
    @Query("SELECT j FROM Justification j WHERE " +
           "(:employeeId IS NULL OR j.employee.id = :employeeId) AND " +
           "(:status IS NULL OR j.status = :status) AND " +
           "(:documentType IS NULL OR j.documentType = :documentType) AND " +
           "(:startDate IS NULL OR j.date >= :startDate) AND " +
           "(:endDate IS NULL OR j.date <= :endDate)")
    Page<Justification> findByFilters(@Param("employeeId") Long employeeId,
                                    @Param("status") JustificationStatus status,
                                    @Param("documentType") DocumentType documentType,
                                    @Param("startDate") LocalDate startDate,
                                    @Param("endDate") LocalDate endDate,
                                    Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(j) > 0 THEN true ELSE false END " +
           "FROM Justification j WHERE j.employee = :employee " +
           "AND j.date = :date " +
           "AND j.status IN ('PENDING', 'APPROVED')")
    boolean existsByEmployeeAndDate(@Param("employee") Employee employee, 
                                   @Param("date") LocalDate date);

    Optional<Justification> findByEmployeeAndDate(Employee employee, LocalDate date);

    @Query("SELECT COUNT(j) FROM Justification j WHERE j.status = 'PENDING'")
    long countPending();

    @Query("SELECT COUNT(j) FROM Justification j WHERE j.employee.id = :employeeId AND j.status = 'PENDING'")
    long countPendingByEmployee(@Param("employeeId") Long employeeId);
}