package com.mswater.delivery.controller;

import com.mswater.common.exception.BadRequestException;
import com.mswater.common.exception.ResourceNotFoundException;
import com.mswater.common.response.ApiResponse;
import com.mswater.delivery.entity.Delivery;
import com.mswater.delivery.repository.DeliveryRepository;
import com.mswater.driver.entity.Driver;
import com.mswater.driver.entity.DriverLeave;
import com.mswater.driver.repository.DriverRepository;
import com.mswater.driver.repository.DriverLeaveRepository;
import com.mswater.order.entity.Order;
import com.mswater.order.enums.OrderStatus;
import com.mswater.order.repository.OrderRepository;
import com.mswater.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
@PreAuthorize("hasRole('DRIVER')")
@RequiredArgsConstructor
public class DriverDeliveryController {

    private final DeliveryRepository deliveryRepository;
    private final DriverRepository driverRepository;
    private final DriverLeaveRepository driverLeaveRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/deliveries")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTodaysDeliveries(
            @AuthenticationPrincipal User user) {
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "userId", user.getId()));

        List<Delivery> deliveries = deliveryRepository.findByDriverIdAndDate(
                driver.getId(), LocalDate.now());

        List<Map<String, Object>> response = deliveries.stream().map(d -> {
            Order order = d.getOrder();
            Map<String, Object> item = new java.util.LinkedHashMap<>();
            item.put("deliveryId", d.getId());
            item.put("orderId", order.getId());
            item.put("orderNumber", order.getOrderNumber());
            item.put("customerName", order.getCustomer().getUser().getName());
            item.put("customerMobile", order.getCustomer().getUser().getMobile());
            item.put("address", order.getDeliveryAddress() != null ? order.getDeliveryAddress() : "");
            item.put("latitude", order.getDeliveryLatitude() != null ? order.getDeliveryLatitude() : "");
            item.put("longitude", order.getDeliveryLongitude() != null ? order.getDeliveryLongitude() : "");
            item.put("items", order.getItems().stream().map(i -> Map.<String, Object>of(
                    "service", i.getServiceName(),
                    "quantity", i.getQuantity(),
                    "price", i.getTotalPrice()
            )).toList());
            item.put("totalAmount", order.getTotalAmount());
            item.put("paymentMethod", order.getPaymentMethod());
            item.put("paymentStatus", order.getPaymentStatus());
            item.put("instructions", order.getInstructions() != null ? order.getInstructions() : "");
            item.put("status", d.getStatus());
            item.put("orderStatus", order.getStatus().name());
            return item;
        }).toList();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/deliveries/{id}/accept")
    @Transactional
    public ResponseEntity<ApiResponse<String>> acceptDelivery(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Delivery delivery = getDriverDelivery(id, user);
        validateDeliveryStatus(delivery, "ASSIGNED");

        delivery.setStatus("ACCEPTED");
        deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.ACCEPTED);
        orderRepository.save(order);

        return ResponseEntity.ok(ApiResponse.success("Delivery accepted"));
    }

    @PutMapping("/deliveries/{id}/start")
    @Transactional
    public ResponseEntity<ApiResponse<String>> startDelivery(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Delivery delivery = getDriverDelivery(id, user);
        validateDeliveryStatus(delivery, "ACCEPTED");

        delivery.setStatus("ON_THE_WAY");
        delivery.setStartedAt(LocalDateTime.now());
        deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.ON_THE_WAY);
        orderRepository.save(order);

        return ResponseEntity.ok(ApiResponse.success("Delivery started"));
    }

    @PutMapping("/deliveries/{id}/arrive")
    @Transactional
    public ResponseEntity<ApiResponse<String>> markArrived(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Delivery delivery = getDriverDelivery(id, user);
        validateDeliveryStatus(delivery, "ON_THE_WAY");

        delivery.setStatus("ARRIVED");
        delivery.setArrivedAt(LocalDateTime.now());
        deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.ARRIVED);
        orderRepository.save(order);

        return ResponseEntity.ok(ApiResponse.success("Marked as arrived"));
    }

    @PutMapping("/deliveries/{id}/complete")
    @Transactional
    public ResponseEntity<ApiResponse<String>> completeDelivery(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, String> body) {
        Delivery delivery = getDriverDelivery(id, user);
        validateDeliveryStatus(delivery, "ARRIVED");

        delivery.setStatus("DELIVERED");
        delivery.setCompletedAt(LocalDateTime.now());
        deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.DELIVERED);

        // Handle payment if provided
        if (body != null && body.containsKey("paymentStatus")) {
            order.setPaymentStatus(body.get("paymentStatus"));
        }
        if (body != null && body.containsKey("paymentMethod")) {
            order.setPaymentMethod(body.get("paymentMethod"));
        }

        orderRepository.save(order);

        // Update driver stats
        Driver driver = delivery.getDriver();
        driver.setCompletedDeliveries(driver.getCompletedDeliveries() + 1);
        driverRepository.save(driver);

        return ResponseEntity.ok(ApiResponse.success("Delivery completed"));
    }

    @PutMapping("/deliveries/{id}/fail")
    @Transactional
    public ResponseEntity<ApiResponse<String>> failDelivery(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        Delivery delivery = getDriverDelivery(id, user);

        if (!"ON_THE_WAY".equals(delivery.getStatus()) && !"ARRIVED".equals(delivery.getStatus())) {
            throw new BadRequestException("Delivery can only be marked as failed when on the way or arrived");
        }

        delivery.setStatus("FAILED");
        deliveryRepository.save(delivery);

        Order order = delivery.getOrder();
        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);

        Driver driver = delivery.getDriver();
        driver.setFailedDeliveries(driver.getFailedDeliveries() + 1);
        driverRepository.save(driver);

        return ResponseEntity.ok(ApiResponse.success("Delivery marked as failed"));
    }

    @PutMapping("/availability")
    @Transactional
    public ResponseEntity<ApiResponse<String>> updateAvailability(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "userId", user.getId()));

        String status = body.get("status");
        if (!List.of("AVAILABLE", "BUSY", "ON_LEAVE").contains(status)) {
            throw new BadRequestException("Invalid status: " + status);
        }

        driver.setStatus(status);
        driverRepository.save(driver);

        return ResponseEntity.ok(ApiResponse.success("Availability updated to " + status));
    }

    @GetMapping({"/duty-status", "/duty"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDutyStatus(@AuthenticationPrincipal User user) {
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "userId", user.getId()));

        LocalDate today = LocalDate.now();
        List<DriverLeave> activeLeaves = driverLeaveRepository.findActiveLeavesByDriverAndDate(driver.getId(), today);
        boolean isOnLeave = !activeLeaves.isEmpty() || "ON_LEAVE".equalsIgnoreCase(driver.getStatus());

        Map<String, Object> res = new java.util.LinkedHashMap<>();
        res.put("driverId", driver.getId());
        res.put("status", driver.getStatus());
        res.put("isOnLeave", isOnLeave);
        res.put("currentLeave", activeLeaves.isEmpty() ? null : Map.of(
                "id", activeLeaves.get(0).getId(),
                "fromDate", activeLeaves.get(0).getFromDate().toString(),
                "toDate", activeLeaves.get(0).getToDate().toString(),
                "reason", activeLeaves.get(0).getReason() != null ? activeLeaves.get(0).getReason() : "",
                "status", activeLeaves.get(0).getStatus()
        ));
        res.put("allLeaves", driverLeaveRepository.findByDriverIdOrderByCreatedAtDesc(driver.getId()).stream().map(l -> Map.of(
                "id", l.getId(),
                "fromDate", l.getFromDate().toString(),
                "toDate", l.getToDate().toString(),
                "reason", l.getReason() != null ? l.getReason() : "",
                "status", l.getStatus()
        )).toList());

        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PostMapping("/leave")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> applyForLeave(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "userId", user.getId()));

        String fromDateStr = body.get("fromDate");
        String toDateStr = body.get("toDate");
        String reason = body.get("reason");

        LocalDate fromDate = fromDateStr != null && !fromDateStr.isBlank() ? LocalDate.parse(fromDateStr) : LocalDate.now();
        LocalDate toDate = toDateStr != null && !toDateStr.isBlank() ? LocalDate.parse(toDateStr) : fromDate;

        DriverLeave leave = DriverLeave.builder()
                .driver(driver)
                .fromDate(fromDate)
                .toDate(toDate)
                .reason(reason != null && !reason.isBlank() ? reason : "Personal Leave")
                .status("APPROVED")
                .build();
        driverLeaveRepository.save(leave);

        driver.setStatus("ON_LEAVE");
        driverRepository.save(driver);

        return ResponseEntity.ok(ApiResponse.success("Leave recorded successfully. You are marked On Leave and will not be assigned deliveries.", Map.of(
                "leaveId", leave.getId(),
                "status", "ON_LEAVE",
                "fromDate", fromDate.toString(),
                "toDate", toDate.toString()
        )));
    }

    @RequestMapping(value = {"/resume-duty", "/duty/resume"}, method = {RequestMethod.POST, RequestMethod.PUT})
    @Transactional
    public ResponseEntity<ApiResponse<String>> resumeDuty(@AuthenticationPrincipal User user) {
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "userId", user.getId()));

        LocalDate today = LocalDate.now();
        List<DriverLeave> activeLeaves = driverLeaveRepository.findActiveLeavesByDriverAndDate(driver.getId(), today);
        for (DriverLeave leave : activeLeaves) {
            leave.setStatus("CANCELLED");
            driverLeaveRepository.save(leave);
        }

        driver.setStatus("AVAILABLE");
        driverRepository.save(driver);

        return ResponseEntity.ok(ApiResponse.success("Welcome back! You are now marked On Duty (Available)."));
    }

    // =================== HELPERS ===================

    private Delivery getDriverDelivery(Long deliveryId, User user) {
        Driver driver = driverRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "userId", user.getId()));

        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", deliveryId));

        if (!delivery.getDriver().getId().equals(driver.getId())) {
            throw new BadRequestException("This delivery is not assigned to you");
        }

        return delivery;
    }

    private void validateDeliveryStatus(Delivery delivery, String expectedStatus) {
        if (!expectedStatus.equals(delivery.getStatus())) {
            throw new BadRequestException("Delivery status must be " + expectedStatus +
                    " but is " + delivery.getStatus());
        }
    }
}
