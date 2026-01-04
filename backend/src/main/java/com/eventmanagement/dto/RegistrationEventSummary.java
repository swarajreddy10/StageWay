package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record RegistrationEventSummary(
    Long id,
    String name,
    OffsetDateTime startDate,
    OffsetDateTime endDate,
    String location,
    String bannerUrl
) {}
