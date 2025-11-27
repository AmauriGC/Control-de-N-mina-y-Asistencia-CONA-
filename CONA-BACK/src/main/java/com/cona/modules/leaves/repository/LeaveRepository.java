package com.cona.modules.leaves.repository;

import com.cona.modules.leaves.entity.Leave;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {
    
    Optional<Leave> findByLeaveRequestId(Long leaveRequestId);
    
    List<Leave> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    
    @Query("SELECT l FROM Leave l WHERE " +
           "(:employeeName IS NULL OR LOWER(l.employee.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%')))")
    Page<Leave> findByFilters(@Param("employeeName") String employeeName, Pageable pageable);
}