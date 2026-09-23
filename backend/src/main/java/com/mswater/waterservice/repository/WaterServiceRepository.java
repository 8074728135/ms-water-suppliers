package com.mswater.waterservice.repository;

import com.mswater.waterservice.entity.WaterService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaterServiceRepository extends JpaRepository<WaterService, Long> {
    List<WaterService> findByIsActiveTrueOrderBySortOrderAsc();
    Optional<WaterService> findByName(String name);
}
