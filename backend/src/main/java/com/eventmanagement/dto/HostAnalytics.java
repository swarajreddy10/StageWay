package com.eventmanagement.dto;

import java.util.List;

public record HostAnalytics(
    AnalyticsOverview overview,
    List<EventPerformance> topEvents,
    List<CategoryStats> categoryBreakdown,
    List<RevenuePoint> revenueTimeline,
    List<StatusDistribution> registrationStatus,
    EngagementMetrics engagement
) {}
