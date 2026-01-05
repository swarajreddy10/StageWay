package com.eventmanagement.controller;

import com.eventmanagement.dto.AuthResponse;
import com.eventmanagement.dto.AuthRoleRequest;
import com.eventmanagement.dto.AuthUser;
import com.eventmanagement.dto.GoogleAuthRequest;
import com.eventmanagement.dto.LoginRequest;
import com.eventmanagement.dto.ProfileUpdateRequest;
import com.eventmanagement.dto.RegisterRequest;
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

    @PostMapping("/auth/oauth/start")
    public ResponseEntity<Void> startOAuth(@RequestBody(required = false) @Valid AuthRoleRequest request) {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth/supabase")
    public ResponseEntity<AuthResponse> handleSupabaseAuth(
        @RequestHeader("Authorization") String authHeader,
        @RequestHeader(value = "X-Desired-Role", required = false) String desiredRole
    ) {
        AuthResponse response = authService.handleSupabaseAuth(authHeader, desiredRole);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/google")
    public ResponseEntity<String> handleGoogleAuth(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.status(HttpStatus.GONE).body("Use Supabase Auth instead");
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> handleCredentialsLogin(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.status(HttpStatus.GONE).build();
    }

    @PostMapping({"/register", "/auth/register"})
    public ResponseEntity<AuthResponse> registerUser(@RequestBody @Valid RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.GONE).build();
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
