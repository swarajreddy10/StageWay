package com.eventmanagement.controller;

import com.eventmanagement.dto.AnalyticsOverview;
import com.eventmanagement.dto.EventAnalytics;
import com.eventmanagement.service.AnalyticsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/analytics/overview")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER','HOST')")
    public AnalyticsOverview getAnalyticsOverview(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return analyticsService.getAnalyticsOverview(authHeader);
    }

    @GetMapping("/analytics/events/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ORGANIZER','HOST')")
    public EventAnalytics getEventAnalytics(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return analyticsService.getEventAnalytics(id, authHeader);
    }
}
