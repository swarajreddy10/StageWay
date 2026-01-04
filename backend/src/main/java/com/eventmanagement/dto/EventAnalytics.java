package com.eventmanagement.dto;

import java.util.List;

public record EventAnalytics(
    Long eventId,
    long totalRegistrations,
    long checkedInCount,
    double checkInRate,
    List<TrendPoint> registrationTrend,
    List<DemographicPoint> attendeeDemographics,
    List<TimeSlotPoint> popularTimeSlots,
    RevenueSummary revenue
) {}
