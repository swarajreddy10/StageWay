package com.eventmanagement.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ManualCheckInRequest {
    @NotNull(message = "Registration id is required.")
    private Long registrationId;
    @Size(max = 500, message = "Notes must be at most 500 characters.")
    private String notes;

    public Long getRegistrationId() {
        return registrationId;
    }
    public void setRegistrationId(Long registrationId) {
        this.registrationId = registrationId;
    }
    public String getNotes() {
        return notes;
    }
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
