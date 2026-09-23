package com.mswater.driver.entity;

import com.mswater.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "drivers")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "license_number", length = 50)
    private String licenseNumber;

    @Column(length = 20)
    private String status = "AVAILABLE"; // AVAILABLE, BUSY, ON_LEAVE

    @Column(name = "total_deliveries")
    private Integer totalDeliveries = 0;

    @Column(name = "completed_deliveries")
    private Integer completedDeliveries = 0;

    @Column(name = "failed_deliveries")
    private Integer failedDeliveries = 0;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
