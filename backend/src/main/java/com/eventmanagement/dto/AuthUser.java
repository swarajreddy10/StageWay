package com.eventmanagement.dto;

import java.time.OffsetDateTime;

public record AuthUser(
    Long id,
    String email,
    String fullName,
    String role,
    String profilePictureUrl,
    String phone,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    boolean emailVerified,
    boolean isActive
) {}
