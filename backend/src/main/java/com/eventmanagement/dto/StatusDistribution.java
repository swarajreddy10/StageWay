package com.eventmanagement.dto;

public record StatusDistribution(
    String status,
    long count,
    double percentage
) {}
