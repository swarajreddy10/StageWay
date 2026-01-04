package com.eventmanagement.service;

import java.time.Duration;
import java.util.UUID;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class OAuthStateService {
    private static final String STATE_PREFIX = "oauth:state:";
    private static final Duration STATE_TTL = Duration.ofMinutes(5);

    private final RedisTemplate<String, Object> redisTemplate;

    public OAuthStateService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String createState(String role) {
        if (role == null || role.isBlank()) {
            return null;
        }
        String stateId = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(stateKey(stateId), role, STATE_TTL);
        return stateId;
    }

    public String consumeState(String stateId) {
        if (stateId == null || stateId.isBlank()) {
            return null;
        }
        String key = stateKey(stateId);
        Object value = redisTemplate.opsForValue().get(key);
        if (value != null) {
            redisTemplate.delete(key);
        }
        return value instanceof String text ? text : null;
    }

    public Duration getStateTtl() {
        return STATE_TTL;
    }

    private String stateKey(String stateId) {
        return STATE_PREFIX + stateId;
    }
}
