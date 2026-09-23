package com.mswater.common.util;

import com.mswater.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Year;

@Component
@RequiredArgsConstructor
public class OrderNumberGenerator {

    private final OrderRepository orderRepository;

    /**
     * Generates a unique order number in format: WT-2026-000125
     */
    public synchronized String generateOrderNumber() {
        String year = String.valueOf(Year.now().getValue());
        String prefix = "WT-" + year + "-";

        String lastOrderNumber = orderRepository.findLastOrderNumberWithPrefix(prefix + "%");

        int nextSequence = 1;
        if (lastOrderNumber != null) {
            String sequencePart = lastOrderNumber.substring(prefix.length());
            try {
                nextSequence = Integer.parseInt(sequencePart) + 1;
            } catch (NumberFormatException e) {
                nextSequence = 1;
            }
        }

        return prefix + String.format("%06d", nextSequence);
    }
}
