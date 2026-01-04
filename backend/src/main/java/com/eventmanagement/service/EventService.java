package com.eventmanagement.service;

import com.eventmanagement.dto.EventRequest;
import com.eventmanagement.dto.EventResponse;
import com.eventmanagement.dto.PagedResponse;
import com.eventmanagement.dto.PriceInfo;
import com.eventmanagement.dto.SeatAvailability;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.RegistrationRepository;
import com.eventmanagement.util.EventFormatter;
import com.eventmanagement.util.PriceParser;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final AuthService authService;
    private final SeatService seatService;

    public EventService(
        EventRepository eventRepository,
        RegistrationRepository registrationRepository,
        AuthService authService,
        SeatService seatService
    ) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.authService = authService;
        this.seatService = seatService;
    }

    public PagedResponse<EventResponse> getAllEvents(
        String search,
        String category,
        String dateFrom,
        String dateTo,
        String location,
        Double priceMin,
        Double priceMax,
        Boolean isFree,
        int page,
        int size
    ) {
        LocalDate fromDate = parseFilterDate(dateFrom);
        LocalDate toDate = parseFilterDate(dateTo);
        String searchValue = normalizeFilter(search);
        String locationValue = normalizeFilter(location);

        Specification<Event> specification = buildEventSpecification(
            searchValue,
            category,
            locationValue,
            fromDate,
            toDate,
            priceMin,
            priceMax,
            isFree
        );

        Page<Event> eventPage = eventRepository.findAll(
            specification,
            PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startsAt").and(Sort.by("id")))
        );

        List<Event> events = eventPage.getContent();
        Map<Long, Long> confirmedCounts = resolveConfirmedCounts(events);
        List<EventResponse> pageContent = events.stream()
            .map(event -> buildEventResponse(event, confirmedCounts.getOrDefault(event.getId(), 0L)))
            .toList();

        return new PagedResponse<>(
            pageContent,
            page,
            size,
            eventPage.getTotalElements(),
            eventPage.getTotalPages(),
            eventPage.isFirst(),
            eventPage.isLast()
        );
    }

    public List<EventResponse> getMyEvents(String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        User organizer = authService.requireOrganizer(userId);
        String role = organizer.getRole() != null ? organizer.getRole().toUpperCase() : "ATTENDEE";
        List<Event> events = "ADMIN".equals(role)
            ? eventRepository.findAll()
            : eventRepository.findByOrganizationId(organizer.getId());
        Map<Long, Long> confirmedCounts = resolveConfirmedCounts(events);
        return events.stream()
            .map(event -> buildEventResponse(event, confirmedCounts.getOrDefault(event.getId(), 0L)))
            .toList();
    }

    public EventResponse createEvent(EventRequest request, String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        User organizer = authService.requireOrganizer(userId);

        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event name is required.");
        }
        OffsetDateTime startsAt = resolveEventStart(request);
        if (startsAt == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time is required.");
        }
        OffsetDateTime endsAt = resolveEventEnd(request);
        if (endsAt == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time is required.");
        }
        if (endsAt.isBefore(startsAt)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        }

        Event event = new Event();
        event.setName(request.getName().trim());
        event.setDescription(normalizeOptionalText(request.getDescription()));
        event.setStartsAt(startsAt);
        event.setEndsAt(endsAt);
        event.setStatus(resolveEventStatus(request.getStatus()));
        event.setCapacity(request.getCapacity());
        event.setVenueName(normalizeOptionalText(request.getVenueName()));
        event.setVenueAddress(resolveEventLocation(request));
        event.setCity(normalizeOptionalText(request.getCity()));
        event.setCategory(normalizeOptionalText(request.getCategory()));
        event.setBannerImageUrl(resolveBannerUrl(request));
        event.setOrganizerName(resolveOrganizerName(request, organizer));
        event.setOrganizationId(resolveOrganizationId(request, organizer));
        event.setTags(resolveTags(request));
        applyPriceUpdate(event, request, true);

        Event saved = eventRepository.save(event);
        return buildEventResponse(saved, 0);
    }

    public EventResponse updateEvent(Long id, EventRequest request, String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        User organizer = authService.requireOrganizer(userId);
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));
        requireEventOwnership(organizer, event);

        if (request.getName() != null) {
            if (request.getName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event name cannot be empty.");
            }
            event.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            event.setDescription(normalizeOptionalText(request.getDescription()));
        }
        OffsetDateTime updatedStart = resolveEventStart(request);
        OffsetDateTime updatedEnd = resolveEventEnd(request);
        validateEventDates(event, updatedStart, updatedEnd);
        if (updatedStart != null) {
            event.setStartsAt(updatedStart);
        }
        if (updatedEnd != null) {
            event.setEndsAt(updatedEnd);
        }
        if (request.getStatus() != null) {
            event.setStatus(resolveEventStatus(request.getStatus()));
        }
        if (request.getCapacity() != null) {
            event.setCapacity(request.getCapacity());
        }
        if (request.getVenueName() != null) {
            event.setVenueName(normalizeOptionalText(request.getVenueName()));
        }
        if (hasLocationUpdate(request)) {
            event.setVenueAddress(resolveEventLocation(request));
        }
        if (request.getCity() != null) {
            event.setCity(normalizeOptionalText(request.getCity()));
        }
        if (request.getCategory() != null) {
            event.setCategory(normalizeOptionalText(request.getCategory()));
        }
        if (hasBannerUpdate(request)) {
            event.setBannerImageUrl(resolveBannerUrl(request));
        }
        if (hasPriceUpdate(request)) {
            applyPriceUpdate(event, request, false);
        }
        if (request.getOrganizerName() != null) {
            event.setOrganizerName(normalizeOptionalText(request.getOrganizerName()));
        }
        if (request.getOrganizationId() != null) {
            event.setOrganizationId(request.getOrganizationId());
        }
        if (request.getTags() != null) {
            event.setTags(resolveTags(request));
        }

        Event saved = eventRepository.save(event);
        long confirmedCount = registrationRepository.countByEventIdAndStatusIn(
            saved.getId(),
            seatService.confirmedStatuses()
        );
        return buildEventResponse(saved, confirmedCount);
    }

    public EventResponse getEvent(Long id) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));
        long confirmedCount = registrationRepository.countByEventIdAndStatusIn(
            event.getId(),
            seatService.confirmedStatuses()
        );
        return buildEventResponse(event, confirmedCount);
    }

    public void deleteEvent(Long id, String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        User organizer = authService.requireOrganizer(userId);
        requireEventOwnership(organizer, event);

        eventRepository.delete(event);
    }

    public SeatAvailability getSeatAvailability(Long id) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));
        return seatService.buildSeatAvailability(event);
    }

    private void requireEventOwnership(User organizer, Event event) {
        String role = organizer.getRole() != null ? organizer.getRole().toUpperCase() : "ATTENDEE";
        if ("ADMIN".equals(role)) {
            return;
        }
        if (event.getOrganizationId() != null
            && !event.getOrganizationId().equals(organizer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Organizer does not own this event.");
        }
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private String normalizeFilter(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed.toLowerCase();
    }

    private LocalDate parseFilterDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (Exception ex) {
            return null;
        }
    }

    private OffsetDateTime resolveEventStart(EventRequest request) {
        if (request.getStartDate() != null && !request.getStartDate().isBlank()) {
            return normalizeToUtc(parseDateTime(request.getStartDate()));
        }
        return normalizeToUtc(request.getStartsAt());
    }

    private OffsetDateTime resolveEventEnd(EventRequest request) {
        if (request.getEndDate() != null && !request.getEndDate().isBlank()) {
            return normalizeToUtc(parseDateTime(request.getEndDate()));
        }
        return normalizeToUtc(request.getEndsAt());
    }

    private OffsetDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        try {
            return OffsetDateTime.parse(trimmed);
        } catch (Exception ex) {
            try {
                LocalDateTime localDateTime = LocalDateTime.parse(trimmed);
                return localDateTime.atOffset(ZoneOffset.UTC);
            } catch (Exception ignored) {
                return null;
            }
        }
    }

    private OffsetDateTime normalizeToUtc(OffsetDateTime value) {
        if (value == null) {
            return null;
        }
        return value.withOffsetSameInstant(ZoneOffset.UTC);
    }

    private void validateEventDates(Event event, OffsetDateTime updatedStart, OffsetDateTime updatedEnd) {
        OffsetDateTime start = updatedStart != null ? updatedStart : event.getStartsAt();
        OffsetDateTime end = updatedEnd != null ? updatedEnd : event.getEndsAt();
        if (start != null && end != null && end.isBefore(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        }
    }

    private String resolveEventStatus(String status) {
        if (status == null || status.isBlank()) {
            return "PUBLISHED";
        }
        return status.trim().toUpperCase();
    }

    private String resolveEventLocation(EventRequest request) {
        String location = normalizeOptionalText(request.getLocation());
        if (location != null) {
            return location;
        }
        return normalizeOptionalText(request.getVenueAddress());
    }

    private String resolveBannerUrl(EventRequest request) {
        String bannerUrl = normalizeOptionalText(request.getBannerUrl());
        if (bannerUrl != null) {
            return bannerUrl;
        }
        return normalizeOptionalText(request.getBannerImageUrl());
    }

    private String resolveTags(EventRequest request) {
        if (request.getTags() == null) {
            return null;
        }
        return request.getTags().stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(tag -> !tag.isBlank())
            .collect(Collectors.joining(", "));
    }

    private Long resolveOrganizationId(EventRequest request, User organizer) {
        if (request.getOrganizationId() != null) {
            return request.getOrganizationId();
        }
        return organizer != null ? organizer.getId() : null;
    }

    private String resolveOrganizerName(EventRequest request, User organizer) {
        String organizerName = normalizeOptionalText(request.getOrganizerName());
        if (organizerName != null) {
            return organizerName;
        }
        if (organizer != null && organizer.getFullName() != null) {
            return organizer.getFullName();
        }
        return "Guest Organizer";
    }

    private boolean hasLocationUpdate(EventRequest request) {
        return request.getLocation() != null || request.getVenueAddress() != null;
    }

    private boolean hasBannerUpdate(EventRequest request) {
        return request.getBannerUrl() != null || request.getBannerImageUrl() != null;
    }

    private boolean hasPriceUpdate(EventRequest request) {
        return request.getPrice() != null || request.getCurrency() != null || request.getPriceRange() != null;
    }

    private EventResponse buildEventResponse(Event event, long confirmedCount) {
        PriceInfo priceInfo = resolveStoredPriceInfo(event);
        long availableSeats = 0;
        Integer capacity = event.getCapacity();
        if (capacity != null && capacity > 0) {
            availableSeats = Math.max(0, capacity - confirmedCount);
        }
        List<String> tags = splitTags(event.getTags());
        OffsetDateTime publishedAt = "PUBLISHED".equalsIgnoreCase(event.getStatus()) ? event.getUpdatedAt() : null;
        return new EventResponse(
            event.getId(),
            event.getOrganizationId(),
            event.getOrganizationId(),
            event.getName(),
            event.getDescription(),
            event.getCategory(),
            event.getStartsAt(),
            event.getEndsAt(),
            EventFormatter.formatLocation(event),
            event.getVenueName(),
            capacity != null ? capacity : 0,
            availableSeats,
            priceInfo.price(),
            priceInfo.currency(),
            event.getBannerImageUrl(),
            event.getStatus(),
            event.getCreatedAt(),
            event.getUpdatedAt(),
            publishedAt,
            false,
            tags,
            event.getStartsAt(),
            event.getEndsAt(),
            event.getVenueAddress(),
            event.getCity(),
            event.getBannerImageUrl(),
            event.getPriceRange(),
            event.getOrganizerName()
        );
    }

    private List<String> splitTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return null;
        }
        List<String> values = Arrays.stream(tags.split(","))
            .map(String::trim)
            .filter(value -> !value.isBlank())
            .toList();
        return values.isEmpty() ? null : values;
    }

    private Specification<Event> buildEventSpecification(
        String searchValue,
        String category,
        String locationValue,
        LocalDate fromDate,
        LocalDate toDate,
        Double priceMin,
        Double priceMax,
        Boolean isFree
    ) {
        Specification<Event> specification = Specification.where(null);
        if (searchValue != null) {
            specification = specification.and(buildSearchSpecification(searchValue));
        }
        if (category != null && !category.isBlank()) {
            specification = specification.and(buildCategorySpecification(category));
        }
        if (locationValue != null) {
            specification = specification.and(buildLocationSpecification(locationValue));
        }
        if (fromDate != null || toDate != null) {
            specification = specification.and(buildDateRangeSpecification(fromDate, toDate));
        }
        if (priceMin != null || priceMax != null || Boolean.TRUE.equals(isFree)) {
            specification = specification.and(buildPriceSpecification(priceMin, priceMax, isFree));
        }
        return specification;
    }

    private Specification<Event> buildSearchSpecification(String searchValue) {
        return (root, query, builder) -> {
            String pattern = "%" + searchValue + "%";
            return builder.or(
                builder.like(builder.lower(root.get("name")), pattern),
                builder.like(builder.lower(root.get("description")), pattern),
                builder.like(builder.lower(root.get("organizerName")), pattern),
                builder.like(builder.lower(root.get("venueName")), pattern),
                builder.like(builder.lower(root.get("venueAddress")), pattern),
                builder.like(builder.lower(root.get("city")), pattern),
                builder.like(builder.lower(root.get("category")), pattern)
            );
        };
    }

    private Specification<Event> buildCategorySpecification(String category) {
        return (root, query, builder) ->
            builder.equal(builder.lower(root.get("category")), category.trim().toLowerCase());
    }

    private Specification<Event> buildLocationSpecification(String locationValue) {
        return (root, query, builder) -> {
            String pattern = "%" + locationValue + "%";
            return builder.or(
                builder.like(builder.lower(root.get("venueAddress")), pattern),
                builder.like(builder.lower(root.get("city")), pattern),
                builder.like(builder.lower(root.get("venueName")), pattern)
            );
        };
    }

    private Specification<Event> buildDateRangeSpecification(LocalDate fromDate, LocalDate toDate) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (fromDate != null) {
                OffsetDateTime start = fromDate.atStartOfDay().atOffset(ZoneOffset.UTC);
                predicates.add(builder.greaterThanOrEqualTo(root.get("startsAt"), start));
            }
            if (toDate != null) {
                OffsetDateTime endExclusive = toDate.plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
                predicates.add(builder.lessThan(root.get("endsAt"), endExclusive));
            }
            return predicates.isEmpty()
                ? builder.conjunction()
                : builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Specification<Event> buildPriceSpecification(Double priceMin, Double priceMax, Boolean isFree) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            var priceExpression = builder.coalesce(root.get("priceAmount"), 0.0);
            if (priceMin != null) {
                predicates.add(builder.greaterThanOrEqualTo(priceExpression, priceMin));
            }
            if (priceMax != null) {
                predicates.add(builder.lessThanOrEqualTo(priceExpression, priceMax));
            }
            if (Boolean.TRUE.equals(isFree)) {
                predicates.add(builder.equal(priceExpression, 0.0));
            }
            return predicates.isEmpty()
                ? builder.conjunction()
                : builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Map<Long, Long> resolveConfirmedCounts(List<Event> events) {
        if (events == null || events.isEmpty()) {
            return Map.of();
        }
        List<Long> eventIds = events.stream()
            .map(Event::getId)
            .filter(Objects::nonNull)
            .toList();
        if (eventIds.isEmpty()) {
            return Map.of();
        }
        List<Object[]> counts = registrationRepository.countByEventIdInAndStatusIn(
            eventIds,
            seatService.confirmedStatuses()
        );
        Map<Long, Long> results = new HashMap<>();
        for (Object[] row : counts) {
            if (row == null || row.length < 2) {
                continue;
            }
            Long eventId = row[0] instanceof Number number ? number.longValue() : null;
            Long count = row[1] instanceof Number number ? number.longValue() : null;
            if (eventId != null && count != null) {
                results.put(eventId, count);
            }
        }
        return results;
    }

    private PriceInfo resolveStoredPriceInfo(Event event) {
        if (event.getPriceAmount() != null) {
            return new PriceInfo(event.getPriceAmount(), normalizeCurrency(event.getPriceCurrency()));
        }
        return PriceParser.fromRange(event.getPriceRange());
    }

    private void applyPriceUpdate(Event event, EventRequest request, boolean isCreate) {
        PriceInfo priceInfo = resolveRequestPriceInfo(request, event);
        boolean hasExplicitPrice = request.getPrice() != null
            || normalizeOptionalText(request.getPriceRange()) != null
            || request.getCurrency() != null;
        if (priceInfo == null) {
            if (!isCreate) {
                return;
            }
            priceInfo = new PriceInfo(0, "USD");
        }
        String priceRange = hasExplicitPrice ? resolvePriceRange(request, priceInfo) : null;
        event.setPriceAmount(priceInfo.price());
        event.setPriceCurrency(normalizeCurrency(priceInfo.currency()));
        event.setPriceRange(priceRange);
    }

    private PriceInfo resolveRequestPriceInfo(EventRequest request, Event event) {
        if (request.getPrice() != null) {
            return new PriceInfo(request.getPrice(), resolveCurrency(request.getCurrency(), event));
        }
        String priceRange = normalizeOptionalText(request.getPriceRange());
        if (priceRange != null) {
            return PriceParser.fromRange(priceRange);
        }
        if (request.getCurrency() != null && event != null) {
            PriceInfo existing = resolveStoredPriceInfo(event);
            return new PriceInfo(existing.price(), request.getCurrency());
        }
        return null;
    }

    private String resolvePriceRange(EventRequest request, PriceInfo priceInfo) {
        String priceRange = normalizeOptionalText(request.getPriceRange());
        if (priceRange != null) {
            return priceRange;
        }
        if (priceInfo == null) {
            return null;
        }
        if (priceInfo.price() <= 0) {
            return "FREE";
        }
        String currency = normalizeCurrency(priceInfo.currency());
        return currency + " " + String.format(Locale.US, "%.2f", priceInfo.price());
    }

    private String resolveCurrency(String requestedCurrency, Event event) {
        if (requestedCurrency != null && !requestedCurrency.isBlank()) {
            return requestedCurrency.trim().toUpperCase();
        }
        if (event != null && event.getPriceCurrency() != null && !event.getPriceCurrency().isBlank()) {
            return event.getPriceCurrency().trim().toUpperCase();
        }
        return "USD";
    }

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return "USD";
        }
        return currency.trim().toUpperCase();
    }
}
