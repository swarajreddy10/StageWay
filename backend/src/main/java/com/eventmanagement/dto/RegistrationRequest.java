package com.eventmanagement.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegistrationRequest {
    @NotNull(message = "Event id is required.")
    private Long eventId;
    @Pattern(regexp = "\\d+", message = "Seat number must be numeric.")
    private String seatNumber;
    @Size(max = 200, message = "Attendee name must be at most 200 characters.")
    private String attendeeName;
    @Email(message = "Attendee email must be valid.")
    @Size(max = 255, message = "Attendee email must be at most 255 characters.")
    private String attendeeEmail;

    public Long getEventId() {
        return eventId;
    }
    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }
    public String getSeatNumber() {
        return seatNumber;
    }
    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }
    public String getAttendeeName() {
        return attendeeName;
    }
    public void setAttendeeName(String attendeeName) {
        this.attendeeName = attendeeName;
    }
    public String getAttendeeEmail() {
        return attendeeEmail;
    }
    public void setAttendeeEmail(String attendeeEmail) {
        this.attendeeEmail = attendeeEmail;
    }
}
