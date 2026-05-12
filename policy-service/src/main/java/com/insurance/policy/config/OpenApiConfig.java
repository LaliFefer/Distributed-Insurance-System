package com.insurance.policy.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI policyServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Policy Service API")
                        .description("Create policies; events are relayed via transactional outbox to Kafka.")
                        .version("1.0.0"));
    }
}
