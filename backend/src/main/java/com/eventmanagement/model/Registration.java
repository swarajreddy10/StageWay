package com.eventmanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "registrations")
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "event_id", nullable = false)
    private Long eventId;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(nullable = false, length = 20)
    private String status;
    @Column(name = "seat_number")
    private Integer seatNumber;
    @Column(name = "attendee_name")
    private String attendeeName;
    @Column(name = "attendee_email")
    private String attendeeEmail;
    @Column(name = "checked_in_at")
    private OffsetDateTime checkedInAt;
    @Column(name = "checked_in_by")
    private Long checkedInBy;
    @Column(name = "waitlist_position")
    private Integer waitlistPosition;
    @Version
    @Column(name = "version", nullable = false)
    private Integer version;
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Registration() {}

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Long getEventId() {
        return eventId;
    }
    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }
    public Long getUserId() {
        return userId;
    }
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public Integer getSeatNumber() {
        return seatNumber;
    }
    public void setSeatNumber(Integer seatNumber) {
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
    public OffsetDateTime getCheckedInAt() {
        return checkedInAt;
    }
    public void setCheckedInAt(OffsetDateTime checkedInAt) {
        this.checkedInAt = checkedInAt;
    }
    public Long getCheckedInBy() {
        return checkedInBy;
    }
    public void setCheckedInBy(Long checkedInBy) {
        this.checkedInBy = checkedInBy;
    }
    public Integer getWaitlistPosition() {
        return waitlistPosition;
    }
    public void setWaitlistPosition(Integer waitlistPosition) {
        this.waitlistPosition = waitlistPosition;
    }
    public Integer getVersion() {
        return version;
    }
    public void setVersion(Integer version) {
        this.version = version;
    }
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
