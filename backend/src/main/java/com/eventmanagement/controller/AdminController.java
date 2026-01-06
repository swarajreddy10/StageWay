package com.eventmanagement.controller;

import com.eventmanagement.dto.AuthUser;
import com.eventmanagement.dto.HostAccessRequestAdminResponse;
import com.eventmanagement.dto.HostAccessRequestDecisionRequest;
import com.eventmanagement.dto.RoleUpdateRequest;
import com.eventmanagement.model.User;
import com.eventmanagement.service.AuthService;
import com.eventmanagement.service.HostAccessRequestService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AuthService authService;
    private final HostAccessRequestService hostAccessRequestService;

    public AdminController(
        AuthService authService,
        HostAccessRequestService hostAccessRequestService
    ) {
        this.authService = authService;
        this.hostAccessRequestService = hostAccessRequestService;
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public AuthUser updateUserRole(
        @PathVariable Long id,
        @RequestBody @Valid RoleUpdateRequest request
    ) {
        User user = authService.updateUserRole(id, request.role());
        return authService.buildAuthUser(user);
    }

    @GetMapping("/host-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public List<HostAccessRequestAdminResponse> listHostRequests(
        @RequestParam(value = "status", required = false) String status
    ) {
        return hostAccessRequestService.listRequests(status);
    }

    @PutMapping("/host-requests/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public HostAccessRequestAdminResponse reviewHostRequest(
        @PathVariable Long id,
        @RequestBody @Valid HostAccessRequestDecisionRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long adminUserId = authService.validateAuth(authHeader);
        return hostAccessRequestService.reviewRequest(id, request.status(), adminUserId);
    }
}
