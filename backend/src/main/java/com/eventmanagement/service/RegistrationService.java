package com.eventmanagement.service;

import com.eventmanagement.dto.AttendeeSummary;
import com.eventmanagement.dto.CheckInInfo;
import com.eventmanagement.dto.CheckInPayload;
import com.eventmanagement.dto.CheckInRequest;
import com.eventmanagement.dto.CheckInResult;
import com.eventmanagement.dto.ManualCheckInRequest;
import com.eventmanagement.dto.RegistrationEventSummary;
import com.eventmanagement.dto.RegistrationRequest;
import com.eventmanagement.dto.RegistrationResponse;
import com.eventmanagement.dto.RegistrationUpdate;
import com.eventmanagement.dto.SeatAvailability;
import com.eventmanagement.dto.WaitlistRequest;
import com.eventmanagement.dto.WaitlistResponse;
import com.eventmanagement.model.Event;
import com.eventmanagement.model.Registration;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.RegistrationRepository;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.util.EventFormatter;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import jakarta.servlet.http.HttpServletRequest;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Value;

@Service
public class RegistrationService {
    private static final Pattern SIGNED_QR_PATTERN = Pattern.compile("^REG-(\\d+)\\.(\\d+)\\.([A-Za-z0-9_-]+)$");
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final AuthService authService;
    private final SeatService seatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final String qrSecret;
    private final Duration qrTtl;

