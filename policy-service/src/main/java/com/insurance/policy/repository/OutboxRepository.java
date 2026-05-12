package com.insurance.policy.repository;

import com.insurance.policy.domain.OutboxMessage;
import com.insurance.policy.domain.OutboxStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OutboxRepository extends JpaRepository<OutboxMessage, Long> {

    List<OutboxMessage> findTop100ByStatusOrderByCreatedAtAsc(OutboxStatus status);

    Optional<OutboxMessage> findByEventId(UUID eventId);
}
