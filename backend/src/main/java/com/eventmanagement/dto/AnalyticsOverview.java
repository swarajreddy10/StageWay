package com.eventmanagement.dto;

public record AnalyticsOverview(
    long totalEvents,
    long publishedEvents,
    long totalRegistrations,
    long confirmedRegistrations,
    long waitlistedRegistrations,
    long checkedInRegistrations
) {}
