package com.mswater.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private String status;
    private String source;
    private String customerName;
    private String customerMobile;
    private Long customerId;

    // Items
    private List<OrderItemResponse> items;

    // Delivery
    private String deliveryAddress;
    private String addressLabel;
    private LocalDate deliveryDate;
    private String timeSlot;
    private String instructions;

    // Pricing
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal discount;
    private BigDecimal totalAmount;

    // Payment
    private String paymentMethod;
    private String paymentStatus;

    // Driver
    private String driverName;
    private Long driverId;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private String serviceName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
