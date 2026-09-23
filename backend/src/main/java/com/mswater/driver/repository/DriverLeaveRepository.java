package com.mswater.driver.repository;

import com.mswater.driver.entity.DriverLeave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DriverLeaveRepository extends JpaRepository<DriverLeave, Long> {

    List<DriverLeave> findByDriverIdOrderByCreatedAtDesc(Long driverId);

    @Query("SELECT dl FROM DriverLeave dl WHERE dl.driver.id = :driverId AND :date BETWEEN dl.fromDate AND dl.toDate AND dl.status = 'APPROVED'")
    List<DriverLeave> findActiveLeavesByDriverAndDate(@Param("driverId") Long driverId, @Param("date") LocalDate date);

    @Query("SELECT dl FROM DriverLeave dl WHERE :date BETWEEN dl.fromDate AND dl.toDate AND dl.status = 'APPROVED'")
    List<DriverLeave> findAllActiveLeavesOnDate(@Param("date") LocalDate date);
}
