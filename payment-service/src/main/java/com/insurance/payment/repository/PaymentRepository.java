package com.insurance.payment.repository;

import com.insurance.payment.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    boolean existsByEventId(UUID eventId);

    Optional<Payment> findByEventId(UUID eventId);

    List<Payment> findAllByOrderByIdDesc();
}
