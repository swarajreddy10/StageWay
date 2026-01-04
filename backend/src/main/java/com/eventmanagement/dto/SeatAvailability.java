package com.eventmanagement.dto;

import java.util.List;

public record SeatAvailability(
    Long eventId,
    Integer capacity,
    long availableSeats,
    List<Integer> takenSeats
) {}
