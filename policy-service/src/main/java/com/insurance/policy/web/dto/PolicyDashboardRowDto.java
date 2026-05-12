package com.insurance.policy.web.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PolicyDashboardRowDto(
        Long id,
        String holder,
        BigDecimal premium,
        String coverage,
        String status,
        String outboxStatus,
        UUID eventId
) {
}
