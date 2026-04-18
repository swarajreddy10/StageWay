package com.eventmanagement.service;

import com.eventmanagement.dto.CheckInBroadcast;
import com.eventmanagement.dto.RegistrationUpdate;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.Registration;
import com.eventmanagement.repository.RegistrationRepository;
import com.eventmanagement.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class RegistrationUpdatePublisher {
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final SeatService seatService;
    private final SimpMessagingTemplate messagingTemplate;

    public RegistrationUpdatePublisher(
        RegistrationRepository registrationRepository,
        UserRepository userRepository,
        SeatService seatService,
        SimpMessagingTemplate messagingTemplate
    ) {
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.seatService = seatService;
        this.messagingTemplate = messagingTemplate;
    }

    @Async("registrationExecutor")
    public void publish(Event event) {
        if (event == null || event.getId() == null) {
            return;
        }

        long confirmedCount = registrationRepository.countByEventIdAndStatusIn(
            event.getId(),
            seatService.confirmedStatuses()
        );
        long waitlistCount = registrationRepository.countByEventIdAndStatusIn(
            event.getId(),
            Arrays.asList("WAITLISTED")
        );
        long availableSeats = seatService.buildSeatAvailability(event).availableSeats();
        RegistrationUpdate update = new RegistrationUpdate(
            event.getId(),
            confirmedCount,
            waitlistCount,
            availableSeats,
            OffsetDateTime.now(ZoneOffset.UTC)
        );
        messagingTemplate.convertAndSend("/topic/events/" + event.getId() + "/registrations", update);
    }

    /**
     * Broadcasts a check-in event to the host's check-in page in real time.
     * Topic: /topic/checkins/{eventId}
     */
    @Async("registrationExecutor")
    public void publishCheckIn(Registration registration) {
        if (registration == null || registration.getEventId() == null) {
            return;
        }
        String name = userRepository.findById(registration.getUserId())
            .map(u -> u.getFullName())
            .orElse("Attendee");
        String email = userRepository.findById(registration.getUserId())
            .map(u -> u.getEmail())
            .orElse(null);
        CheckInBroadcast broadcast = new CheckInBroadcast(
            registration.getId(),
            registration.getEventId(),
            name,
            email,
            registration.getSeatNumber() != null ? String.valueOf(registration.getSeatNumber()) : null,
            registration.getCheckedInAt(),
            "CHECK_IN"
        );
        messagingTemplate.convertAndSend(
            "/topic/checkins/" + registration.getEventId(),
            broadcast
        );
    }
}
