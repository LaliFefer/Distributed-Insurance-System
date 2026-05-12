package com.insurance.policy.scheduler;

import com.insurance.policy.domain.OutboxMessage;
import com.insurance.policy.domain.OutboxStatus;
import com.insurance.policy.repository.OutboxRepository;
import com.insurance.policy.service.OutboxPublishingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class OutboxScheduler {

    private final OutboxRepository outboxRepository;
    private final OutboxPublishingService outboxPublishingService;

    public OutboxScheduler(OutboxRepository outboxRepository, OutboxPublishingService outboxPublishingService) {
        this.outboxRepository = outboxRepository;
        this.outboxPublishingService = outboxPublishingService;
    }

    @Scheduled(fixedDelayString = "${app.outbox.poll-interval-ms:5000}", initialDelayString = "${app.outbox.poll-interval-ms:5000}")
    public void publishPendingOutbox() {
        List<OutboxMessage> pending = outboxRepository.findTop100ByStatusOrderByCreatedAtAsc(OutboxStatus.PENDING);
        if (pending.isEmpty()) {
            return;
        }
        log.info("OutboxScheduler: found {} pending message(s) to relay to Kafka", pending.size());
        for (OutboxMessage row : pending) {
            log.info(
                    "OutboxScheduler: sending to Kafka topic={} key={} outboxId={}",
                    OutboxPublishingService.TOPIC_POLICY_EVENTS,
                    row.getEventId(),
                    row.getId());
            outboxPublishingService.publishAndMarkProcessed(row.getId());
        }
    }
}
