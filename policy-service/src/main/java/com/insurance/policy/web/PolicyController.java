package com.insurance.policy.web;

import com.insurance.policy.domain.Policy;
import com.insurance.policy.service.PolicyQueryService;
import com.insurance.policy.service.PolicyService;
import com.insurance.policy.web.dto.CreatePolicyRequest;
import com.insurance.policy.web.dto.PolicyDashboardRowDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/policies")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;
    private final PolicyQueryService policyQueryService;

    @GetMapping
    public List<PolicyDashboardRowDto> list() {
        return policyQueryService.listDashboardRows();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Policy create(@Valid @RequestBody CreatePolicyRequest request) {
        log.info("Creating policy policyNumber={} customerId={}", request.getPolicyNumber(), request.getCustomerId());
        return policyService.createPolicy(
                request.getPolicyNumber(),
                request.getAmount(),
                request.getCustomerId()
        );
    }
}
