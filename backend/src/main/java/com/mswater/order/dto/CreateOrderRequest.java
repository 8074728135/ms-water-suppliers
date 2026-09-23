package com.mswater.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateOrderRequest {

    @NotNull(message = "Water service ID is required")
    private Long waterServiceId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity = 1;

    @NotNull(message = "Address ID is required")
    private Long addressId;

    @NotNull(message = "Delivery date is required")
    private LocalDate deliveryDate;

    @NotNull(message = "Time slot is required")
    private String timeSlot;

    private String instructions;
    private String paymentMethod = "CASH";
    private String idempotencyKey;
    private Long driverId;
}
