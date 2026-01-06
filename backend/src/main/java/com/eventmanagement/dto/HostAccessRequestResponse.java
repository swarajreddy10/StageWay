package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record HostAccessRequestResponse(
    Long id,
    String status,
    String note,
    OffsetDateTime createdAt,
    OffsetDateTime reviewedAt
) {}
