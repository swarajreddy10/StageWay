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
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "User role management and host access request review")
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

    @Operation(summary = "Update a user's role", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public AuthUser updateUserRole(
        @PathVariable Long id,
        @RequestBody @Valid RoleUpdateRequest request
    ) {
        User user = authService.updateUserRole(id, request.role());
        return authService.buildAuthUser(user);
    }

    @Operation(summary = "List host access requests", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/host-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public List<HostAccessRequestAdminResponse> listHostRequests(
        @RequestParam(value = "status", required = false) String status
    ) {
        return hostAccessRequestService.listRequests(status);
    }

    @Operation(summary = "Approve or reject a host access request",
        security = @SecurityRequirement(name = "bearerAuth"))
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
