package com.mswater.order.controller;

import com.mswater.common.response.ApiResponse;
import com.mswater.order.dto.CreateOrderRequest;
import com.mswater.order.dto.OrderResponse;
import com.mswater.order.enums.OrderStatus;
import com.mswater.order.service.OrderService;
import com.mswater.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('OWNER')")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String status) {

        List<OrderResponse> orders;
        if (date != null) {
            orders = orderService.getOrdersByDate(date);
        } else if (status != null) {
            orders = orderService.getOrdersByStatus(OrderStatus.valueOf(status));
        } else {
            orders = orderService.getOrdersByDate(LocalDate.now());
        }

        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderForAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createPhoneOrder(
            @AuthenticationPrincipal User owner,
            @RequestParam Long customerId,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createPhoneOrder(owner, customerId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Phone order created", response));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(@PathVariable Long id) {
        OrderResponse response = orderService.confirmOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order confirmed", response));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<OrderResponse>> assignDriver(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body) {
        Long driverId = body.get("driverId");
        OrderResponse response = orderService.assignDriver(id, driverId);
        return ResponseEntity.ok(ApiResponse.success("Driver assigned", response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        OrderResponse response = orderService.updateStatus(id, OrderStatus.CANCELLED);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", response));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<ApiResponse<OrderResponse>> rescheduleOrder(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        // Reset to PENDING for rescheduling
        OrderResponse response = orderService.updateStatus(id, OrderStatus.PENDING);
        return ResponseEntity.ok(ApiResponse.success("Order rescheduled", response));
    }
}
