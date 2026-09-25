package com.mswater.customer.controller;

import com.mswater.common.exception.ResourceNotFoundException;
import com.mswater.common.exception.UnauthorizedException;
import com.mswater.common.response.ApiResponse;
import com.mswater.customer.dto.AddressRequest;
import com.mswater.customer.entity.Customer;
import com.mswater.customer.entity.CustomerAddress;
import com.mswater.customer.repository.CustomerAddressRepository;
import com.mswater.customer.repository.CustomerRepository;
import com.mswater.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final CustomerAddressRepository addressRepository;
    private final com.mswater.user.repository.UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(
            @AuthenticationPrincipal User user) {
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "userId", user.getId()));

        Map<String, Object> profile = Map.of(
                "id", customer.getId(),
                "name", user.getName(),
                "mobile", user.getMobile(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "totalOrders", customer.getTotalOrders(),
                "totalSpent", customer.getTotalSpent(),
                "outstandingAmount", customer.getOutstandingAmount(),
                "memberSince", customer.getCreatedAt() != null ? customer.getCreatedAt().toString() : ""
        );

        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "userId", user.getId()));

        if (body.containsKey("name") && body.get("name") != null && !body.get("name").trim().isEmpty()) {
            user.setName(body.get("name").trim());
        }

        if (body.containsKey("mobile") && body.get("mobile") != null && !body.get("mobile").trim().isEmpty()) {
            String newMobile = body.get("mobile").trim().replaceAll("\\D", "");
            if (newMobile.length() != 10) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Please enter a valid 10-digit mobile number"));
            }
            if (!newMobile.equals(user.getMobile()) && userRepository.existsByMobile(newMobile)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("This phone number is already registered to another account"));
            }
            user.setMobile(newMobile);
        }

        if (body.containsKey("email") && body.get("email") != null) {
            String email = body.get("email").trim();
            user.setEmail(email.isEmpty() ? null : email);
        }

        userRepository.save(user);

        Map<String, Object> profile = Map.of(
                "id", customer.getId(),
                "name", user.getName(),
                "mobile", user.getMobile(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "totalOrders", customer.getTotalOrders(),
                "totalSpent", customer.getTotalSpent(),
                "outstandingAmount", customer.getOutstandingAmount(),
                "memberSince", customer.getCreatedAt() != null ? customer.getCreatedAt().toString() : ""
        );

        return ResponseEntity.ok(ApiResponse.success("Phone number and profile updated successfully", profile));
    }

    // =================== ADDRESSES ===================

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<CustomerAddress>>> getAddresses(
            @AuthenticationPrincipal User user) {
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "userId", user.getId()));

        List<CustomerAddress> addresses = addressRepository
                .findByCustomerIdOrderByIsDefaultDescCreatedAtAsc(customer.getId());

        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<CustomerAddress>> addAddress(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddressRequest request) {
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "userId", user.getId()));

        CustomerAddress address = CustomerAddress.builder()
                .customer(customer)
                .label(request.getLabel())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .landmark(request.getLandmark())
                .area(request.getArea())
                .city(request.getCity())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(request.getIsDefault())
                .build();

        // If setting as default, unset others
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            addressRepository.findByCustomerId(customer.getId()).forEach(a -> {
                a.setIsDefault(false);
                addressRepository.save(a);
            });
        }

        address = addressRepository.save(address);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address added", address));
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<CustomerAddress>> updateAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddressRequest request) {
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "userId", user.getId()));

        CustomerAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("This address does not belong to you");
        }

        address.setLabel(request.getLabel());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setLandmark(request.getLandmark());
        address.setArea(request.getArea());
        address.setCity(request.getCity());
        address.setPincode(request.getPincode());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());
        address.setIsDefault(request.getIsDefault());

        address = addressRepository.save(address);

        return ResponseEntity.ok(ApiResponse.success("Address updated", address));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Customer customer = customerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "userId", user.getId()));

        CustomerAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("This address does not belong to you");
        }

        addressRepository.delete(address);

        return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
    }
}
