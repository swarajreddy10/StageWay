package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record HostAccessRequestAdminResponse(
    Long id,
    Long userId,
    String email,
    String fullName,
    String status,
    String note,
    String companyName,
    String eventPlan,
    OffsetDateTime createdAt,
    OffsetDateTime reviewedAt
) {}
