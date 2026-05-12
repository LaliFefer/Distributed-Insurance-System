package com.insurance.common.event;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.UUID;

public record PolicyCreatedEvent(
        @JsonProperty("id") UUID id,
        @JsonProperty("policyNumber") String policyNumber,
        @JsonProperty("amount") BigDecimal amount,
        @JsonProperty("customerId") Long customerId
) {
}
