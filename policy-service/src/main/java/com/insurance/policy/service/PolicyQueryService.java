package com.insurance.policy.service;

import com.insurance.policy.domain.OutboxStatus;
import com.insurance.policy.domain.Policy;
import com.insurance.policy.repository.OutboxRepository;
import com.insurance.policy.repository.PolicyRepository;
import com.insurance.policy.web.dto.PolicyDashboardRowDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PolicyQueryService {

    private static final String COVERAGE = "COMPREHENSIVE";

    private final PolicyRepository policyRepository;
    private final OutboxRepository outboxRepository;

    @Transactional(readOnly = true)
    public List<PolicyDashboardRowDto> listDashboardRows() {
        return policyRepository.findAllByOrderByIdDesc().stream()
                .map(this::toRow)
                .toList();
    }

    private PolicyDashboardRowDto toRow(Policy policy) {
        String outboxStatus = "NONE";
        if (policy.getEventId() != null) {
            outboxStatus = outboxRepository.findByEventId(policy.getEventId())
                    .map(o -> o.getStatus().name())
                    .orElse("NONE");
        }
        String status = OutboxStatus.PROCESSED.name().equals(outboxStatus) ? "ACTIVE" : "PENDING";
        return new PolicyDashboardRowDto(
                policy.getId(),
                "Customer #" + policy.getCustomerId(),
                policy.getAmount(),
                COVERAGE,
                status,
                outboxStatus,
                policy.getEventId()
        );
    }
}
