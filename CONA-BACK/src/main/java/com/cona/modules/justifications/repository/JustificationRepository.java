package com.cona.modules.justifications.repository;

import com.cona.modules.justifications.entity.Justification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JustificationRepository extends JpaRepository<Justification, Long> {
}
