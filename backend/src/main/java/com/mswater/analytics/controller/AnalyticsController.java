package com.mswater.analytics.controller;

import com.mswater.common.response.ApiResponse;
import com.mswater.customer.repository.CustomerRepository;
import com.mswater.order.enums.OrderStatus;
import com.mswater.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('OWNER')")
@RequiredArgsConstructor
public class AnalyticsController {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) date = LocalDate.now();

        long totalOrders = orderRepository.countByDeliveryDate(date);
        long pendingOrders = orderRepository.countByDeliveryDateAndStatus(date, OrderStatus.PENDING);
        long confirmedOrders = orderRepository.countByDeliveryDateAndStatus(date, OrderStatus.CONFIRMED);
        long assignedOrders = orderRepository.countByDeliveryDateAndStatus(date, OrderStatus.ASSIGNED);
        long deliveredOrders = orderRepository.countByDeliveryDateAndStatus(date, OrderStatus.DELIVERED);
        long onTheWayOrders = orderRepository.countByDeliveryDateAndStatus(date, OrderStatus.ON_THE_WAY);
        long cancelledOrders = orderRepository.countByDeliveryDateAndStatus(date, OrderStatus.CANCELLED);
        long failedOrders = orderRepository.countByDeliveryDateAndStatus(date, OrderStatus.FAILED);
        BigDecimal revenue = orderRepository.sumRevenueByDate(date);
        if (revenue == null) {
            revenue = BigDecimal.ZERO;
        }

        long unassigned = pendingOrders + confirmedOrders;

        Map<String, Object> stats = Map.ofEntries(
                Map.entry("date", date.toString()),
                Map.entry("totalOrders", totalOrders),
                Map.entry("pendingOrders", pendingOrders),
                Map.entry("confirmedOrders", confirmedOrders),
                Map.entry("assignedOrders", assignedOrders),
                Map.entry("deliveredOrders", deliveredOrders),
                Map.entry("onTheWayOrders", onTheWayOrders),
                Map.entry("cancelledOrders", cancelledOrders),
                Map.entry("failedOrders", failedOrders),
                Map.entry("unassignedOrders", unassigned),
                Map.entry("revenue", revenue),
                Map.entry("totalCustomers", customerRepository.count())
        );

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
