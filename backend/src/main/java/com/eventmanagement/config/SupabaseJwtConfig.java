package com.eventmanagement.config;

import java.time.Duration;

import org.springframework.context.annotation.Primary;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

@Configuration
public class SupabaseJwtConfig {

    @Bean
    @Primary
    public JwtDecoder supabaseJwtDecoder() {
        // Mock JWT decoder for demo mode
        return token -> {
            throw new org.springframework.security.oauth2.jwt.JwtException("Demo mode - JWT validation disabled");
        };
    }

    @Bean
    public RestTemplate supabaseRestTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(3))
            .setReadTimeout(Duration.ofSeconds(5))
            .build();
    }
}
