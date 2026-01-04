package com.eventmanagement.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.service.SessionService;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final List<String> allowedOrigins;
    private final String sessionCookieName;
    private final boolean allowLocalTokens;

    public SecurityConfig(
        @Value("${app.cors.allowed-origins:http://localhost:3000}") String allowedOrigins,
        @Value("${app.security.session-cookie-name:stageway.session}") String sessionCookieName,
        @Value("${app.security.allow-local-tokens:false}") boolean allowLocalTokens
    ) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isBlank())
            .toList();
        this.sessionCookieName = sessionCookieName;
        this.allowLocalTokens = allowLocalTokens;
    }

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        allowedOrigins.forEach(corsConfig::addAllowedOriginPattern);
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }

    @Bean
    public AuthCookieFilter authCookieFilter() {
        return new AuthCookieFilter(sessionCookieName);
    }

    @Bean
    public RequestIdFilter requestIdFilter() {
        return new RequestIdFilter();
    }

    @Bean
    public SessionAuthenticationFilter sessionAuthenticationFilter(
        SessionService sessionService,
        UserRepository userRepository
    ) {
        return new SessionAuthenticationFilter(sessionService, userRepository, allowLocalTokens);
    }

    @Bean
    public SecurityFilterChain filterChain(
        HttpSecurity http,
        RequestIdFilter requestIdFilter,
        AuthCookieFilter authCookieFilter,
        SessionAuthenticationFilter sessionAuthenticationFilter
    ) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .addFilterBefore(requestIdFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(authCookieFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(sessionAuthenticationFilter, AuthCookieFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/api/auth/supabase",
                    "/api/auth/oauth/start",
                    "/api/auth/login",
                    "/api/auth/register"
                ).permitAll()
                .requestMatchers("/api/events/mine", "/api/events/my").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/events", "/api/events/*", "/api/events/*/seats").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/files/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/registrations/*/qr").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/waitlist").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/actuator/**").authenticated()
                .anyRequest().authenticated()
            )
            .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
