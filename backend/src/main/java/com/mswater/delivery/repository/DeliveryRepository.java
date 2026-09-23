package com.mswater.delivery.repository;

import com.mswater.delivery.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    List<Delivery> findByOrderId(Long orderId);

    @Query("SELECT d FROM Delivery d JOIN d.order o WHERE d.driver.id = :driverId AND o.deliveryDate = :date ORDER BY COALESCE(d.sequenceNumber, 999), d.id ASC")
    List<Delivery> findByDriverIdAndDate(@Param("driverId") Long driverId, @Param("date") LocalDate date);

    @Query("SELECT d FROM Delivery d WHERE d.driver.id = :driverId AND d.status IN ('ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED')")
    List<Delivery> findActiveByDriverId(@Param("driverId") Long driverId);

    @Query("SELECT COUNT(d) FROM Delivery d JOIN d.order o WHERE d.driver.id = :driverId AND o.deliveryDate = :date")
    long countByDriverIdAndDate(@Param("driverId") Long driverId, @Param("date") LocalDate date);
}
