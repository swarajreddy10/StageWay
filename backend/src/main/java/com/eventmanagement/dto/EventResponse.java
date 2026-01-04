package com.eventmanagement.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record EventResponse(
    Long id,
    Long organizerId,
    Long organizationId,
    String name,
    String description,
    String category,
    OffsetDateTime startDate,
    OffsetDateTime endDate,
    String location,
    String venueName,
    Integer capacity,
    long availableSeats,
    double price,
    String currency,
    String bannerUrl,
    String status,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    OffsetDateTime publishedAt,
    boolean isFeatured,
    List<String> tags,
    OffsetDateTime startsAt,
    OffsetDateTime endsAt,
    String venueAddress,
    String city,
    String bannerImageUrl,
    String priceRange,
    String organizerName
) {}
