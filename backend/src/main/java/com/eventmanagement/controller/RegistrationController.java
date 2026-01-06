package com.eventmanagement.controller;

import com.eventmanagement.dto.CheckInPayload;
import com.eventmanagement.dto.CheckInRequest;
import com.eventmanagement.dto.CheckInResult;
import com.eventmanagement.dto.ManualCheckInRequest;
import com.eventmanagement.dto.RegistrationRequest;
import com.eventmanagement.dto.RegistrationResponse;
import com.eventmanagement.dto.WaitlistRequest;
import com.eventmanagement.dto.WaitlistResponse;
import com.eventmanagement.model.Registration;
import com.eventmanagement.service.RegistrationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class RegistrationController {
    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/registrations")
    public RegistrationResponse registerForEvent(
        @RequestBody @Valid RegistrationRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        HttpServletRequest httpRequest
    ) {
        return registrationService.registerForEvent(request, authHeader, httpRequest);
    }

    @GetMapping("/registrations")
    public List<RegistrationResponse> getRegistrations(
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        HttpServletRequest httpRequest
    ) {
        return registrationService.getRegistrations(authHeader, httpRequest);
    }

    @GetMapping("/registrations/me")
    public List<Registration> getMyRegistrations(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return registrationService.getMyRegistrationsRaw(authHeader);
    }

    @GetMapping("/registrations/{id}")
    public RegistrationResponse getRegistration(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        HttpServletRequest httpRequest
    ) {
        return registrationService.getRegistration(id, authHeader, httpRequest);
    }

    @DeleteMapping("/registrations/{id}")
    public ResponseEntity<Void> cancelRegistration(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        registrationService.cancelRegistration(id, authHeader);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/registrations/{id}/check-in")
    @PreAuthorize("hasRole('HOST')")
    public Registration checkInById(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return registrationService.checkInById(id, authHeader);
    }

    @PostMapping("/registrations/check-in")
    @PreAuthorize("hasRole('HOST')")
    public Registration checkInByQr(
        @RequestBody @Valid CheckInRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return registrationService.checkInByQr(request, authHeader);
    }

    @GetMapping("/registrations/{id}/qr")
    public ResponseEntity<byte[]> getRegistrationQr(
        @PathVariable Long id,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        byte[] png = registrationService.getRegistrationQr(id, authHeader);
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(png);
    }

    @PostMapping("/checkins")
    @PreAuthorize("hasRole('HOST')")
    public CheckInResult checkInByQrData(
        @RequestBody @Valid CheckInPayload request,
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        HttpServletRequest httpRequest
    ) {
        return registrationService.checkInByQrData(request, authHeader, httpRequest);
    }

    @PostMapping("/checkins/manual")
    @PreAuthorize("hasRole('HOST')")
    public CheckInResult checkInManually(
        @RequestBody @Valid ManualCheckInRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader,
        HttpServletRequest httpRequest
    ) {
        return registrationService.checkInManually(request, authHeader, httpRequest);
    }

    @PostMapping("/waitlist")
    public WaitlistResponse joinWaitlist(
        @RequestBody @Valid WaitlistRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return registrationService.joinWaitlist(request, authHeader);
    }
}
