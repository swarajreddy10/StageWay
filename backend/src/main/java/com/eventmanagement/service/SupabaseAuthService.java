package com.eventmanagement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.lang.Nullable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@Service
public class SupabaseAuthService {
    private static final Logger log = LoggerFactory.getLogger(SupabaseAuthService.class);
    private final String supabaseUrl;
    private final String supabaseAnonKey;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final JwtDecoder jwtDecoder;
    private final String issuer;

    public SupabaseAuthService(
        @Value("${supabase.url}") String supabaseUrl,
        @Value("${supabase.anon-key}") String supabaseAnonKey,
        RestTemplate restTemplate,
        ObjectMapper objectMapper,
        @Nullable JwtDecoder jwtDecoder
    ) {
        this.supabaseUrl = supabaseUrl;
        this.supabaseAnonKey = supabaseAnonKey;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.jwtDecoder = jwtDecoder;
        this.issuer = resolveIssuer(supabaseUrl);

        boolean hasUrl = this.supabaseUrl != null && !this.supabaseUrl.isBlank();
        int keyLength = this.supabaseAnonKey == null ? 0 : this.supabaseAnonKey.length();
        if (!hasUrl || keyLength == 0) {
            log.warn("Supabase config missing. urlSet={}, anonKeyLength={}", hasUrl, keyLength);
        } else {
            log.info("Supabase config loaded. urlSet={}, anonKeyLength={}", hasUrl, keyLength);
        }
    }

    public SupabaseUser verifyToken(String accessToken) {
        if (supabaseUrl == null || supabaseUrl.isBlank() || supabaseAnonKey == null
            || supabaseAnonKey.isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Supabase configuration is missing."
            );
        }
        logTokenMetadata(accessToken);
        SupabaseUser localUser = verifyWithJwt(accessToken);
        if (localUser != null) {
            return localUser;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseAnonKey);
            headers.set("Authorization", "Bearer " + accessToken);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                supabaseUrl + "/auth/v1/user",
                HttpMethod.GET,
                entity,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode userData = objectMapper.readTree(response.getBody());
                String id = userData.get("id").asText();
                String email = userData.get("email").asText();
                String name = userData.has("user_metadata") && userData.get("user_metadata").has("full_name")
                    ? userData.get("user_metadata").get("full_name").asText()
                    : email;
                String role = userData.has("user_metadata") && userData.get("user_metadata").has("role")
                    ? userData.get("user_metadata").get("role").asText()
                    : null;

                return new SupabaseUser(id, email, name, role);
            }
            
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        } catch (HttpStatusCodeException e) {
            String responseBody = e.getResponseBodyAsString();
            log.warn("Supabase token verification failed: status={}, body={}", e.getStatusCode(), responseBody);
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Token verification failed: " + e.getStatusCode()
            );
        } catch (Exception e) {
            log.warn("Supabase token verification failed: {}", e.getMessage());
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Token verification failed: " + e.getMessage()
            );
        }
    }

    public record SupabaseUser(String id, String email, String name, String role) {}

    private void logTokenMetadata(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            log.warn("Supabase token missing or blank.");
            return;
        }
        String[] parts = accessToken.split("\\.");
        if (parts.length < 2) {
            log.warn("Supabase token has unexpected format. parts={}", parts.length);
            return;
        }
        try {
            byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode payload = objectMapper.readTree(new String(decoded, StandardCharsets.UTF_8));
            String issuer = payload.path("iss").asText(null);
            long issuedAt = payload.path("iat").asLong(0);
            long expiresAt = payload.path("exp").asLong(0);
            long now = Instant.now().getEpochSecond();
            log.info(
                "Supabase token metadata: iss={}, iat={}, exp={}, now={}, iatSkewSec={}",
                issuer,
                issuedAt,
                expiresAt,
                now,
                issuedAt == 0 ? null : issuedAt - now
            );
        } catch (Exception e) {
            log.warn("Failed to decode Supabase token metadata: {}", e.getMessage());
        }
    }

    private SupabaseUser verifyWithJwt(String accessToken) {
        if (jwtDecoder == null) {
            return null;
        }
        try {
            Jwt jwt = jwtDecoder.decode(accessToken);
            if (issuer != null) {
                String tokenIssuer = jwt.getIssuer() != null ? jwt.getIssuer().toString() : null;
                if (tokenIssuer == null || !tokenIssuer.equals(issuer)) {
                    return null;
                }
            }
            String id = jwt.getSubject();
            String email = jwt.getClaimAsString("email");
            if (email == null || email.isBlank()) {
                return null;
            }
            Map<String, Object> userMetadata = jwt.getClaim("user_metadata");
            String name = resolveStringClaim(userMetadata, "full_name", email);
            String role = resolveStringClaim(userMetadata, "role", null);
            return new SupabaseUser(id, email, name, role);
        } catch (Exception ex) {
            return null;
        }
    }

    private String resolveStringClaim(Map<String, Object> metadata, String key, String fallback) {
        if (metadata == null) {
            return fallback;
        }
        Object value = metadata.get(key);
        if (value == null) {
            return fallback;
        }
        String text = value.toString();
        if (text.isBlank()) {
            return fallback;
        }
        return text;
    }

    private String resolveIssuer(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return null;
        }
        String trimmed = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return trimmed + "/auth/v1";
    }
}
