package com.eventmanagement.controller;

import com.eventmanagement.dto.AuthResponse;
import com.eventmanagement.dto.AuthUser;
import com.eventmanagement.dto.ProfileUpdateRequest;
import com.eventmanagement.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@Tag(name = "Auth", description = "Authentication, session management, and user profile")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Exchange Supabase JWT for app session", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/auth/supabase")
    public ResponseEntity<AuthResponse> handleSupabaseAuth(
        @RequestHeader("Authorization") String authHeader,
        @RequestHeader(value = "X-Desired-Role", required = false) String desiredRole
    ) {
        AuthResponse response = authService.handleSupabaseAuth(authHeader, desiredRole);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get current authenticated user", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/auth/user")
    public AuthUser getCurrentUser(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return authService.getCurrentUser(authHeader);
    }

    @Operation(summary = "Logout / invalidate session", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        authService.logout(authHeader);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update user profile", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/users/profile")
    public AuthUser updateProfile(
        @RequestBody ProfileUpdateRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return authService.updateProfile(request, authHeader);
    }
}
