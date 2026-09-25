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

        String password = body.getOrDefault("password", "mswater123");

        if (mobile == null || mobile.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mobile number is required"));
        }

        String cleanMobile = mobile.trim().replaceAll("\\D", "");
        if (cleanMobile.length() != 10) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please enter a valid 10-digit mobile number"));
        }

        // Check if user exists
        User user = userRepository.findByMobile(cleanMobile)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .name(name)
                            .mobile(cleanMobile)
                            .passwordHash(passwordEncoder.encode(password.trim().isEmpty() ? "mswater123" : password.trim()))
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

    @PutMapping("/{id}/credentials")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateCustomerCredentials(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        User user = customer.getUser();

        if (body.containsKey("name") && body.get("name") != null && !body.get("name").trim().isEmpty()) {
            user.setName(body.get("name").trim());
        }

        if (body.containsKey("mobile") && body.get("mobile") != null) {
            String newMobile = body.get("mobile").trim().replaceAll("\\D", "");
            if (newMobile.length() != 10) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Phone number must be exactly 10 digits"));
            }
            if (!newMobile.equals(user.getMobile())) {
                if (userRepository.existsByMobile(newMobile)) {
                    return ResponseEntity.badRequest().body(ApiResponse.error("Phone number is already registered to another account"));
                }
                user.setMobile(newMobile);
            }
        }

        if (body.containsKey("email") && body.get("email") != null) {
            String email = body.get("email").trim();
            user.setEmail(email.isEmpty() ? null : email);
        }

        if (body.containsKey("password") && body.get("password") != null && !body.get("password").trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(body.get("password").trim()));
        }

        userRepository.save(user);

        // Update default address if passed
        if (body.containsKey("address") && body.get("address") != null && !body.get("address").trim().isEmpty()) {
            List<CustomerAddress> addresses = addressRepository.findByCustomerId(customer.getId());
            if (!addresses.isEmpty()) {
                CustomerAddress addr = addresses.get(0);
                addr.setAddressLine1(body.get("address").trim());
                addressRepository.save(addr);
            } else {
                CustomerAddress address = CustomerAddress.builder()
                        .customer(customer)
                        .label("HOME")
                        .addressLine1(body.get("address").trim())
                        .city("Hindupur")
                        .isDefault(true)
                        .build();
                addressRepository.save(address);
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Customer credentials updated successfully", toMap(customer)));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetCustomerPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.trim().length() < 4) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Password must be at least 4 characters"));
        }

        User user = customer.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Customer password has been reset successfully", null));
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
