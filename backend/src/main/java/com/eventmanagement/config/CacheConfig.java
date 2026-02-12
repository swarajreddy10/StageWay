package com.eventmanagement.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.time.Duration;
import java.util.List;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(
            List.of(
                buildCache("eventsByFilter", Duration.ofMinutes(5)),
                buildCache("seatAvailability", Duration.ofMinutes(2))
            )
        );
        return manager;
    }

    private CaffeineCache buildCache(String name, Duration ttl) {
        return new CaffeineCache(
            name,
            Caffeine.newBuilder()
                .expireAfterWrite(ttl)
                .maximumSize(500)
                .build()
        );
    }
}
