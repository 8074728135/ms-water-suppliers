package com.mswater.waterservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_services")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WaterService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name; // FULL_TANK, HALF_TANK, DRUM

    @Column(name = "display_name", nullable = false, length = 50)
    private String displayName; // "Full Tank", "Half Tank", "Drum"

    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "capacity_litres")
    private Integer capacityLitres;

    @Column(name = "is_quantifiable")
    private Boolean isQuantifiable = false; // true for drums (customer can pick qty)

    @Column(name = "min_quantity")
    private Integer minQuantity = 1;

    @Column(name = "max_quantity")
    private Integer maxQuantity = 20;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
