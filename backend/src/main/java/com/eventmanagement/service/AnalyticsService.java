package com.eventmanagement.service;

import com.eventmanagement.dto.AnalyticsOverview;
import com.eventmanagement.dto.DemographicPoint;
import com.eventmanagement.dto.EventAnalytics;
import com.eventmanagement.dto.PriceInfo;
import com.eventmanagement.dto.RevenueSummary;
import com.eventmanagement.dto.TimeSlotPoint;
import com.eventmanagement.dto.TrendPoint;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.RegistrationRepository;
import com.eventmanagement.util.PriceParser;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AnalyticsService {
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final AuthService authService;

    public AnalyticsService(
        EventRepository eventRepository,
        RegistrationRepository registrationRepository,
        AuthService authService
    ) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.authService = authService;
    }

    public AnalyticsOverview getAnalyticsOverview(String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        User organizer = authService.requireOrganizer(userId);
        boolean isAdmin = authService.isAdmin(organizer);
        List<Long> eventIds = isAdmin
            ? eventRepository.findAllIds()
            : eventRepository.findIdsByOrganizationId(organizer.getId());
        long totalEvents = isAdmin
            ? eventRepository.count()
            : eventRepository.countByOrganizationId(organizer.getId());
        long publishedEvents = isAdmin
            ? eventRepository.countByStatusIgnoreCase("PUBLISHED")
            : eventRepository.countByOrganizationIdAndStatusIgnoreCase(organizer.getId(), "PUBLISHED");

        long totalRegistrations = eventIds.isEmpty()
            ? 0
            : registrationRepository.countByEventIdInNative(eventIds);
        long confirmedRegistrations = eventIds.isEmpty()
            ? 0
            : registrationRepository.countByEventIdInAndStatusInNative(eventIds, List.of("CONFIRMED"));
        long waitlistedRegistrations = eventIds.isEmpty()
            ? 0
            : registrationRepository.countByEventIdInAndStatusInNative(eventIds, List.of("WAITLISTED"));
        long checkedInRegistrations = eventIds.isEmpty()
            ? 0
            : registrationRepository.countByEventIdInAndStatusInNative(eventIds, List.of("CHECKED_IN"));

        return new AnalyticsOverview(
            totalEvents,
            publishedEvents,
            totalRegistrations,
            confirmedRegistrations,
            waitlistedRegistrations,
            checkedInRegistrations
        );
    }

    public EventAnalytics getEventAnalytics(Long id, String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        User organizer = authService.requireOrganizer(userId);

        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));
        requireEventOwnership(organizer, event);

        long totalRegistrations = registrationRepository.countByEventId(id);
        long checkedInCount = registrationRepository.countByEventIdAndStatusIn(id, List.of("CHECKED_IN"));
        long confirmedCount = registrationRepository.countByEventIdAndStatusIn(id, List.of("CONFIRMED", "CHECKED_IN"));
        double checkInRate = totalRegistrations == 0 ? 0 : (checkedInCount * 100.0) / totalRegistrations;

        List<TrendPoint> trend = registrationRepository.countByEventIdGroupedByDate(id).stream()
            .map(row -> new TrendPoint(resolveDayValue(row), resolveCountValue(row)))
            .toList();

        List<TimeSlotPoint> timeSlots = registrationRepository.countByEventIdGroupedByHour(id).stream()
            .map(row -> new TimeSlotPoint(resolveHourValue(row), resolveCountValue(row)))
            .toList();

        List<DemographicPoint> demographics = List.of(
            new DemographicPoint("18-24", 0),
            new DemographicPoint("25-34", 0),
            new DemographicPoint("35-44", 0),
            new DemographicPoint("45+", 0)
        );

        PriceInfo priceInfo = resolvePriceInfo(event);
        RevenueSummary revenue = priceInfo.price() > 0
            ? new RevenueSummary(priceInfo.price() * confirmedCount, priceInfo.currency())
            : null;

        return new EventAnalytics(
            event.getId(),
            totalRegistrations,
            checkedInCount,
            checkInRate,
            trend,
            demographics,
            timeSlots,
            revenue
        );
    }

    private void requireEventOwnership(User organizer, Event event) {
        if (authService.isAdmin(organizer)) {
            return;
        }
        if (event.getOrganizationId() == null
            || !event.getOrganizationId().equals(organizer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organizer does not own this event.");
        }
    }

    private PriceInfo resolvePriceInfo(Event event) {
        if (event.getPriceAmount() != null) {
            String currency = event.getPriceCurrency() != null ? event.getPriceCurrency() : "USD";
            return new PriceInfo(event.getPriceAmount(), currency.toUpperCase());
        }
        return PriceParser.fromRange(event.getPriceRange());
    }

    private String resolveDayValue(Object[] row) {
        if (row == null || row.length == 0 || row[0] == null) {
            return LocalDate.now().toString();
        }
        Object value = row[0];
        if (value instanceof LocalDate localDate) {
            return localDate.toString();
        }
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate().toString();
        }
        return value.toString();
    }

    private int resolveHourValue(Object[] row) {
        if (row == null || row.length == 0 || row[0] == null) {
            return 0;
        }
        Object value = row[0];
        if (value instanceof Number number) {
            return number.intValue();
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private long resolveCountValue(Object[] row) {
        if (row == null || row.length < 2 || row[1] == null) {
            return 0;
        }
        Object value = row[1];
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException ex) {
            return 0;
        }
    }
}
