package com.mswater.driver.controller;

import com.mswater.common.exception.ResourceNotFoundException;
import com.mswater.common.response.ApiResponse;
import com.mswater.driver.entity.Driver;
import com.mswater.driver.repository.DriverRepository;
import com.mswater.user.entity.Role;
import com.mswater.user.entity.User;
import com.mswater.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/drivers")
@PreAuthorize("hasRole('OWNER')")
@RequiredArgsConstructor
public class AdminDriverController {

    private final DriverRepository driverRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllDrivers() {
        List<Driver> drivers = driverRepository.findAll();
        List<Map<String, Object>> result = drivers.stream().map(this::toMap).toList();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createDriver(
            @RequestBody Map<String, String> body) {
        String name = body.get("name");
        String mobile = body.get("mobile");
        String license = body.getOrDefault("licenseNumber", "");
        String password = body.getOrDefault("password", "driver123");

        if (name == null || mobile == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Name and mobile are required"));
        }

        if (userRepository.existsByMobile(mobile)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mobile number already in use"));
        }

        User user = User.builder()
                .name(name)
                .mobile(mobile)
                .passwordHash(passwordEncoder.encode(password))
                .role(Role.DRIVER)
                .isActive(true)
                .build();
        user = userRepository.save(user);

        Driver driver = Driver.builder()
                .user(user)
                .licenseNumber(license)
                .status("AVAILABLE")
                .totalDeliveries(0)
                .completedDeliveries(0)
                .failedDeliveries(0)
                .build();
        driver = driverRepository.save(driver);

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toMap(driver)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));

        String status = body.get("status");
        if (status != null) {
            driver.setStatus(status.toUpperCase());
            driver = driverRepository.save(driver);
        }

        return ResponseEntity.ok(ApiResponse.success(toMap(driver)));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetDriverPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));

        String newPassword = body.get("password");
        if (newPassword == null || newPassword.trim().length() < 4) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Password must be at least 4 characters"));
        }

        User user = driver.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "driverId", driver.getId(),
                "driverName", user.getName(),
                "message", "Driver password updated successfully by owner"
        )));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateDriver(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));

        User user = driver.getUser();
        if (body.containsKey("name") && body.get("name") != null) {
            user.setName(body.get("name").trim());
        }
        if (body.containsKey("mobile") && body.get("mobile") != null) {
            String newMobile = body.get("mobile").trim();
            if (!newMobile.equals(user.getMobile()) && userRepository.existsByMobile(newMobile)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Mobile number already in use"));
            }
            user.setMobile(newMobile);
        }
        userRepository.save(user);

        if (body.containsKey("licenseNumber")) {
            driver.setLicenseNumber(body.get("licenseNumber"));
        }
        if (body.containsKey("status") && body.get("status") != null) {
            driver.setStatus(body.get("status").toUpperCase());
        }
        driver = driverRepository.save(driver);

        return ResponseEntity.ok(ApiResponse.success(toMap(driver)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteDriver(@PathVariable Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));
        driver.setStatus("INACTIVE");
        driver.getUser().setIsActive(false);
        userRepository.save(driver.getUser());
        driverRepository.save(driver);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Driver deactivated successfully")));
    }

    private Map<String, Object> toMap(Driver driver) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", driver.getId());
        map.put("userId", driver.getUser().getId());
        map.put("name", driver.getUser().getName());
        map.put("mobile", driver.getUser().getMobile());
        map.put("status", driver.getStatus());
        map.put("licenseNumber", driver.getLicenseNumber() != null ? driver.getLicenseNumber() : "");
        map.put("totalDeliveries", driver.getTotalDeliveries());
        map.put("completedDeliveries", driver.getCompletedDeliveries());
        map.put("failedDeliveries", driver.getFailedDeliveries());
        return map;
    }
}
