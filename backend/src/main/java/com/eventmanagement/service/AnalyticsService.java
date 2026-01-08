package com.eventmanagement.service;

import com.eventmanagement.dto.AnalyticsOverview;
import com.eventmanagement.dto.CategoryStats;
import com.eventmanagement.dto.DemographicPoint;
import com.eventmanagement.dto.EngagementMetrics;
import com.eventmanagement.dto.EventAnalytics;
import com.eventmanagement.dto.EventPerformance;
import com.eventmanagement.dto.HostAnalytics;
import com.eventmanagement.dto.PriceInfo;
import com.eventmanagement.dto.RevenuePoint;
import com.eventmanagement.dto.RevenueSummary;
import com.eventmanagement.dto.StatusDistribution;
import com.eventmanagement.dto.TimeSlotPoint;
import com.eventmanagement.dto.TrendPoint;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.Registration;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.RegistrationRepository;
import com.eventmanagement.util.PriceParser;
import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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

    public HostAnalytics getHostAnalytics(String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        User organizer = authService.requireOrganizer(userId);
        boolean isAdmin = authService.isAdmin(organizer);
        
        List<Event> events = isAdmin
            ? eventRepository.findAll()
            : eventRepository.findByOrganizationId(organizer.getId());
        
        AnalyticsOverview overview = getAnalyticsOverview(authHeader);
        List<EventPerformance> topEvents = calculateTopEvents(events);
        List<CategoryStats> categoryBreakdown = calculateCategoryStats(events);
        List<RevenuePoint> revenueTimeline = calculateRevenueTimeline(events);
        List<StatusDistribution> registrationStatus = calculateStatusDistribution(events);
        EngagementMetrics engagement = calculateEngagementMetrics(events);
        
        return new HostAnalytics(
            overview,
            topEvents,
            categoryBreakdown,
            revenueTimeline,
            registrationStatus,
            engagement
        );
    }

    private List<EventPerformance> calculateTopEvents(List<Event> events) {
        return events.stream()
            .map(event -> {
                long registrations = registrationRepository.countByEventId(event.getId());
                long checkedIn = registrationRepository.countByEventIdAndStatusIn(
                    event.getId(), List.of("CHECKED_IN")
                );
                double checkInRate = registrations == 0 ? 0 : (checkedIn * 100.0) / registrations;
                PriceInfo priceInfo = resolvePriceInfo(event);
                long confirmed = registrationRepository.countByEventIdAndStatusIn(
                    event.getId(), List.of("CONFIRMED", "CHECKED_IN")
                );
                double revenue = priceInfo.price() * confirmed;
                
                return new EventPerformance(
                    event.getId(),
                    event.getName(),
                    registrations,
                    checkedIn,
                    checkInRate,
                    revenue,
                    priceInfo.currency()
                );
            })
            .sorted((a, b) -> Long.compare(b.registrations(), a.registrations()))
            .limit(5)
            .toList();
    }

    private List<CategoryStats> calculateCategoryStats(List<Event> events) {
        Map<String, List<Event>> byCategory = events.stream()
            .collect(Collectors.groupingBy(e -> e.getCategory() != null ? e.getCategory() : "Uncategorized"));
        
        return byCategory.entrySet().stream()
            .map(entry -> {
                String category = entry.getKey();
                List<Event> categoryEvents = entry.getValue();
                long eventCount = categoryEvents.size();
                long totalRegs = categoryEvents.stream()
                    .mapToLong(e -> registrationRepository.countByEventId(e.getId()))
                    .sum();
                double avgCheckIn = categoryEvents.stream()
                    .mapToDouble(e -> {
                        long regs = registrationRepository.countByEventId(e.getId());
                        long checkedIn = registrationRepository.countByEventIdAndStatusIn(
                            e.getId(), List.of("CHECKED_IN")
                        );
                        return regs == 0 ? 0 : (checkedIn * 100.0) / regs;
                    })
                    .average()
                    .orElse(0);
                
                return new CategoryStats(category, eventCount, totalRegs, avgCheckIn);
            })
            .sorted((a, b) -> Long.compare(b.totalRegistrations(), a.totalRegistrations()))
            .toList();
    }

    private List<RevenuePoint> calculateRevenueTimeline(List<Event> events) {
        Map<String, RevenueData> monthlyData = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        for (Event event : events) {
            if (event.getStartsAt() == null) continue;
            
            String month = event.getStartsAt().toLocalDate().format(formatter);
            PriceInfo priceInfo = resolvePriceInfo(event);
            long confirmed = registrationRepository.countByEventIdAndStatusIn(
                event.getId(), List.of("CONFIRMED", "CHECKED_IN")
            );
            double revenue = priceInfo.price() * confirmed;
            
            monthlyData.merge(month, new RevenueData(revenue, confirmed),
                (old, curr) -> new RevenueData(old.revenue + curr.revenue, old.registrations + curr.registrations));
        }
        
        return monthlyData.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(e -> new RevenuePoint(e.getKey(), e.getValue().revenue, e.getValue().registrations))
            .toList();
    }

    private List<StatusDistribution> calculateStatusDistribution(List<Event> events) {
        List<Long> eventIds = events.stream().map(Event::getId).toList();
        if (eventIds.isEmpty()) {
            return List.of();
        }
        
        long total = registrationRepository.countByEventIdInNative(eventIds);
        if (total == 0) {
            return List.of();
        }
        
        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("CONFIRMED", registrationRepository.countByEventIdInAndStatusInNative(
            eventIds, List.of("CONFIRMED")
        ));
        statusCounts.put("CHECKED_IN", registrationRepository.countByEventIdInAndStatusInNative(
            eventIds, List.of("CHECKED_IN")
        ));
        statusCounts.put("WAITLISTED", registrationRepository.countByEventIdInAndStatusInNative(
            eventIds, List.of("WAITLISTED")
        ));
        statusCounts.put("CANCELLED", registrationRepository.countByEventIdInAndStatusInNative(
            eventIds, List.of("CANCELLED")
        ));
        
        return statusCounts.entrySet().stream()
            .map(e -> new StatusDistribution(
                e.getKey(),
                e.getValue(),
                (e.getValue() * 100.0) / total
            ))
            .sorted((a, b) -> Long.compare(b.count(), a.count()))
            .toList();
    }

    private EngagementMetrics calculateEngagementMetrics(List<Event> events) {
        if (events.isEmpty()) {
            return new EngagementMetrics(0, 0, 0, 0);
        }
        
        List<Long> eventIds = events.stream().map(Event::getId).toList();
        long totalRegs = registrationRepository.countByEventIdInNative(eventIds);
        double avgRegsPerEvent = (double) totalRegs / events.size();
        
        double avgCheckIn = events.stream()
            .mapToDouble(e -> {
                long regs = registrationRepository.countByEventId(e.getId());
                long checkedIn = registrationRepository.countByEventIdAndStatusIn(
                    e.getId(), List.of("CHECKED_IN")
                );
                return regs == 0 ? 0 : (checkedIn * 100.0) / regs;
            })
            .average()
            .orElse(0);
        
        long cancelled = registrationRepository.countByEventIdInAndStatusInNative(
            eventIds, List.of("CANCELLED")
        );
        double cancellationRate = totalRegs == 0 ? 0 : (cancelled * 100.0) / totalRegs;
        
        Map<Integer, Long> hourCounts = new HashMap<>();
        for (Event event : events) {
            List<Object[]> hourData = registrationRepository.countByEventIdGroupedByHour(event.getId());
            for (Object[] row : hourData) {
                int hour = resolveHourValue(row);
                long count = resolveCountValue(row);
                hourCounts.merge(hour, count, Long::sum);
            }
        }
        
        long peakHour = hourCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .map(Integer::longValue)
            .orElse(0L);
        
        return new EngagementMetrics(avgRegsPerEvent, avgCheckIn, cancellationRate, peakHour);
    }

    private record RevenueData(double revenue, long registrations) {}

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