    public RegistrationService(
        EventRepository eventRepository,
        UserRepository userRepository,
        RegistrationRepository registrationRepository,
        AuthService authService,
        SeatService seatService,
        SimpMessagingTemplate messagingTemplate,
        @Value("${app.qr.secret}") String qrSecret,
        @Value("${app.qr.ttl:PT48H}") Duration qrTtl
    ) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.registrationRepository = registrationRepository;
        this.authService = authService;
        this.seatService = seatService;
        this.messagingTemplate = messagingTemplate;
        this.qrSecret = qrSecret;
        this.qrTtl = qrTtl == null ? Duration.ofHours(48) : qrTtl;
    }

    @Transactional
    public RegistrationResponse registerForEvent(
        RegistrationRequest request,
        String authHeader,
        HttpServletRequest httpRequest
    ) {
        Long userId = authService.validateAuth(authHeader);
        Long eventId = request.getEventId();
        if (eventId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event id is required.");
        }
        Event event = eventRepository.findByIdForUpdate(eventId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        User attendee = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

        if (event.getOrganizationId() != null && event.getOrganizationId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Hosts cannot register for their own event.");
        }

        Registration existing = registrationRepository.findByEventIdAndUserId(eventId, userId);
        if (existing != null) {
            return buildRegistrationResponse(existing, event);
        }

        Integer capacity = event.getCapacity();
        boolean hasCapacity = capacity != null && capacity > 0;
        Integer requestedSeat = parseSeatNumber(request.getSeatNumber());

        if (requestedSeat != null && !hasCapacity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seat selection is not available yet.");
        }
        if (requestedSeat != null && (requestedSeat < 1 || requestedSeat > capacity)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Selected seat is out of range.");
        }

        List<Registration> confirmedRegistrations = hasCapacity
            ? registrationRepository.findByEventIdAndStatusIn(eventId, seatService.confirmedStatuses())
            : Arrays.asList();
        Set<Integer> takenSeats = seatService.resolveTakenSeats(confirmedRegistrations, capacity);
        long confirmedCount = confirmedRegistrations.size();
        boolean isFull = hasCapacity && confirmedCount >= capacity;

        if (requestedSeat != null && takenSeats.contains(requestedSeat)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Selected seat is already taken.");
        }

        Registration registration = new Registration();
        registration.setEventId(eventId);
        registration.setUserId(userId);
        registration.setAttendeeName(request.getAttendeeName() != null ? request.getAttendeeName() : attendee.getFullName());
        registration.setAttendeeEmail(request.getAttendeeEmail() != null ? request.getAttendeeEmail() : attendee.getEmail());
        if (!hasCapacity) {
            registration.setStatus("CONFIRMED");
        } else if (isFull) {
            registration.setStatus("WAITLISTED");
        } else {
            registration.setStatus("CONFIRMED");
            Integer assignedSeat = seatService.resolveSeatNumber(requestedSeat, capacity, takenSeats);
            registration.setSeatNumber(assignedSeat);
        }

        if ("WAITLISTED".equalsIgnoreCase(registration.getStatus())) {
            registration.setWaitlistPosition(nextWaitlistPosition(eventId));
        }

        Registration saved;
        try {
            saved = registrationRepository.save(registration);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Selected seat is already taken.");
        }
        publishRegistrationUpdate(event);
        return buildRegistrationResponse(saved, event);
    }

    public List<RegistrationResponse> getRegistrations(String authHeader, HttpServletRequest httpRequest) {
        Long userId = authService.validateAuth(authHeader);
        List<Registration> registrations = registrationRepository.findByUserId(userId);
        Map<Long, Event> eventMap = eventRepository.findAllById(
            registrations.stream()
                .map(Registration::getEventId)
                .filter(Objects::nonNull)
                .distinct()
                .toList()
        ).stream().collect(Collectors.toMap(Event::getId, event -> event));

        return registrations.stream()
            .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
            .map(registration -> buildRegistrationResponse(
                registration,
                eventMap.get(registration.getEventId())
            ))
            .toList();
    }

    public List<Registration> getMyRegistrationsRaw(String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        return registrationRepository.findByUserId(userId);
    }

    public RegistrationResponse getRegistration(
        Long id,
        String authHeader,
        HttpServletRequest httpRequest
    ) {
        Long userId = authService.validateAuth(authHeader);
        Registration registration = registrationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found."));
        if (!registration.getUserId().equals(userId) && !authService.isOrganizer(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }
        Event event = eventRepository.findById(registration.getEventId()).orElse(null);
        return buildRegistrationResponse(registration, event);
    }

    public void cancelRegistration(Long id, String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        Registration registration = registrationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found."));
        if (!registration.getUserId().equals(userId) && !authService.isOrganizer(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied.");
        }

        registration.setStatus("CANCELLED");
        Registration saved = registrationRepository.save(registration);
        eventRepository.findById(saved.getEventId()).ifPresent(this::publishRegistrationUpdate);
    }

    public Registration checkInById(Long id, String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        authService.requireOrganizer(userId);
        Registration registration = registrationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found."));
        String status = registration.getStatus();
        if (registration.getCheckedInAt() != null
            || (status != null && status.equalsIgnoreCase("CHECKED_IN"))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Attendee already checked in.");
        }
        registration.setCheckedInAt(OffsetDateTime.now(ZoneOffset.UTC));
        registration.setCheckedInBy(userId);
        registration.setStatus("CHECKED_IN");
        Registration saved = registrationRepository.save(registration);
        eventRepository.findById(saved.getEventId()).ifPresent(this::publishRegistrationUpdate);
        return saved;
    }

    public Registration checkInByQr(CheckInRequest request, String authHeader) {
        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR code is required.");
        }
        Long registrationId = extractRegistrationId(request.getCode());
        if (registrationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid QR code.");
        }
        return checkInById(registrationId, authHeader);
    }

    public CheckInResult checkInByQrData(
        CheckInPayload request,
        String authHeader,
        HttpServletRequest httpRequest
    ) {
        Long userId = authService.validateAuth(authHeader);
        if (request.getQrData() == null || request.getQrData().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR data is required.");
        }
        Long registrationId = extractRegistrationId(request.getQrData());
        if (registrationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid QR data.");
        }

        Registration registration = checkInById(registrationId, authHeader);
        Event event = eventRepository.findById(registration.getEventId()).orElse(null);
        RegistrationResponse registrationResponse = buildRegistrationResponse(registration, event);
        CheckInInfo checkInInfo = new CheckInInfo(
            registration.getId(),
            registration.getId(),
            registration.getCheckedInAt(),
            "QR_CODE",
            userId,
            null
        );
        return new CheckInResult(true, "Check-in successful.", checkInInfo, registrationResponse);
    }

    public CheckInResult checkInManually(
        ManualCheckInRequest request,
        String authHeader,
        HttpServletRequest httpRequest
    ) {
        Long userId = authService.validateAuth(authHeader);
        if (request.getRegistrationId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration id is required.");
        }

        Registration registration = checkInById(request.getRegistrationId(), authHeader);
        Event event = eventRepository.findById(registration.getEventId()).orElse(null);
        RegistrationResponse registrationResponse = buildRegistrationResponse(registration, event);
        CheckInInfo checkInInfo = new CheckInInfo(
            registration.getId(),
            registration.getId(),
            registration.getCheckedInAt(),
            "MANUAL",
            userId,
            request.getNotes()
        );
        return new CheckInResult(true, "Manual check-in successful.", checkInInfo, registrationResponse);
    }

    public byte[] getRegistrationQr(Long id, String authHeader) {
        if (authHeader != null && !authHeader.isBlank()) {
            authService.validateAuth(authHeader);
        }
        registrationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found."));
        String payload = buildSignedQrPayload(id);
        try {
            return buildQrPng(payload);
        } catch (IOException | WriterException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "QR generation failed.");
        }
    }

    @Transactional
    public WaitlistResponse joinWaitlist(WaitlistRequest request, String authHeader) {
        if (request.getEventId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event id is required.");
        }
        User attendee = resolveWaitlistUser(authHeader);
        Event event = eventRepository.findByIdForUpdate(request.getEventId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        if (attendee.getId() != null
            && event.getOrganizationId() != null
            && event.getOrganizationId().equals(attendee.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Hosts cannot join the waitlist for their own event.");
        }

        Registration existing = registrationRepository.findByEventIdAndUserId(event.getId(), attendee.getId());
        if (existing != null) {
            if (!"WAITLISTED".equalsIgnoreCase(existing.getStatus())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already registered for this event.");
            }
            return buildWaitlistResponse(existing, event);
        }

        long position = nextWaitlistPosition(event.getId());

        Registration registration = new Registration();
        registration.setEventId(event.getId());
        registration.setUserId(attendee.getId());
        registration.setStatus("WAITLISTED");
        registration.setWaitlistPosition((int) position);
        Registration saved = registrationRepository.save(registration);
        publishRegistrationUpdate(event);

        return buildWaitlistResponse(saved, event, position);
    }

    public List<AttendeeSummary> getEventAttendees(Long id, String authHeader) {
        Long userId = authService.validateAuth(authHeader);
        User organizer = authService.requireOrganizer(userId);
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));
        requireEventOwnership(organizer, event);

        List<Registration> registrations = registrationRepository.findByEventId(id);
        Map<Long, User> userMap = userRepository.findAllById(
            registrations.stream()
                .map(Registration::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList()
        ).stream().collect(Collectors.toMap(User::getId, user -> user));

        return registrations.stream()
            .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
            .map(registration -> {
                User user = userMap.get(registration.getUserId());
                String fullName = registration.getAttendeeName() != null ? registration.getAttendeeName() : (user != null ? user.getFullName() : "Unknown attendee");
                String email = registration.getAttendeeEmail() != null ? registration.getAttendeeEmail() : (user != null ? user.getEmail() : "unknown@example.com");
                return new AttendeeSummary(
                    registration.getId(),
                    registration.getUserId(),
                    fullName,
                    email,
                    registration.getStatus(),
                    registration.getSeatNumber(),
                    registration.getCreatedAt(),
                    registration.getCheckedInAt()
                );
            })
            .toList();
    }

    public SeatAvailability getSeatAvailability(Long eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));
        return seatService.buildSeatAvailability(event);
    }

    private Integer parseSeatNumber(String seatNumber) {
        if (seatNumber == null || seatNumber.isBlank()) {
            return null;
        }
        try {
            int value = Integer.parseInt(seatNumber.trim());
            if (value <= 0) {
                throw new NumberFormatException("Seat number must be positive.");
            }
            return value;
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seat number must be numeric.");
        }
    }

    private Long extractRegistrationId(String code) {
        if (code == null) {
            return null;
        }
        String trimmed = code.trim();
        Matcher matcher = SIGNED_QR_PATTERN.matcher(trimmed);
        if (!matcher.matches()) {
            return null;
        }

        Long registrationId;
        long expiresAt;
        try {
            registrationId = Long.parseLong(matcher.group(1));
            expiresAt = Long.parseLong(matcher.group(2));
        } catch (NumberFormatException ex) {
            return null;
        }

        long now = Instant.now().getEpochSecond();
        if (expiresAt < now) {
            return null;
        }

        String payload = "REG-" + registrationId + "." + expiresAt;
        String signature = matcher.group(3);
        if (!isSignatureValid(payload, signature)) {
            return null;
        }

        return registrationId;
    }

    private RegistrationResponse buildRegistrationResponse(
        Registration registration,
        Event event
    ) {
        RegistrationEventSummary summary = EventFormatter.toRegistrationSummary(event);
        OffsetDateTime cancelledAt = "CANCELLED".equalsIgnoreCase(registration.getStatus())
            ? registration.getUpdatedAt()
            : null;
        return new RegistrationResponse(
            registration.getId(),
            registration.getEventId(),
            registration.getUserId(),
            registration.getSeatNumber(),
            registration.getStatus(),
            buildSignedQrPayload(registration.getId()),
            registration.getCreatedAt(),
            cancelledAt,
            null,
            summary,
            registration.getCreatedAt(),
            registration.getUpdatedAt(),
            registration.getCheckedInAt(),
            registration.getCheckedInBy()
        );
    }

    private String buildSignedQrPayload(Long registrationId) {
        long expiresAt = Instant.now().plus(qrTtl).getEpochSecond();
        String payload = "REG-" + registrationId + "." + expiresAt;
        String signature = signPayload(payload);
        return payload + "." + signature;
    }

    private String signPayload(String payload) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(qrSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("QR signing failed.", ex);
        }
    }

    private boolean isSignatureValid(String payload, String signature) {
        String expected = signPayload(payload);
        return MessageDigest.isEqual(
            expected.getBytes(StandardCharsets.UTF_8),
            signature.getBytes(StandardCharsets.UTF_8)
        );
    }

    private WaitlistResponse buildWaitlistResponse(Registration registration, Event event) {
        Integer storedPosition = registration.getWaitlistPosition();
        long position = storedPosition != null
            ? storedPosition
            : registrationRepository.countByEventIdAndStatusIn(
                event.getId(),
                Arrays.asList("WAITLISTED")
            );
        return buildWaitlistResponse(registration, event, position);
    }

    private WaitlistResponse buildWaitlistResponse(Registration registration, Event event, long position) {
        return new WaitlistResponse(
            registration.getId(),
            registration.getEventId(),
            registration.getUserId(),
            position,
            registration.getCreatedAt(),
            null,
            null,
            "WAITING",
            EventFormatter.toWaitlistSummary(event)
        );
    }

    private int nextWaitlistPosition(Long eventId) {
        Integer maxPosition = registrationRepository.findMaxWaitlistPosition(eventId);
        if (maxPosition == null) {
            long waitlistCount = registrationRepository.countByEventIdAndStatusIn(
                eventId,
                Arrays.asList("WAITLISTED")
            );
            return (int) waitlistCount + 1;
        }
        return maxPosition + 1;
    }

    private User resolveWaitlistUser(String authHeader) {
        Long userId = authService.validateOptionalAuth(authHeader);
        if (userId != null) {
            return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        }
        return authService.createGuestUser();
    }

    private void requireEventOwnership(User organizer, Event event) {
        String role = organizer.getRole() != null ? organizer.getRole().toUpperCase() : "ATTENDEE";
        if ("ADMIN".equals(role)) {
            return;
        }
        if (event.getOrganizationId() != null
            && !event.getOrganizationId().equals(organizer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Organizer does not own this event.");
        }
    }

    private void publishRegistrationUpdate(Event event) {
        if (event.getId() == null) {
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

    private byte[] buildQrPng(String value) throws WriterException, IOException {
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(value, BarcodeFormat.QR_CODE, 400, 400);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(matrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }
}
