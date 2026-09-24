package com.mswater.order.service;

import com.mswater.common.exception.BadRequestException;
import com.mswater.common.exception.ResourceNotFoundException;
import com.mswater.common.exception.UnauthorizedException;
import com.mswater.common.util.OrderNumberGenerator;
import com.mswater.customer.entity.Customer;
import com.mswater.customer.entity.CustomerAddress;
import com.mswater.customer.repository.CustomerRepository;
import com.mswater.customer.repository.CustomerAddressRepository;
import com.mswater.delivery.entity.Delivery;
import com.mswater.delivery.repository.DeliveryRepository;
import com.mswater.order.dto.CreateOrderRequest;
import com.mswater.order.dto.OrderResponse;
import com.mswater.order.entity.Order;
import com.mswater.order.entity.OrderItem;
import com.mswater.order.enums.OrderStatus;
import com.mswater.order.repository.OrderRepository;
import com.mswater.user.entity.User;
import com.mswater.driver.entity.Driver;
import com.mswater.driver.repository.DriverRepository;
import com.mswater.driver.repository.DriverLeaveRepository;
import com.mswater.waterservice.entity.WaterService;
import com.mswater.waterservice.repository.WaterServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository addressRepository;
    private final WaterServiceRepository waterServiceRepository;
    private final DeliveryRepository deliveryRepository;
    private final DriverRepository driverRepository;
    private final DriverLeaveRepository driverLeaveRepository;
    private final OrderNumberGenerator orderNumberGenerator;

    /**
     * Create an order for a customer.
     * Price is ALWAYS calculated server-side from the database.
     */
    @Transactional
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        // Idempotency check
        if (request.getIdempotencyKey() != null) {
            var existing = orderRepository.findByIdempotencyKey(request.getIdempotencyKey());
            if (existing.isPresent()) {
                return mapToResponse(existing.get());
            }
        }

        // Get customer
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "userId", userId));

        // Get water service and calculate price SERVER-SIDE
        WaterService waterService = waterServiceRepository.findById(request.getWaterServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Water Service", "id", request.getWaterServiceId()));

        if (!waterService.getIsActive()) {
            throw new BadRequestException("This water service is currently unavailable");
        }

        // Validate quantity
        int quantity = request.getQuantity();
        if (waterService.getIsQuantifiable()) {
            if (quantity < waterService.getMinQuantity() || quantity > waterService.getMaxQuantity()) {
                throw new BadRequestException("Quantity must be between " +
                        waterService.getMinQuantity() + " and " + waterService.getMaxQuantity());
            }
        } else {
            quantity = 1; // Non-quantifiable items (Full Tank, Half Tank) always qty 1
        }

        // Get address and verify ownership
        CustomerAddress address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", request.getAddressId()));

        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("This address does not belong to you");
        }

        // Validate delivery date
        if (request.getDeliveryDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Delivery date cannot be in the past");
        }

        // Calculate price (SERVER-SIDE - never trust frontend)
        BigDecimal unitPrice = waterService.getPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal deliveryCharge = BigDecimal.ZERO; // Configurable later
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(deliveryCharge).subtract(discount);

        // Generate order number
        String orderNumber = orderNumberGenerator.generateOrderNumber();

        // Build order
        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customer(customer)
                .source("WEBSITE")
                .status(OrderStatus.PENDING)
                .address(address)
                .deliveryAddress(buildAddressString(address))
                .deliveryLatitude(address.getLatitude())
                .deliveryLongitude(address.getLongitude())
                .deliveryDate(request.getDeliveryDate())
                .timeSlot(request.getTimeSlot())
                .instructions(request.getInstructions())
                .subtotal(subtotal)
                .deliveryCharge(deliveryCharge)
                .discount(discount)
                .totalAmount(totalAmount)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("PENDING")
                .idempotencyKey(request.getIdempotencyKey())
                .build();

        // Create order item
        OrderItem item = OrderItem.builder()
                .waterService(waterService)
                .serviceName(waterService.getDisplayName())
                .quantity(quantity)
                .unitPrice(unitPrice)
                .totalPrice(subtotal)
                .build();
        order.addItem(item);

        order = orderRepository.save(order);

        // Update customer stats
        customer.setTotalOrders(customer.getTotalOrders() + 1);
        customer.setTotalSpent(customer.getTotalSpent().add(totalAmount));
        customerRepository.save(customer);

        // If specific driver provided, assign it; otherwise auto-assign if driver is available
        if (request.getDriverId() != null) {
            assignDriver(order.getId(), request.getDriverId());
        } else {
            autoAssignIfDriverAvailable(order);
        }

        return mapToResponse(order);
    }

    /**
     * Create a phone order (owner creates on behalf of customer)
     */
    @Transactional
    public OrderResponse createPhoneOrder(User owner, Long customerId, CreateOrderRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", customerId));

        // Get water service and calculate price SERVER-SIDE
        WaterService waterService = waterServiceRepository.findById(request.getWaterServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Water Service", "id", request.getWaterServiceId()));

        int quantity = waterService.getIsQuantifiable() ? request.getQuantity() : 1;

        BigDecimal unitPrice = waterService.getPrice();
        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal totalAmount = subtotal;

        String orderNumber = orderNumberGenerator.generateOrderNumber();

        // Build delivery address from addressId or default customer address
        String deliveryAddress = "";
        BigDecimal lat = null, lng = null;
        if (request.getAddressId() != null && request.getAddressId() > 0) {
            CustomerAddress address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address", "id", request.getAddressId()));
            deliveryAddress = buildAddressString(address);
            lat = address.getLatitude();
            lng = address.getLongitude();
        } else {
            var defaultAddr = addressRepository.findByCustomerIdOrderByIsDefaultDescCreatedAtAsc(customer.getId());
            if (!defaultAddr.isEmpty()) {
                deliveryAddress = buildAddressString(defaultAddr.get(0));
                lat = defaultAddr.get(0).getLatitude();
                lng = defaultAddr.get(0).getLongitude();
            } else if (request.getInstructions() != null && request.getInstructions().contains("Address: ")) {
                deliveryAddress = request.getInstructions().substring(request.getInstructions().indexOf("Address: ") + 9).trim();
            } else {
                deliveryAddress = "Hindupur, Andhra Pradesh";
            }
        }

        Order order = Order.builder()
                .orderNumber(orderNumber)
                .customer(customer)
                .source("PHONE")
                .status(OrderStatus.PENDING)
                .deliveryAddress(deliveryAddress)
                .deliveryLatitude(lat)
                .deliveryLongitude(lng)
                .deliveryDate(request.getDeliveryDate() != null ? request.getDeliveryDate() : LocalDate.now())
                .timeSlot(request.getTimeSlot())
                .instructions(request.getInstructions())
                .subtotal(subtotal)
                .deliveryCharge(BigDecimal.ZERO)
                .discount(BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH")
                .paymentStatus("PENDING")
                .createdBy(owner)
                .build();

        OrderItem item = OrderItem.builder()
                .waterService(waterService)
                .serviceName(waterService.getDisplayName())
                .quantity(quantity)
                .unitPrice(unitPrice)
                .totalPrice(subtotal)
                .build();
        order.addItem(item);

        order = orderRepository.save(order);

        customer.setTotalOrders(customer.getTotalOrders() + 1);
        customer.setTotalSpent(customer.getTotalSpent().add(totalAmount));
        customerRepository.save(customer);

        // If specific driver provided, assign it; otherwise auto-assign if driver is available
        if (request.getDriverId() != null) {
            assignDriver(order.getId(), request.getDriverId());
        } else {
            autoAssignIfDriverAvailable(order);
        }

        return mapToResponse(order);
    }

    /**
     * Get customer's orders
     */
    public List<OrderResponse> getCustomerOrders(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "userId", userId));

        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get order by ID with ownership check
     */
    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // Ownership check for customers
        if (userId != null && !order.getCustomer().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have access to this order");
        }

        return mapToResponse(order);
    }

    /**
     * Get order for admin (no ownership check)
     */
    public OrderResponse getOrderForAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return mapToResponse(order);
    }

    /**
     * Get all orders for a date (admin)
     */
    public List<OrderResponse> getOrdersByDate(LocalDate date) {
        return orderRepository.findByDeliveryDate(date)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all orders by status (admin)
     */
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Cancel order (customer)
     */
    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!order.getCustomer().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You don't have access to this order");
        }

        if (!OrderStatus.isCustomerCancellable(order.getStatus())) {
            throw new BadRequestException("Order cannot be cancelled in current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        return mapToResponse(order);
    }

    /**
     * Confirm order (admin)
     */
    @Transactional
    public OrderResponse confirmOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        validateTransition(order.getStatus(), OrderStatus.CONFIRMED);
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return mapToResponse(order);
    }

    /**
     * Assign driver to order (admin / owner override)
     */
    @Transactional
    public OrderResponse assignDriver(Long orderId, Long driverId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        validateTransition(order.getStatus(), OrderStatus.ASSIGNED);

        var deliveries = deliveryRepository.findByOrderId(order.getId());
        Delivery delivery = deliveries.isEmpty() ?
                Delivery.builder().order(order).status("ASSIGNED").build() :
                deliveries.get(deliveries.size() - 1);

        if (driverId != null && driverId == 999L) {
            // Owner Self-Delivery
            delivery.setDriver(null);
            delivery.setStatus("ASSIGNED");
            deliveryRepository.save(delivery);
            order.setStatus(OrderStatus.ASSIGNED);
            orderRepository.save(order);
            return mapToResponse(order);
        }

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", driverId));

        delivery.setDriver(driver);
        delivery.setStatus("ASSIGNED");
        deliveryRepository.save(delivery);

        order.setStatus(OrderStatus.ASSIGNED);
        orderRepository.save(order);

        return mapToResponse(order);
    }

    /**
     * Automatically assign an order to an available driver if one is on duty.
     * Criteria:
     * 1. Driver status is 'AVAILABLE'
     * 2. User account is active
     * 3. Driver has no active leaves for the delivery date
     * 4. Load-balanced: select driver with the lowest count of deliveries on that date
     */
    public void autoAssignIfDriverAvailable(Order order) {
        try {
            LocalDate deliveryDate = order.getDeliveryDate() != null ? order.getDeliveryDate() : LocalDate.now();
            List<Driver> activeDrivers = driverRepository.findAllActive();

            List<Driver> eligibleDrivers = activeDrivers.stream()
                    .filter(d -> "AVAILABLE".equalsIgnoreCase(d.getStatus()))
                    .filter(d -> driverLeaveRepository.findActiveLeavesByDriverAndDate(d.getId(), deliveryDate).isEmpty())
                    .collect(Collectors.toList());

            if (eligibleDrivers.isEmpty()) {
                return;
            }

            // Pick driver with fewest deliveries on this date
            Driver bestDriver = eligibleDrivers.stream()
                    .min((d1, d2) -> Long.compare(
                            deliveryRepository.countByDriverIdAndDate(d1.getId(), deliveryDate),
                            deliveryRepository.countByDriverIdAndDate(d2.getId(), deliveryDate)
                    ))
                    .orElse(null);

            if (bestDriver != null) {
                var deliveries = deliveryRepository.findByOrderId(order.getId());
                Delivery delivery = deliveries.isEmpty() ?
                        Delivery.builder().order(order).status("ASSIGNED").build() :
                        deliveries.get(deliveries.size() - 1);

                delivery.setDriver(bestDriver);
                delivery.setStatus("ASSIGNED");
                deliveryRepository.save(delivery);

                order.setStatus(OrderStatus.ASSIGNED);
                orderRepository.save(order);
            }
        } catch (Exception e) {
            System.err.println("Warning: Auto-assignment skipped: " + e.getMessage());
        }
    }

    /**
     * Update order status (admin)
     */
    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        validateTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        orderRepository.save(order);

        return mapToResponse(order);
    }

    // ===================== HELPERS =====================

    private void validateTransition(OrderStatus from, OrderStatus to) {
        if (!from.canTransitionTo(to)) {
            throw new BadRequestException("Invalid status transition: " + from + " → " + to);
        }
    }

    private String buildAddressString(CustomerAddress address) {
        StringBuilder sb = new StringBuilder();
        sb.append(address.getAddressLine1());
        if (address.getAddressLine2() != null) sb.append(", ").append(address.getAddressLine2());
        if (address.getLandmark() != null) sb.append(", Near ").append(address.getLandmark());
        if (address.getArea() != null) sb.append(", ").append(address.getArea());
        if (address.getCity() != null) sb.append(", ").append(address.getCity());
        if (address.getPincode() != null) sb.append(" - ").append(address.getPincode());
        return sb.toString();
    }

    public OrderResponse mapToResponse(Order order) {
        // Get delivery info if assigned
        String driverName = null;
        Long driverId = null;
        var deliveries = deliveryRepository.findByOrderId(order.getId());
        if (!deliveries.isEmpty()) {
            var delivery = deliveries.get(deliveries.size() - 1); // Latest delivery
            if (delivery.getDriver() != null) {
                driverId = delivery.getDriver().getId();
                driverName = delivery.getDriver().getUser() != null ?
                        delivery.getDriver().getUser().getName() : null;
            } else if ("ASSIGNED".equals(delivery.getStatus()) || "ON_THE_WAY".equals(delivery.getStatus()) || "ARRIVED".equals(delivery.getStatus()) || "DELIVERED".equals(delivery.getStatus())) {
                driverId = 999L;
                driverName = "Owner (Self-Delivery)";
            }
        }

        List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .id(item.getId())
                        .serviceName(item.getServiceName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .source(order.getSource())
                .customerName(order.getCustomer().getUser().getName())
                .customerMobile(order.getCustomer().getUser().getMobile())
                .customerId(order.getCustomer().getId())
                .items(items)
                .deliveryAddress(order.getDeliveryAddress())
                .addressLabel(order.getAddress() != null ? order.getAddress().getLabel() : null)
                .deliveryDate(order.getDeliveryDate())
                .timeSlot(order.getTimeSlot())
                .instructions(order.getInstructions())
                .subtotal(order.getSubtotal())
                .deliveryCharge(order.getDeliveryCharge())
                .discount(order.getDiscount())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .driverName(driverName)
                .driverId(driverId)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
