package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record AttendeeSummary(
    Long registrationId,
    Long userId,
    String fullName,
    String email,
    String status,
    Integer seatNumber,
    OffsetDateTime registeredAt,
    OffsetDateTime checkedInAt
) {}
