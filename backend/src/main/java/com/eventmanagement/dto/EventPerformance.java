package com.eventmanagement.dto;

public record EventPerformance(
    Long eventId,
    String eventName,
    long registrations,
    long checkedIn,
    double checkInRate,
    double revenue,
    String currency
) {}
