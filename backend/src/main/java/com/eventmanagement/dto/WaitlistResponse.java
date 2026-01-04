package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record WaitlistResponse(
    Long id,
    Long eventId,
    Long userId,
    long position,
    OffsetDateTime joinedAt,
    OffsetDateTime promotedAt,
    OffsetDateTime expiredAt,
    String status,
    WaitlistEventSummary event
) {}
