package com.insurance.policy.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurance.common.event.PolicyCreatedEvent;
import com.insurance.policy.domain.OutboxMessage;
import com.insurance.policy.domain.OutboxStatus;
import com.insurance.policy.domain.Policy;
import com.insurance.policy.monitor.MonitorBroadcaster;
import com.insurance.policy.repository.OutboxRepository;
import com.insurance.policy.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PolicyService {

    public static final String EVENT_TYPE_POLICY_CREATED = "POLICY_CREATED";

    private final PolicyRepository policyRepository;
    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;
    private final MonitorBroadcaster monitorBroadcaster;

    @Transactional
    public Policy createPolicy(String policyNumber, BigDecimal amount, Long customerId) {
        policyRepository.findByPolicyNumber(policyNumber).ifPresent(p -> {
            throw new IllegalArgumentException("Policy number already exists: " + policyNumber);
        });

        UUID eventId = UUID.randomUUID();
        Policy policy = new Policy();
        policy.setPolicyNumber(policyNumber);
        policy.setAmount(amount);
        policy.setCustomerId(customerId);
        policy.setEventId(eventId);
        policyRepository.save(policy);

        PolicyCreatedEvent event = new PolicyCreatedEvent(
                eventId,
                policyNumber,
                amount,
                customerId
        );
        String payload;
        try {
            payload = objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize PolicyCreatedEvent", e);
        }

        OutboxMessage outbox = new OutboxMessage();
        outbox.setEventType(EVENT_TYPE_POLICY_CREATED);
        outbox.setEventId(eventId);
        outbox.setPayload(payload);
        outbox.setStatus(OutboxStatus.PENDING);
        outboxRepository.save(outbox);

        monitorBroadcaster.broadcast(
                "PolicyCreated",
                Map.of(
                        "policyId", policy.getId(),
                        "eventId", eventId.toString(),
                        "policyNumber", policyNumber
                ));

        return policy;
    }
}
