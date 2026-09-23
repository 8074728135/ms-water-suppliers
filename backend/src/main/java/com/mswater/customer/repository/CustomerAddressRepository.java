package com.mswater.customer.repository;

import com.mswater.customer.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
    List<CustomerAddress> findByCustomerIdOrderByIsDefaultDescCreatedAtAsc(Long customerId);
    List<CustomerAddress> findByCustomerId(Long customerId);
    boolean existsByCustomerId(Long customerId);
}
