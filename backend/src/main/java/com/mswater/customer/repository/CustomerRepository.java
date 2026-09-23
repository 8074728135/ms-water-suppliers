package com.mswater.customer.repository;

import com.mswater.customer.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByUserId(Long userId);

    @Query("SELECT c FROM Customer c JOIN c.user u WHERE u.mobile = :mobile")
    Optional<Customer> findByMobile(String mobile);

    @Query("SELECT c FROM Customer c JOIN c.user u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR u.mobile LIKE CONCAT('%', :query, '%')")
    List<Customer> searchByNameOrMobile(String query);

    @Query("SELECT c FROM Customer c WHERE c.outstandingAmount > 0 ORDER BY c.outstandingAmount DESC")
    List<Customer> findWithOutstandingPayments();
}
