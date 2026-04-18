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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
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

        // Use a dedicated executor to avoid ForkJoinPool starvation
        ExecutorService executor = Executors.newFixedThreadPool(20);

        // Simulate 20 concurrent database operations (within pool capacity)
        List<CompletableFuture<Void>> futures = IntStream.range(0, 20)
            .mapToObj(i -> CompletableFuture.runAsync(() -> {
                try (var conn = dataSource.getConnection();
                     var stmt = conn.prepareStatement("SELECT 1")) {
                    stmt.executeQuery();
                    Thread.sleep(50);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }, executor))
            .toList();

        // All operations should complete without timeout
        assertDoesNotThrow(() ->
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .get(15, TimeUnit.SECONDS)
        );

        // Pool should have no threads waiting after all operations complete
        assertThat(pool.getThreadsAwaitingConnection()).isEqualTo(0);
        executor.shutdown();
    }

    @Test
    void connectionPool_shouldHandleHighConcurrency() {
        // Use a dedicated executor to avoid ForkJoinPool thread starvation
        ExecutorService executor = Executors.newFixedThreadPool(50);

        // Test 50 concurrent users (within configured pool size of 100)
        List<CompletableFuture<Boolean>> futures = IntStream.range(0, 50)
            .mapToObj(i -> CompletableFuture.supplyAsync(() -> {
                try (var connection = dataSource.getConnection();
                     var stmt = connection.prepareStatement("SELECT 1")) {
                    var result = stmt.executeQuery();
                    return result.next();
                } catch (Exception e) {
                    return false;
                }
            }, executor))
            .toList();

        long successCount = futures.stream()
            .map(CompletableFuture::join)
            .mapToLong(success -> success ? 1 : 0)
            .sum();

        executor.shutdown();
        assertThat(successCount).isEqualTo(50);
    }
}
