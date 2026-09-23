package com.mswater.order.enums;

import java.util.Set;
import java.util.Map;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    ASSIGNED,
    ACCEPTED,
    ON_THE_WAY,
    ARRIVED,
    DELIVERED,
    CANCELLED,
    REJECTED,
    FAILED;

    // Define valid state transitions
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
        PENDING, Set.of(CONFIRMED, ASSIGNED, CANCELLED),
        CONFIRMED, Set.of(ASSIGNED, CANCELLED),
        ASSIGNED, Set.of(ASSIGNED, ACCEPTED, REJECTED, CANCELLED),
        ACCEPTED, Set.of(ASSIGNED, ON_THE_WAY, CANCELLED),
        ON_THE_WAY, Set.of(ARRIVED, FAILED, CANCELLED),
        ARRIVED, Set.of(DELIVERED, FAILED, CANCELLED),
        REJECTED, Set.of(ASSIGNED, CANCELLED),       // Owner can reassign
        FAILED, Set.of(PENDING, ASSIGNED, CANCELLED) // Owner can reschedule or reassign
    );

    public boolean canTransitionTo(OrderStatus target) {
        Set<OrderStatus> allowed = VALID_TRANSITIONS.get(this);
        return allowed != null && allowed.contains(target);
    }

    public static boolean isTerminal(OrderStatus status) {
        return status == DELIVERED || status == CANCELLED;
    }

    public static boolean isCustomerCancellable(OrderStatus status) {
        return status == PENDING || status == CONFIRMED;
    }
}
