package com.cona.modules.payroll.repository;

import com.cona.modules.payroll.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    
    @Query("SELECT p FROM Payroll p WHERE p.employee.id = :employeeId ORDER BY p.periodEnd DESC")
    List<Payroll> findByEmployeeId(@Param("employeeId") Long employeeId);
    
    @Query("SELECT p FROM Payroll p WHERE p.employee.id = :employeeId AND p.periodStart = :periodStart AND p.periodEnd = :periodEnd")
    Optional<Payroll> findByEmployeeIdAndPeriod(@Param("employeeId") Long employeeId, 
                                               @Param("periodStart") LocalDate periodStart, 
                                               @Param("periodEnd") LocalDate periodEnd);
    
    @Query("SELECT p FROM Payroll p WHERE p.periodStart >= :startDate AND p.periodEnd <= :endDate")
    List<Payroll> findByPeriodRange(@Param("startDate") LocalDate startDate, 
                                   @Param("endDate") LocalDate endDate);
}