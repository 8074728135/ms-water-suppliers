package com.mswater.customer.controller;

import com.mswater.common.exception.ResourceNotFoundException;
import com.mswater.common.response.ApiResponse;
import com.mswater.customer.entity.Customer;
import com.mswater.customer.entity.CustomerAddress;
import com.mswater.customer.repository.CustomerAddressRepository;
import com.mswater.customer.repository.CustomerRepository;
import com.mswater.user.entity.Role;
import com.mswater.user.entity.User;
import com.mswater.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/customers")
@PreAuthorize("hasRole('OWNER')")
@RequiredArgsConstructor
public class AdminCustomerController {

    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository addressRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCustomers(
            @RequestParam(required = false) String q) {

        List<Customer> customers;
        if (q != null && !q.trim().isEmpty()) {
            customers = customerRepository.searchByNameOrMobile(q.trim());
        } else {
            customers = customerRepository.findAll();
        }

        List<Map<String, Object>> result = customers.stream().map(this::toMap).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCustomer(@PathVariable Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        Map<String, Object> map = toMap(customer);
        List<CustomerAddress> addresses = addressRepository.findByCustomerId(customer.getId());
        map.put("addresses", addresses);

        return ResponseEntity.ok(ApiResponse.success(map));
    }

    @PostMapping("/quick")
    public ResponseEntity<ApiResponse<Map<String, Object>>> quickCreateCustomer(
            @RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "Walk-in / Phone Customer");
        String mobile = body.get("mobile");
        String addressLine = body.getOrDefault("address", "Hindupur");

        if (mobile == null || mobile.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mobile number is required"));
        }

        // Check if user exists
        User user = userRepository.findByMobile(mobile.trim())
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .name(name)
                            .mobile(mobile.trim())
                            .passwordHash(passwordEncoder.encode("mswater123"))
                            .role(Role.CUSTOMER)
                            .isActive(true)
                            .build();
                    return userRepository.save(newUser);
                });

        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Customer newCustomer = Customer.builder()
                            .user(user)
                            .totalOrders(0)
                            .totalSpent(BigDecimal.ZERO)
                            .outstandingAmount(BigDecimal.ZERO)
                            .build();
                    return customerRepository.save(newCustomer);
                });

        // Add default address if provided and not already present
        if (!addressRepository.existsByCustomerId(customer.getId())) {
            CustomerAddress address = CustomerAddress.builder()
                    .customer(customer)
                    .label("HOME")
                    .addressLine1(addressLine)
                    .city("Hindupur")
                    .isDefault(true)
                    .build();
            addressRepository.save(address);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toMap(customer)));
    }

    private Map<String, Object> toMap(Customer customer) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", customer.getId());
        map.put("name", customer.getUser().getName());
        map.put("mobile", customer.getUser().getMobile());
        map.put("email", customer.getUser().getEmail() != null ? customer.getUser().getEmail() : "");
        map.put("totalOrders", customer.getTotalOrders());
        map.put("totalSpent", customer.getTotalSpent());
        map.put("outstandingAmount", customer.getOutstandingAmount());
        map.put("memberSince", customer.getCreatedAt() != null ? customer.getCreatedAt().toString() : "");
        return map;
    }
}
