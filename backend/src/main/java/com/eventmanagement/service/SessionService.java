package com.eventmanagement.service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SessionService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String SESSION_PREFIX = "session:";
    private static final Duration SESSION_TTL = Duration.ofHours(1);

    public SessionService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public String createSession(Long userId) {
        String sessionId = UUID.randomUUID().toString();
        String key = SESSION_PREFIX + sessionId;

        long expiresAtEpochSeconds = Instant.now().plus(SESSION_TTL).getEpochSecond();
        SessionData sessionData = new SessionData(userId, expiresAtEpochSeconds);
        redisTemplate.opsForValue().set(key, sessionData, SESSION_TTL);

        return sessionId;
    }

    public SessionData getSession(String sessionId) {
        String key = SESSION_PREFIX + sessionId;
        Object value = redisTemplate.opsForValue().get(key);
        if (value instanceof SessionData sessionData) {
            return sessionData;
        }
        if (value instanceof Map<?, ?> map) {
            SessionData sessionData = fromMap(map);
            if (sessionData != null) {
                return sessionData;
            }
        }
        return null;
    }

    public void deleteSession(String sessionId) {
        String key = SESSION_PREFIX + sessionId;
        redisTemplate.delete(key);
    }

    public Long tryValidateSession(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return null;
        }
        SessionData session = getSession(sessionId);
        if (session == null || session.getExpiresAtEpochSeconds() <= Instant.now().getEpochSecond()) {
            return null;
        }
        return session.getUserId();
    }

    public Long validateSession(String sessionId) {
        Long userId = tryValidateSession(sessionId);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired or invalid.");
        }
        return userId;
    }

    public static class SessionData {
        private Long userId;
        private long expiresAtEpochSeconds;

        public SessionData() {}

        public SessionData(Long userId, long expiresAtEpochSeconds) {
            this.userId = userId;
            this.expiresAtEpochSeconds = expiresAtEpochSeconds;
        }

        public Long getUserId() {
            return userId;
        }
        public void setUserId(Long userId) {
            this.userId = userId;
        }
        public long getExpiresAtEpochSeconds() {
            return expiresAtEpochSeconds;
        }
        public void setExpiresAtEpochSeconds(long expiresAtEpochSeconds) {
            this.expiresAtEpochSeconds = expiresAtEpochSeconds;
        }
    }

    private SessionData fromMap(Map<?, ?> map) {
        Object userIdValue = map.get("userId");
        Long userId = toLong(userIdValue);
        Object expiresValue = map.get("expiresAtEpochSeconds");
        if (expiresValue == null) {
            expiresValue = map.get("expiresAt");
        }
        Long expiresAt = toLong(expiresValue);
        if (userId == null || expiresAt == null) {
            return null;
        }
        return new SessionData(userId, expiresAt);
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text) {
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
