package com.eventmanagement.controller;

import com.eventmanagement.dto.AttendeeSummary;
import com.eventmanagement.dto.EventRequest;
import com.eventmanagement.dto.EventResponse;
import com.eventmanagement.dto.PagedResponse;
import com.eventmanagement.dto.SeatAvailability;
import com.eventmanagement.dto.validation.OnCreate;
import com.eventmanagement.dto.validation.OnUpdate;
import com.eventmanagement.service.EventService;
import com.eventmanagement.service.RegistrationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.validation.annotation.Validated;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api")
public class EventController {
    private final EventService eventService;
    private final RegistrationService registrationService;

    public EventController(EventService eventService, RegistrationService registrationService) {
        this.eventService = eventService;
        this.registrationService = registrationService;
    }

    @GetMapping("/events")
    public PagedResponse<EventResponse> getAllEvents(
        @RequestParam(value = "search", required = false) String search,
        @RequestParam(value = "category", required = false) String category,
        @RequestParam(value = "dateFrom", required = false) String dateFrom,
        @RequestParam(value = "dateTo", required = false) String dateTo,
        @RequestParam(value = "location", required = false) String location,
        @RequestParam(value = "priceMin", required = false) Double priceMin,
        @RequestParam(value = "priceMax", required = false) Double priceMax,
        @RequestParam(value = "isFree", required = false) Boolean isFree,
        @RequestParam(value = "page", defaultValue = "0") int page,
        @RequestParam(value = "size", defaultValue = "12") int size
    ) {
        return eventService.getAllEvents(
            search,
            category,
            dateFrom,
            dateTo,
            location,
            priceMin,
            priceMax,
            isFree,
            page,
            size
        );
    }

    @GetMapping({"/events/mine", "/events/my"})
    @PreAuthorize("hasRole('HOST')")
    public List<EventResponse> getMyEvents(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return eventService.getMyEvents(authHeader);
    }

    @PostMapping("/events")
    @PreAuthorize("hasRole('HOST')")
    public EventResponse createEvent(
        @Validated(OnCreate.class) @RequestBody EventRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return eventService.createEvent(request, authHeader);
    }

    @PutMapping("/events/{id}")
    @PreAuthorize("hasRole('HOST')")
    public EventResponse updateEvent(
        @PathVariable Long id,
        @Validated(OnUpdate.class) @RequestBody EventRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return eventService.updateEvent(id, request, authHeader);
    }

    @DeleteMapping("/events/{id}")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<Void> deleteEvent(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        eventService.deleteEvent(id, authHeader);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events/{id}")
    public EventResponse getEvent(@PathVariable Long id) {
        return eventService.getEvent(id);
    }

    @GetMapping("/events/{id}/seats")
    public SeatAvailability getSeatAvailability(@PathVariable Long id) {
        return eventService.getSeatAvailability(id);
    }

    @GetMapping("/events/{id}/attendees")
    @PreAuthorize("hasRole('HOST')")
    public List<AttendeeSummary> getEventAttendees(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return registrationService.getEventAttendees(id, authHeader);
    }
}
