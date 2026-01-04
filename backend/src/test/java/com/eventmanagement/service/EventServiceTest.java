package com.eventmanagement.service;

import com.eventmanagement.dto.EventRequest;
import com.eventmanagement.dto.EventResponse;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.RegistrationRepository;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private AuthService authService;

    @Mock
    private SeatService seatService;

    @Captor
    private ArgumentCaptor<Event> eventCaptor;

    private EventService eventService;

    @BeforeEach
    void setUp() {
        eventService = new EventService(eventRepository, registrationRepository, authService, seatService);
    }

    @Test
    void createEvent_requiresName() {
        EventRequest request = new EventRequest();
        request.setStartDate("2026-01-12T10:00:00Z");
        request.setEndDate("2026-01-12T12:00:00Z");

        when(authService.validateAuth(any())).thenReturn(1L);
        when(authService.requireOrganizer(1L)).thenReturn(new User());

        ResponseStatusException ex = assertThrows(
            ResponseStatusException.class,
            () -> eventService.createEvent(request, "Bearer token")
        );

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void createEvent_requiresValidDates() {
        EventRequest request = new EventRequest();
        request.setName("Test Event");
        request.setStartDate("2026-01-12T12:00:00Z");
        request.setEndDate("2026-01-12T10:00:00Z");

        when(authService.validateAuth(any())).thenReturn(1L);
        when(authService.requireOrganizer(1L)).thenReturn(new User());

        ResponseStatusException ex = assertThrows(
            ResponseStatusException.class,
            () -> eventService.createEvent(request, "Bearer token")
        );

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void createEvent_defaultsOrganizerFields() {
        EventRequest request = new EventRequest();
        request.setName("Launch Day");
        request.setStartDate("2026-01-12T10:00:00Z");
        request.setEndDate("2026-01-12T12:00:00Z");
        request.setCapacity(0);

        User organizer = new User();
        organizer.setId(9L);
        organizer.setFullName("Host Name");

        when(authService.validateAuth(any())).thenReturn(9L);
        when(authService.requireOrganizer(9L)).thenReturn(organizer);
        when(eventRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        EventResponse response = eventService.createEvent(request, "Bearer token");

        assertThat(response.organizerName()).isEqualTo("Host Name");
        assertThat(response.organizationId()).isEqualTo(9L);
        assertThat(response.startDate()).isEqualTo(OffsetDateTime.parse("2026-01-12T10:00:00Z"));
    }
}
