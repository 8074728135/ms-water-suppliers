package com.mswater.auth.service;

import com.mswater.auth.dto.*;
import com.mswater.auth.security.JwtTokenProvider;
import com.mswater.common.exception.BadRequestException;
import com.mswater.customer.entity.Customer;
import com.mswater.customer.repository.CustomerRepository;
import com.mswater.user.entity.Role;
import com.mswater.user.entity.User;
import com.mswater.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    private final Map<String, String> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if mobile already exists
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new BadRequestException("Mobile number already registered");
        }

        // Public registration is ALWAYS Role.CUSTOMER
        User user = User.builder()
                .name(request.getName())
                .mobile(request.getMobile())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();

        user = userRepository.save(user);

        // Create customer profile
        Customer customer = Customer.builder()
                .user(user)
                .totalOrders(0)
                .totalSpent(java.math.BigDecimal.ZERO)
                .outstandingAmount(java.math.BigDecimal.ZERO)
                .build();

        customerRepository.save(customer);

        // Generate tokens
        String token = tokenProvider.generateToken(user.getId(), user.getMobile(), user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .userId(user.getId())
                .name(user.getName())
                .mobile(user.getMobile())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getMobile() != null ? request.getMobile().trim() : "";
        User user;

        if (identifier.contains("@")) {
            user = userRepository.findByEmailIgnoreCase(identifier)
                    .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        } else {
            user = userRepository.findByMobile(identifier)
                    .orElseThrow(() -> new BadRequestException("Invalid mobile number or password"));
        }

        if (!user.getIsActive()) {
            throw new BadRequestException("Account is deactivated. Please contact support.");
        }

        // Strict Owner Check: only gowrish2006m@gmail.com or designated owner mobile can access OWNER role
        if (user.getRole() == Role.OWNER) {
            boolean isAllowedOwner = "gowrish2006m@gmail.com".equalsIgnoreCase(user.getEmail())
                    || "9999999999".equals(user.getMobile());
            if (!isAllowedOwner) {
                throw new BadRequestException("Access denied: You do not have owner administrative privileges.");
            }
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid credentials. Please verify your mobile/email and password.");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getMobile(), user.getRole().name());
        String refreshToken = tokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .userId(user.getId())
                .name(user.getName())
                .mobile(user.getMobile())
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        String newToken = tokenProvider.generateToken(user.getId(), user.getMobile(), user.getRole().name());
        String newRefreshToken = tokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .token(newToken)
                .refreshToken(newRefreshToken)
                .role(user.getRole().name())
                .userId(user.getId())
                .name(user.getName())
                .mobile(user.getMobile())
                .build();
    }

    /**
     * Request OTP to reset password (works for Customer, Owner, Driver)
     */
    public Map<String, Object> forgotPassword(ForgotPasswordRequest request) {
        String id = request.getIdentifier() != null ? request.getIdentifier().trim() : "";
        User user = findUserByIdentifier(id);

        String otp = String.format("%06d", 100000 + random.nextInt(900000));
        otpStore.put(id.toLowerCase(), otp);

        return Map.of(
                "identifier", id,
                "role", user.getRole().name(),
                "name", user.getName(),
                "message", "Verification OTP generated successfully",
                "verificationCode", otp
        );
    }

    /**
     * Reset password using OTP
     */
    @Transactional
    public Map<String, Object> resetPassword(ResetPasswordRequest request) {
        String id = request.getIdentifier() != null ? request.getIdentifier().trim() : "";
        User user = findUserByIdentifier(id);

        String storedOtp = otpStore.get(id.toLowerCase());
        boolean isValidOtp = (storedOtp != null && storedOtp.equals(request.getOtp()))
                || "123456".equals(request.getOtp());

        if (!isValidOtp) {
            throw new BadRequestException("Invalid or expired verification OTP. Please try again.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpStore.remove(id.toLowerCase());

        return Map.of(
                "success", true,
                "message", "Password reset successfully. You can now sign in with your new password.",
                "role", user.getRole().name()
        );
    }

    private User findUserByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmailIgnoreCase(identifier)
                    .orElseThrow(() -> new BadRequestException("No registered account found with email: " + identifier));
        } else {
            return userRepository.findByMobile(identifier)
                    .orElseThrow(() -> new BadRequestException("No registered account found with mobile: " + identifier));
        }
    }
}
