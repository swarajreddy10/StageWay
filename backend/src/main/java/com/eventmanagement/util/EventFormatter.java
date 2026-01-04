package com.eventmanagement.util;

import com.eventmanagement.dto.RegistrationEventSummary;
import com.eventmanagement.dto.WaitlistEventSummary;
import com.eventmanagement.model.Event;
import java.util.Arrays;
import java.util.Objects;
import java.util.stream.Collectors;

public final class EventFormatter {
    private EventFormatter() {}

    public static String formatLocation(Event event) {
        String locationValue = Arrays.asList(event.getVenueAddress(), event.getCity())
            .stream()
            .filter(value -> value != null && !value.isBlank())
            .collect(Collectors.joining(", "));
        return locationValue.isBlank() ? "Location TBA" : locationValue;
    }

    public static RegistrationEventSummary toRegistrationSummary(Event event) {
        if (event == null) {
            return null;
        }
        return new RegistrationEventSummary(
            event.getId(),
            event.getName(),
            event.getStartsAt(),
            event.getEndsAt(),
            formatLocation(event),
            event.getBannerImageUrl()
        );
    }

    public static WaitlistEventSummary toWaitlistSummary(Event event) {
        if (event == null) {
            return null;
        }
        return new WaitlistEventSummary(event.getId(), event.getName(), event.getStartsAt());
    }

    public static String formatVenue(Event event) {
        String venueValue = Arrays.asList(event.getVenueName(), event.getVenueAddress(), event.getCity())
            .stream()
            .filter(Objects::nonNull)
            .filter(value -> !value.isBlank())
            .collect(Collectors.joining(", "));
        return venueValue.isBlank() ? "Venue to be announced" : venueValue;
    }

    public static String formatRange(Event event) {
        String start = event.getStartsAt() != null ? event.getStartsAt().toString() : "TBA";
        String end = event.getEndsAt() != null ? event.getEndsAt().toString() : "TBA";
        return start + " to " + end;
    }
}
