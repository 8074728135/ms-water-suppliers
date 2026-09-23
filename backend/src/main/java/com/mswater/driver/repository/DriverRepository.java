package com.mswater.driver.repository;

import com.mswater.driver.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByUserId(Long userId);
    List<Driver> findByStatus(String status);

    @Query("SELECT d FROM Driver d JOIN d.user u WHERE u.isActive = true")
    List<Driver> findAllActive();
}
