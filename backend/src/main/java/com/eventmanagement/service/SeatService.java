package com.eventmanagement.service;

import com.eventmanagement.dto.SeatAvailability;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.Registration;
import com.eventmanagement.repository.RegistrationRepository;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SeatService {
    private static final List<String> CONFIRMED_STATUSES = Arrays.asList("CONFIRMED", "CHECKED_IN");
    private final RegistrationRepository registrationRepository;

    public SeatService(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    public List<String> confirmedStatuses() {
        return CONFIRMED_STATUSES;
    }

    public SeatAvailability buildSeatAvailability(Event event) {
        Integer capacity = event.getCapacity();
        if (capacity == null || capacity <= 0) {
            return new SeatAvailability(event.getId(), 0, 0, Arrays.asList());
        }
        List<Registration> confirmedRegistrations = registrationRepository.findByEventIdAndStatusIn(
            event.getId(),
            CONFIRMED_STATUSES
        );
        Set<Integer> takenSeatSet = resolveTakenSeats(confirmedRegistrations, capacity);
        List<Integer> takenSeats = takenSeatSet.stream()
            .sorted()
            .toList();
        long reservedSeats = Math.max(takenSeatSet.size(), confirmedRegistrations.size());
        long available = Math.max(0, capacity - reservedSeats);
        return new SeatAvailability(event.getId(), capacity, available, takenSeats);
    }

    public Integer resolveSeatNumber(Integer requestedSeat, int capacity, Set<Integer> takenSeats) {
        if (requestedSeat != null) {
            return requestedSeat;
        }
        for (int seat = 1; seat <= capacity; seat++) {
            if (!takenSeats.contains(seat)) {
                return seat;
            }
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT, "No available seats remain.");
    }

    public Set<Integer> resolveTakenSeats(List<Registration> confirmedRegistrations, Integer capacity) {
        Set<Integer> takenSeats = confirmedRegistrations.stream()
            .map(Registration::getSeatNumber)
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(TreeSet::new));
        if (capacity == null || capacity <= 0) {
            return takenSeats;
        }
        int nextSeat = 1;
        for (Registration registration : confirmedRegistrations) {
            if (registration.getSeatNumber() != null) {
                continue;
            }
            while (nextSeat <= capacity && takenSeats.contains(nextSeat)) {
                nextSeat++;
            }
            if (nextSeat > capacity) {
                break;
            }
            takenSeats.add(nextSeat);
            nextSeat++;
        }
        return takenSeats;
    }
}
