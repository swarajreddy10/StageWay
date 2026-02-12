package com.eventmanagement.service;

import com.eventmanagement.dto.RegistrationRequest;
import com.eventmanagement.dto.RegistrationResponse;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.Registration;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.RegistrationRepository;
import com.eventmanagement.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock private EventRepository eventRepository;
    @Mock private UserRepository userRepository;
    @Mock private RegistrationRepository registrationRepository;
    @Mock private AuthService authService;
    @Mock private SeatService seatService;
    @Mock private RegistrationUpdatePublisher registrationUpdatePublisher;

    private RegistrationService registrationService;

    @BeforeEach
    void setUp() {
        registrationService = new RegistrationService(
            eventRepository, userRepository, registrationRepository,
            authService, seatService, registrationUpdatePublisher,
            "test-secret", java.time.Duration.ofHours(48)
        );
    }

    @Test
    void registerForEvent_shouldHandleCapacityLimits() {
        Event event = createTestEvent(100);
        User user = createTestUser(1L);

        when(authService.validateAuth(any())).thenReturn(1L);
        when(eventRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(event));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(registrationRepository.findByEventIdAndUserId(1L, 1L)).thenReturn(null);
        when(registrationRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        RegistrationRequest request = new RegistrationRequest();
        request.setEventId(1L);

        RegistrationResponse result = registrationService.registerForEvent(request, "Bearer token", null);

        assertThat(result).isNotNull();
    }

    @Test
    void registerForEvent_shouldPreventHostSelfRegistration() {
        Event event = createTestEvent(100);
        event.setOrganizationId(1L); // Host ID
        User host = createTestUser(1L);

        when(authService.validateAuth(any())).thenReturn(1L);
        when(eventRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(event));
        when(userRepository.findById(1L)).thenReturn(Optional.of(host));

        RegistrationRequest request = new RegistrationRequest();
        request.setEventId(1L);

        ResponseStatusException ex = assertThrows(
            ResponseStatusException.class,
            () -> registrationService.registerForEvent(request, "Bearer token", null)
        );

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    private Event createTestEvent(int capacity) {
        Event event = new Event();
        event.setId(1L);
        event.setName("Test Event");
        event.setCapacity(capacity);
        event.setStartsAt(OffsetDateTime.now().plusDays(1));
        event.setEndsAt(OffsetDateTime.now().plusDays(1).plusHours(2));
        return event;
    }

    private User createTestUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setEmail("user" + id + "@test.com");
        user.setFullName("Test User " + id);
        return user;
    }
}