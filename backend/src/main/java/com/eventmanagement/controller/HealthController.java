package com.eventmanagement.controller;

import com.eventmanagement.config.ConnectionPoolMonitor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Health check endpoints for monitoring system status
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {
    
    @Autowired
    private ConnectionPoolMonitor connectionPoolMonitor;
    
    /**
     * Get connection pool health status
     * Used for monitoring auto-scaling behavior
     */
    @GetMapping("/database")
    public ResponseEntity<Map<String, Object>> getDatabaseHealth() {
        ConnectionPoolMonitor.PoolStats stats = connectionPoolMonitor.getPoolStats();
        
        String status = "healthy";
        if (stats.waiting() > 10) {
            status = "degraded";
        }
        if (stats.waiting() > 20) {
            status = "unhealthy";
        }
        
        return ResponseEntity.ok(Map.of(
            "status", status,
            "timestamp", OffsetDateTime.now(),
            "connectionPool", Map.of(
                "active", stats.active(),
                "idle", stats.idle(),
                "total", stats.total(),
                "waiting", stats.waiting(),
                "utilization", stats.total() > 0 ? (stats.active() * 100.0 / stats.total()) : 0
            )
        ));
    }
}