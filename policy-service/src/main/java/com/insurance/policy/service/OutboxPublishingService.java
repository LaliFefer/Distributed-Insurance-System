package com.insurance.policy.service;

import com.insurance.policy.domain.OutboxMessage;
import com.insurance.policy.domain.OutboxStatus;
import com.insurance.policy.monitor.MonitorBroadcaster;
import com.insurance.policy.repository.OutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutboxPublishingService {

    public static final String TOPIC_POLICY_EVENTS = "policy-events";

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final MonitorBroadcaster monitorBroadcaster;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void publishAndMarkProcessed(Long outboxId) {
        OutboxMessage message = outboxRepository.findById(outboxId).orElse(null);
        if (message == null || message.getStatus() != OutboxStatus.PENDING) {
            return;
        }
        try {
            kafkaTemplate
                    .send(TOPIC_POLICY_EVENTS, message.getEventId().toString(), message.getPayload())
                    .get(30, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Interrupted while publishing outbox id={}", outboxId, e);
            return;
        } catch (ExecutionException | TimeoutException e) {
            log.warn("Kafka publish failed for outbox id={}", outboxId, e);
            return;
        }
        message.setStatus(OutboxStatus.PROCESSED);
        message.setProcessedAt(Instant.now());
        outboxRepository.save(message);
        log.info(
                "OutboxPublishingService: published to Kafka topic={} key={} outboxId={} — marked PROCESSED",
                TOPIC_POLICY_EVENTS,
                message.getEventId(),
                outboxId);
        monitorBroadcaster.broadcast(
                "OutboxProcessed",
                Map.of(
                        "eventId", message.getEventId().toString(),
                        "outboxId", outboxId
                ));
    }
}
