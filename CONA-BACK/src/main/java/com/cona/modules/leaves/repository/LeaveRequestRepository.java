package com.cona.modules.leaves.repository;

import com.cona.modules.leaves.entity.LeaveRequest;
import com.cona.modules.leaves.enums.LeaveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE " +
           "(:status IS NULL OR lr.status = :status) AND " +
           "(:employeeName IS NULL OR LOWER(lr.employee.fullName) LIKE LOWER(CONCAT('%', :employeeName, '%')))")
    Page<LeaveRequest> findByFilters(@Param("status") LeaveStatus status, 
                                   @Param("employeeName") String employeeName, 
                                   Pageable pageable);
    
    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    
    List<LeaveRequest> findByStatusOrderByCreatedAtAsc(LeaveStatus status);
    
    long countByStatus(LeaveStatus status);
}