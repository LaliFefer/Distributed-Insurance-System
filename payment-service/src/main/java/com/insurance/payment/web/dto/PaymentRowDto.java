package com.insurance.payment.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentRowDto(
        Long id,
        UUID eventId,
        String policyNumber,
        BigDecimal amount,
        Long customerId,
        Instant createdAt
) {
}
