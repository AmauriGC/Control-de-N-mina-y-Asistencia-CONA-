package com.cona.modules.system_config.repository;

import com.cona.modules.system_config.entity.Holiday;
import com.cona.modules.system_config.enums.HolidayType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    boolean existsByDate(LocalDate date);

    boolean existsByDateAndIdNot(LocalDate date, Long id);
    
    Optional<Holiday> findByDate(LocalDate date);

    @Query("SELECT h FROM Holiday h WHERE YEAR(h.date) = :year ORDER BY h.date ASC")
    List<Holiday> findByYear(@Param("year") int year);

    List<Holiday> findByTypeOrderByDateAsc(HolidayType type);

    @Query("SELECT h FROM Holiday h WHERE h.date >= :currentDate ORDER BY h.date ASC")
    List<Holiday> findUpcomingHolidays(@Param("currentDate") LocalDate currentDate);

    boolean existsByDateAndType(LocalDate date, HolidayType type);
}