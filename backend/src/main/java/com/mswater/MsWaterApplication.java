package com.mswater;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MsWaterApplication {
    public static void main(String[] args) {
        SpringApplication.run(MsWaterApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner seedOwnerAndDriver(
            com.mswater.user.repository.UserRepository userRepository,
            com.mswater.customer.repository.CustomerRepository customerRepository,
            com.mswater.customer.repository.CustomerAddressRepository addressRepository,
            com.mswater.waterservice.repository.WaterServiceRepository waterServiceRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            userRepository.findByMobile("9999999999").ifPresent(owner -> {
                owner.setPasswordHash(passwordEncoder.encode("admin123"));
                userRepository.save(owner);
                System.out.println(">>> Demo Owner password seeded: admin123");
            });
            userRepository.findByMobile("8888888888").ifPresent(driver -> {
                driver.setPasswordHash(passwordEncoder.encode("driver123"));
                userRepository.save(driver);
                System.out.println(">>> Demo Driver password seeded: driver123");
            });

            if (!userRepository.existsByMobile("9876543210")) {
                var custUser = com.mswater.user.entity.User.builder()
                        .name("Customer John")
                        .mobile("9876543210")
                        .passwordHash(passwordEncoder.encode("password123"))
                        .role(com.mswater.user.entity.Role.CUSTOMER)
                        .isActive(true)
                        .build();
                custUser = userRepository.save(custUser);

                var customer = com.mswater.customer.entity.Customer.builder()
                        .user(custUser)
                        .totalOrders(0)
                        .totalSpent(java.math.BigDecimal.ZERO)
                        .outstandingAmount(java.math.BigDecimal.ZERO)
                        .build();
                customer = customerRepository.save(customer);

                var addr = com.mswater.customer.entity.CustomerAddress.builder()
                        .customer(customer)
                        .label("Home")
                        .addressLine1("Plot 42, Water Tank Road")
                        .area("Vidyanagar")
                        .city("Hindupur")
                        .pincode("515201")
                        .isDefault(true)
                        .build();
                addressRepository.save(addr);
                System.out.println(">>> Demo Customer seeded: 9876543210 / password123 with default address");
            }

            // Ensure Drum capacity is 100 Litres
            waterServiceRepository.findByName("DRUM").ifPresent(drum -> {
                drum.setCapacityLitres(100);
                drum.setDescription("Individual drum of water (~100 litres)");
                waterServiceRepository.save(drum);
                System.out.println(">>> Verified DRUM capacity set to 100 Litres");
            });
        };
    }
}
