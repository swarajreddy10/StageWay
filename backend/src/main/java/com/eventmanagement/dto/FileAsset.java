package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record FileAsset(
    String id,
    String originalFilename,
    String contentType,
    long sizeBytes,
    long uploadedBy,
    OffsetDateTime createdAt
) {}
