package com.insurance.payment.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentEventStatusDto(
        String state,
        Long paymentId,
        UUID eventId,
        String policyNumber,
        BigDecimal amount,
        Long customerId
) {
}
