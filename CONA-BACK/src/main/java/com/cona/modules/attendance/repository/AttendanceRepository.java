package com.cona.modules.attendance.repository;

import com.cona.modules.attendance.entity.Attendance;
import com.cona.modules.employees.entity.Employee;
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
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    // Some deployments might end up with duplicate rows for employee+date; use List to avoid NonUniqueResultException
    List<Attendance> findByEmployeeAndDate(Employee employee, LocalDate date);
    
    List<Attendance> findByEmployeeOrderByDateDesc(Employee employee);
    
    Page<Attendance> findByEmployee(Employee employee, Pageable pageable);
    
    List<Attendance> findByEmployeeAndDateBetweenOrderByDateDesc(Employee employee, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId AND a.date BETWEEN :startDate AND :endDate ORDER BY a.date DESC")
    List<Attendance> findByEmployeeIdAndDateBetweenOrderByDateDesc(@Param("employeeId") Long employeeId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
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
    
    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId AND a.date = :date")
    List<Attendance> findByEmployeeIdAndDate(@Param("employeeId") Long employeeId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = 'PRESENT'")
    long countPresentByDate(@Param("date") LocalDate date);

    @Query("SELECT e FROM Employee e WHERE e.contractEndDate IS NOT NULL AND e.contractEndDate BETWEEN CURRENT_DATE AND :limitDate")
    List<Employee> findContractsExpiringSoon(@Param("limitDate") LocalDate limitDate);

    @Query("""
    SELECT 
        a.date AS date,
        SUM(CASE WHEN a.status = com.cona.modules.attendance.enums.AttendanceStatus.PRESENT THEN 1 ELSE 0 END) AS presentCount,
        SUM(CASE WHEN a.status = com.cona.modules.attendance.enums.AttendanceStatus.LATE THEN 1 ELSE 0 END) AS lateCount,
        SUM(CASE WHEN a.status IN (
            com.cona.modules.attendance.enums.AttendanceStatus.ABSENT,
            com.cona.modules.attendance.enums.AttendanceStatus.JUSTIFIED_ABSENCE,
            com.cona.modules.attendance.enums.AttendanceStatus.JUSTIFICATION_REJECTED
        ) THEN 1 ELSE 0 END) AS absentCount
    FROM Attendance a
    WHERE a.date BETWEEN :start AND :end
    GROUP BY a.date
    ORDER BY a.date
""")
    List<Object[]> getWeeklyAttendanceRaw(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );


    List<Attendance> findByDateBetween(LocalDate startMonth, LocalDate endMonth);
}