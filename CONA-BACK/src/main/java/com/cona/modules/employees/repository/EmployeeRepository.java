package com.cona.modules.employees.repository;

import com.cona.modules.employees.entity.Employee;
import com.cona.modules.employees.enums.EmployeeStatus;
import com.cona.modules.system_config.entity.WorkSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    boolean existsByRfc(String rfc);
    boolean existsByEmployeeKey(String employeeKey);
    long countByStatus(EmployeeStatus status);
    Page<Employee> findByStatus(EmployeeStatus status, Pageable pageable);
    Page<Employee> findByFullNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Employee> findByStatusAndFullNameContainingIgnoreCase(EmployeeStatus status, String name, Pageable pageable);
    boolean existsByRfcAndIdNot(String rfc, Long id);
    Optional<Employee> findByUserId(Long userId);
    Optional<Employee> findByEmployeeKey(String employeeKey);
    boolean existsByWorkSchedule(WorkSchedule workSchedule);
}
