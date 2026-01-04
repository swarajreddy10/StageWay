package com.eventmanagement.dto;

public record CheckInResult(
    boolean success,
    String message,
    CheckInInfo checkIn,
    RegistrationResponse registration
) {}
