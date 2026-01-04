package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record CheckInInfo(
    Long id,
    Long registrationId,
    OffsetDateTime checkInTime,
    String method,
    Long checkedInBy,
    String notes
) {}
