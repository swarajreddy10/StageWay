package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record HostAccessRequestAdminResponse(
    Long id,
    Long userId,
    String userEmail,
    String userName,
    String status,
    String note,
    String companyName,
    String eventPlan,
    OffsetDateTime createdAt,
    OffsetDateTime reviewedAt
) {}
