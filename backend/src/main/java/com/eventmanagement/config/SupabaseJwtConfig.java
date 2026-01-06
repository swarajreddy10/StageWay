package com.eventmanagement.config;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
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
    @ConditionalOnProperty(name = "supabase.url")
    public JwtDecoder supabaseJwtDecoder(
        @Value("${supabase.url}") String supabaseUrl,
        RestTemplateBuilder builder
    ) {
        String baseUrl = supabaseUrl.endsWith("/")
            ? supabaseUrl.substring(0, supabaseUrl.length() - 1)
            : supabaseUrl;
        String jwksUrl = baseUrl + "/auth/v1/.well-known/jwks.json";
        RestOperations restOperations = builder
            .setConnectTimeout(Duration.ofSeconds(3))
            .setReadTimeout(Duration.ofSeconds(5))
            .build();
        return NimbusJwtDecoder.withJwkSetUri(jwksUrl)
            .restOperations(restOperations)
            .build();
    }

    @Bean
    public RestTemplate supabaseRestTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(3))
            .setReadTimeout(Duration.ofSeconds(5))
            .build();
    }
}
