package com.mswater.auth.service;

import com.mswater.auth.dto.AuthResponse;
import com.mswater.auth.dto.LoginRequest;
import com.mswater.auth.dto.RegisterRequest;
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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if mobile already exists
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new BadRequestException("Mobile number already registered");
        }

        // Create user
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
        User user = userRepository.findByMobile(request.getMobile())
                .orElseThrow(() -> new BadRequestException("Invalid mobile number or password"));

        if (!user.getIsActive()) {
            throw new BadRequestException("Account is deactivated. Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Invalid mobile number or password");
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
}
