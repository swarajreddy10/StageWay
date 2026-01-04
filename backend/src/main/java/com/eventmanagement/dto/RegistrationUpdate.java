package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record RegistrationUpdate(
    Long eventId,
    long confirmedCount,
    long waitlistCount,
    long availableSeats,
    OffsetDateTime updatedAt
) {}
