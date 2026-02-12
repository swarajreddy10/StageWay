package com.eventmanagement.service;

import com.eventmanagement.dto.RegistrationUpdate;
import com.eventmanagement.model.Event;
import com.eventmanagement.repository.RegistrationRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class RegistrationUpdatePublisher {
    private final RegistrationRepository registrationRepository;
    private final SeatService seatService;
    private final SimpMessagingTemplate messagingTemplate;

    public RegistrationUpdatePublisher(
        RegistrationRepository registrationRepository,
        SeatService seatService,
        SimpMessagingTemplate messagingTemplate
    ) {
        this.registrationRepository = registrationRepository;
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
}
