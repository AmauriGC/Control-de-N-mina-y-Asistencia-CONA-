package com.cona.modules.attendance.repository;

import com.cona.modules.attendance.entity.Attendance;
import com.cona.modules.employees.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    Optional<Attendance> findByEmployeeAndDate(Employee employee, LocalDate date);
    
    List<Attendance> findByEmployeeOrderByDateDesc(Employee employee);
    
    List<Attendance> findByEmployeeAndDateBetweenOrderByDateDesc(Employee employee, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a FROM Attendance a WHERE a.date = :date ORDER BY a.createdAt DESC")
    List<Attendance> findByDateOrderByCreatedAtDesc(@Param("date") LocalDate date);
    
    @Query("SELECT a FROM Attendance a WHERE a.employee.employeeKey = :employeeKey AND a.date = :date")
    Optional<Attendance> findByEmployeeKeyAndDate(@Param("employeeKey") String employeeKey, @Param("date") LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee = :employee AND a.date BETWEEN :startDate AND :endDate AND a.status = 'PRESENT'")
    long countPresentDaysByEmployeeAndDateRange(@Param("employee") Employee employee, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee = :employee AND a.date BETWEEN :startDate AND :endDate AND a.status = 'LATE'")
    long countLateDaysByEmployeeAndDateRange(@Param("employee") Employee employee, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee = :employee AND a.date BETWEEN :startDate AND :endDate AND a.status = 'ABSENT'")
    long countAbsentDaysByEmployeeAndDateRange(@Param("employee") Employee employee, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}