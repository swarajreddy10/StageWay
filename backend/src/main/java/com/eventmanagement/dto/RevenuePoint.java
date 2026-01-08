package com.eventmanagement.dto;

public record RevenuePoint(
    String month,
    double revenue,
    long registrations
) {}
