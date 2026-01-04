package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record WaitlistEventSummary(
    Long id,
    String name,
    OffsetDateTime startDate
) {}
