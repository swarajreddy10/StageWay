package com.eventmanagement.dto;

public record CategoryStats(
    String category,
    long eventCount,
    long totalRegistrations,
    double avgCheckInRate
) {}
