package com.eventmanagement.controller;

import com.eventmanagement.dto.AnalyticsOverview;
import com.eventmanagement.dto.EventAnalytics;
import com.eventmanagement.dto.HostAnalytics;
import com.eventmanagement.service.AnalyticsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@Tag(name = "Analytics", description = "Host analytics — overview, per-event, and host-level insights")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Operation(summary = "Analytics overview for the authenticated host",
        security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/analytics/overview")
    @PreAuthorize("hasRole('HOST')")
    public AnalyticsOverview getAnalyticsOverview(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return analyticsService.getAnalyticsOverview(authHeader);
    }

    @Operation(summary = "Per-event analytics", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/analytics/events/{id}")
    @PreAuthorize("hasRole('HOST')")
    public EventAnalytics getEventAnalytics(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return analyticsService.getEventAnalytics(id, authHeader);
    }

    @Operation(summary = "Host-level analytics dashboard data", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/analytics/host")
    @PreAuthorize("hasRole('HOST')")
    public HostAnalytics getHostAnalytics(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return analyticsService.getHostAnalytics(authHeader);
    }
}
