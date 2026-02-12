package com.eventmanagement.config;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

/**
 * Monitors connection pool metrics and auto-scaling behavior
 * Provides alerts when pool is under pressure
 */
@Component
public class ConnectionPoolMonitor {
    
    private static final Logger log = LoggerFactory.getLogger(ConnectionPoolMonitor.class);
    
    @Autowired
    private DataSource dataSource;
    
    /**
     * Log connection pool metrics every 30 seconds
     * Monitor auto-scaling behavior and performance
     */
    @Scheduled(fixedRate = 30000)
    public void logPoolMetrics() {
        if (!(dataSource instanceof HikariDataSource hikariDataSource)) {
            return;
        }
        
        HikariPoolMXBean pool = hikariDataSource.getHikariPoolMXBean();
        
        int active = pool.getActiveConnections();
        int idle = pool.getIdleConnections();
        int total = pool.getTotalConnections();
        int waiting = pool.getThreadsAwaitingConnection();
        
        log.info("Connection Pool - Active: {}, Idle: {}, Total: {}, Waiting: {}", 
            active, idle, total, waiting);
        
        // Alert if pool is under pressure
        if (waiting > 5) {
            log.warn("Connection pool under pressure - {} threads waiting for connections", waiting);
        }
        
        // Alert if pool is near maximum capacity
        if (total > 120) { // 80% of max (150)
            log.warn("Connection pool near capacity - {} total connections (max: 150)", total);
        }
        
        // Log scaling events
        if (total > 20) {
            log.info("Connection pool scaled up - {} connections active for high load", total);
        }
    }
    
    /**
     * Get current pool statistics for health checks
     */
    public PoolStats getPoolStats() {
        if (!(dataSource instanceof HikariDataSource hikariDataSource)) {
            return new PoolStats(0, 0, 0, 0);
        }
        
        HikariPoolMXBean pool = hikariDataSource.getHikariPoolMXBean();
        return new PoolStats(
            pool.getActiveConnections(),
            pool.getIdleConnections(),
            pool.getTotalConnections(),
            pool.getThreadsAwaitingConnection()
        );
    }
    
    public record PoolStats(int active, int idle, int total, int waiting) {}
}