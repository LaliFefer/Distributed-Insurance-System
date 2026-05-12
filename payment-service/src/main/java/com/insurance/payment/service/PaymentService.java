package com.insurance.payment.service;

import com.insurance.common.event.PolicyCreatedEvent;
import com.insurance.payment.domain.Payment;
import com.insurance.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Transactional
    public void recordFromPolicyEvent(PolicyCreatedEvent event) {
        if (paymentRepository.existsByEventId(event.id())) {
            log.warn("PaymentService: duplicate eventId={} skipped at database layer", event.id());
            return;
        }
        Payment payment = new Payment();
        payment.setEventId(event.id());
        payment.setPolicyNumber(event.policyNumber());
        payment.setAmount(event.amount());
        payment.setCustomerId(event.customerId());
        paymentRepository.save(payment);
    }
}
