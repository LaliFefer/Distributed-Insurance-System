package com.insurance.policy.service;

import com.insurance.policy.KafkaTestStubConfiguration;
import com.insurance.policy.PolicyApplication;
import com.insurance.policy.repository.OutboxRepository;
import com.insurance.policy.repository.PolicyRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest(
        classes = PolicyApplication.class,
        properties = "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration")
@Import(KafkaTestStubConfiguration.class)
@ActiveProfiles("test")
class PolicyTransactionalOutboxIntegrationTest {

    @MockBean
    private PolicyRepository policyRepository;

    @Autowired
    private OutboxRepository outboxRepository;

    @Autowired
    private PolicyService policyService;

    @Test
    @DisplayName("When PolicyRepository.save fails, no outbox row is persisted (@Transactional atomicity)")
    void policySaveFailureDoesNotLeaveOutboxRecord() {
        when(policyRepository.findByPolicyNumber(anyString())).thenReturn(Optional.empty());
        when(policyRepository.save(any())).thenThrow(new DataAccessResourceFailureException("simulated persistence failure"));

        assertThatThrownBy(() -> policyService.createPolicy("POL-TX-1", new BigDecimal("100.00"), 1L))
                .isInstanceOf(DataAccessResourceFailureException.class);

        assertThat(outboxRepository.findAll()).isEmpty();
    }
}
