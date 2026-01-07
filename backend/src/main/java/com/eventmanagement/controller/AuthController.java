package com.eventmanagement.controller;

import com.eventmanagement.dto.AuthResponse;
import com.eventmanagement.dto.AuthUser;
import com.eventmanagement.dto.ProfileUpdateRequest;
import com.eventmanagement.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/supabase")
    public ResponseEntity<AuthResponse> handleSupabaseAuth(
        @RequestHeader("Authorization") String authHeader,
        @RequestHeader(value = "X-Desired-Role", required = false) String desiredRole
    ) {
        AuthResponse response = authService.handleSupabaseAuth(authHeader, desiredRole);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/auth/user")
    public AuthUser getCurrentUser(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return authService.getCurrentUser(authHeader);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        authService.logout(authHeader);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/profile")
    public AuthUser updateProfile(
        @RequestBody ProfileUpdateRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return authService.updateProfile(request, authHeader);
    }
}
