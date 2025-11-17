package com.cona.modules.payroll.repository;

import com.cona.modules.payroll.entity.PaySlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaySlipRepository extends JpaRepository<PaySlip, Long> {
}
