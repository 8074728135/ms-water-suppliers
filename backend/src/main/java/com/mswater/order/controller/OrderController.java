package com.mswater.order.controller;

import com.mswater.common.response.ApiResponse;
import com.mswater.order.dto.CreateOrderRequest;
import com.mswater.order.dto.OrderResponse;
import com.mswater.order.service.OrderService;
import com.mswater.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal User user) {
        List<OrderResponse> orders = orderService.getCustomerOrders(user.getId());
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        OrderResponse response = orderService.getOrderById(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        OrderResponse response = orderService.cancelOrder(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Order cancelled", response));
    }

    @PostMapping("/{id}/reorder")
    public ResponseEntity<ApiResponse<OrderResponse>> reorder(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody CreateOrderRequest request) {
        // Reorder uses same create logic — frontend pre-fills from previous order
        OrderResponse response = orderService.createOrder(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reorder created successfully", response));
    }
}
