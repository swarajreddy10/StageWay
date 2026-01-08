package com.eventmanagement.dto;

public record EngagementMetrics(
    double avgRegistrationsPerEvent,
    double avgCheckInRate,
    double cancellationRate,
    long peakRegistrationHour
) {}
