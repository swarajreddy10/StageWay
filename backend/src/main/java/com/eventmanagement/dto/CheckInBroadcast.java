package com.eventmanagement.dto;

import java.time.OffsetDateTime;

/**
 * Payload broadcast over WebSocket when an attendee is checked in.
 * Published to: /topic/checkins/{eventId}
 */
public record CheckInBroadcast(
    Long registrationId,
    Long eventId,
    String attendeeName,
    String attendeeEmail,
    String seatNumber,
    OffsetDateTime checkedInAt,
    String method
) {}
