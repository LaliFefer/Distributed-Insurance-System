package com.insurance.payment.web;

import com.insurance.payment.domain.Payment;
import com.insurance.payment.repository.PaymentRepository;
import com.insurance.payment.web.dto.PaymentEventStatusDto;
import com.insurance.payment.web.dto.PaymentRowDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@RequiredArgsConstructor
public class PaymentMonitorController {

    private final PaymentRepository paymentRepository;

    @GetMapping("/payments")
    public List<PaymentRowDto> listPayments() {
        return paymentRepository.findAllByOrderByIdDesc().stream()
                .map(this::toRow)
                .toList();
    }

    @GetMapping("/payment/event/{eventId}")
    public PaymentEventStatusDto getByEventId(@PathVariable UUID eventId) {
        return paymentRepository.findByEventId(eventId)
                .map(p -> new PaymentEventStatusDto(
                        "PROCESSED",
                        p.getId(),
                        p.getEventId(),
                        p.getPolicyNumber(),
                        p.getAmount(),
                        p.getCustomerId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not yet processed"));
    }

    private PaymentRowDto toRow(Payment p) {
        return new PaymentRowDto(
                p.getId(),
                p.getEventId(),
                p.getPolicyNumber(),
                p.getAmount(),
                p.getCustomerId(),
                p.getCreatedAt()
        );
    }
}
