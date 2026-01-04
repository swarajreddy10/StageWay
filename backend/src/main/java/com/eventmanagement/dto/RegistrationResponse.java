package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record RegistrationResponse(
    Long id,
    Long eventId,
    Long userId,
    Integer seatNumber,
    String status,
    String qrCode,
    OffsetDateTime registeredAt,
    OffsetDateTime cancelledAt,
    String cancellationReason,
    RegistrationEventSummary event,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    OffsetDateTime checkedInAt,
    Long checkedInBy
) {}
