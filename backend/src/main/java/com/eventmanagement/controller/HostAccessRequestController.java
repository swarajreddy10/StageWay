package com.eventmanagement.controller;

import com.eventmanagement.dto.HostAccessRequestCreateRequest;
import com.eventmanagement.dto.HostAccessRequestResponse;
import com.eventmanagement.service.AuthService;
import com.eventmanagement.service.HostAccessRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/host-requests")
public class HostAccessRequestController {
    private final HostAccessRequestService hostAccessRequestService;
    private final AuthService authService;

    public HostAccessRequestController(
        HostAccessRequestService hostAccessRequestService,
        AuthService authService
    ) {
        this.hostAccessRequestService = hostAccessRequestService;
        this.authService = authService;
    }

    @PostMapping
    public HostAccessRequestResponse createRequest(
        @RequestBody(required = false) HostAccessRequestCreateRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = authService.validateAuth(authHeader);
        String note = request != null ? request.note() : null;
        return hostAccessRequestService.createRequest(userId, note);
    }

    @GetMapping("/me")
    public ResponseEntity<HostAccessRequestResponse> getMyRequest(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = authService.validateAuth(authHeader);
        HostAccessRequestResponse response = hostAccessRequestService.getLatestRequest(userId);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }
}
