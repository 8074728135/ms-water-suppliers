package com.mswater.order.repository;

import com.mswater.order.entity.Order;
import com.mswater.order.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items LEFT JOIN FETCH o.customer c LEFT JOIN FETCH c.user WHERE o.customer.id = :customerId ORDER BY o.createdAt DESC")
    List<Order> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") Long customerId);

    @Query("SELECT o FROM Order o WHERE o.customer.id = :customerId AND o.status NOT IN ('DELIVERED', 'CANCELLED') ORDER BY o.createdAt DESC")
    List<Order> findActiveOrdersByCustomerId(@Param("customerId") Long customerId);

    List<Order> findByDeliveryDateAndStatusOrderByCreatedAtAsc(LocalDate date, OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.deliveryDate = :date ORDER BY o.createdAt ASC")
    List<Order> findByDeliveryDate(@Param("date") LocalDate date);

    @Query("SELECT o FROM Order o WHERE o.status = :status ORDER BY o.createdAt ASC")
    List<Order> findByStatus(@Param("status") OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deliveryDate = :date")
    long countByDeliveryDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deliveryDate = :date AND o.status = :status")
    long countByDeliveryDateAndStatus(@Param("date") LocalDate date, @Param("status") OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.deliveryDate = :date AND o.status = 'DELIVERED'")
    java.math.BigDecimal sumRevenueByDate(@Param("date") LocalDate date);

    @Query("SELECT MAX(o.orderNumber) FROM Order o WHERE o.orderNumber LIKE :prefix")
    String findLastOrderNumberWithPrefix(@Param("prefix") String prefix);
}
