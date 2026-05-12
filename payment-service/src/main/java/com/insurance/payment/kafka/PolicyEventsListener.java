package com.insurance.payment.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.insurance.common.event.PolicyCreatedEvent;
import com.insurance.payment.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Slf4j
@Component
public class PolicyEventsListener {

    private static final String REDIS_KEY_PREFIX = "policy-event:";
    private static final Duration IDEMPOTENCY_TTL = Duration.ofDays(7);

    private final ObjectMapper objectMapper;
    private final StringRedisTemplate redisTemplate;
    private final PaymentService paymentService;

    public PolicyEventsListener(
            ObjectMapper objectMapper,
            StringRedisTemplate redisTemplate,
            PaymentService paymentService) {
        this.objectMapper = objectMapper;
        this.redisTemplate = redisTemplate;
        this.paymentService = paymentService;
    }

    @KafkaListener(topics = "policy-events", groupId = "payment-service")
    public void onPolicyEvent(String payload) {
        log.info("PolicyEventsListener: received message from Kafka topic=policy-events (payload length={})", payload.length());
        PolicyCreatedEvent event;
        try {
            event = objectMapper.readValue(payload, PolicyCreatedEvent.class);
        } catch (Exception e) {
            log.error("Invalid policy event payload: {}", payload, e);
            return;
        }

        log.info(
                "PolicyEventsListener: parsed event eventId={} policyNumber={} customerId={}",
                event.id(),
                event.policyNumber(),
                event.customerId());
        String redisKey = REDIS_KEY_PREFIX + event.id();
        Boolean firstTime = redisTemplate.opsForValue().setIfAbsent(redisKey, "1", IDEMPOTENCY_TTL);
        if (Boolean.FALSE.equals(firstTime)) {
            log.warn("PolicyEventsListener: duplicate event skipped (idempotency) eventId={}", event.id());
            return;
        }
        try {
            paymentService.recordFromPolicyEvent(event);
            log.info("PolicyEventsListener: payment persisted for eventId={} policyNumber={}", event.id(), event.policyNumber());
        } catch (Exception e) {
            redisTemplate.delete(redisKey);
            throw e;
        }
    }
}
