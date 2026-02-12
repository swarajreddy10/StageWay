package com.eventmanagement.service;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@SpringBootTest
@ActiveProfiles("test")
class ConnectionPoolLoadTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void connectionPool_shouldScaleUnderLoad() {
        assertThat(dataSource).isInstanceOf(HikariDataSource.class);
        
        HikariDataSource hikariDataSource = (HikariDataSource) dataSource;
        HikariPoolMXBean pool = hikariDataSource.getHikariPoolMXBean();

        int initialConnections = pool.getTotalConnections();
        
        // Simulate 50 concurrent database operations
        List<CompletableFuture<Void>> futures = IntStream.range(0, 50)
            .mapToObj(i -> CompletableFuture.runAsync(() -> {
                try {
                    dataSource.getConnection().prepareStatement("SELECT 1").executeQuery();
                    Thread.sleep(100);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }))
            .toList();

        // All operations should complete without timeout
        assertDoesNotThrow(() -> 
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .get(30, TimeUnit.SECONDS)
        );

        int peakConnections = pool.getTotalConnections();
        assertThat(peakConnections).isGreaterThan(initialConnections);
        assertThat(pool.getThreadsAwaitingConnection()).isEqualTo(0);
    }

    @Test
    void connectionPool_shouldHandleHighConcurrency() {
        // Test 100 concurrent users
        List<CompletableFuture<Boolean>> futures = IntStream.range(0, 100)
            .mapToObj(i -> CompletableFuture.supplyAsync(() -> {
                try {
                    var connection = dataSource.getConnection();
                    var result = connection.prepareStatement("SELECT 1").executeQuery();
                    connection.close();
                    return result.next();
                } catch (Exception e) {
                    return false;
                }
            }))
            .toList();

        long successCount = futures.stream()
            .map(CompletableFuture::join)
            .mapToLong(success -> success ? 1 : 0)
            .sum();

        assertThat(successCount).isEqualTo(100);
    }
}