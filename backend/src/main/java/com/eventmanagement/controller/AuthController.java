package com.eventmanagement.controller;

import com.eventmanagement.dto.AuthResponse;
import com.eventmanagement.dto.AuthRoleRequest;
import com.eventmanagement.dto.AuthUser;
import com.eventmanagement.dto.GoogleAuthRequest;
import com.eventmanagement.dto.LoginRequest;
import com.eventmanagement.dto.ProfileUpdateRequest;
import com.eventmanagement.dto.RegisterRequest;
import com.eventmanagement.service.AuthService;
import com.eventmanagement.service.OAuthStateService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
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
    private final OAuthStateService oauthStateService;
    private final String sessionCookieName;
    private final String oauthStateCookieName;
    private final boolean secureCookies;

    public AuthController(
        AuthService authService,
        OAuthStateService oauthStateService,
        @Value("${app.security.session-cookie-name:stageway.session}") String sessionCookieName,
        @Value("${app.security.oauth-state-cookie-name:stageway.oauth}") String oauthStateCookieName,
        @Value("${app.security.secure-cookies:false}") boolean secureCookies
    ) {
        this.authService = authService;
        this.oauthStateService = oauthStateService;
        this.sessionCookieName = sessionCookieName;
        this.oauthStateCookieName = oauthStateCookieName;
        this.secureCookies = secureCookies;
    }

    @PostMapping("/auth/oauth/start")
    public ResponseEntity<Void> startOAuth(@RequestBody(required = false) @Valid AuthRoleRequest request) {
        String rawRole = request != null ? request.role() : null;
        if (rawRole == null || rawRole.isBlank()) {
            ResponseCookie clearCookie = clearCookie(oauthStateCookieName);
            return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .build();
        }
        String desiredRole = authService.normalizeDesiredRole(rawRole);
        String stateId = oauthStateService.createState(desiredRole);

        if (stateId == null) {
            ResponseCookie clearCookie = clearCookie(oauthStateCookieName);
            return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .build();
        }

        ResponseCookie stateCookie = ResponseCookie.from(oauthStateCookieName, stateId)
            .httpOnly(true)
            .secure(secureCookies)
            .sameSite("Lax")
            .path("/")
            .maxAge(oauthStateService.getStateTtl())
            .build();

        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, stateCookie.toString())
            .build();
    }

    @PostMapping("/auth/supabase")
    public ResponseEntity<AuthResponse> handleSupabaseAuth(
        @RequestHeader("Authorization") String authHeader,
        @RequestHeader(value = "X-Desired-Role", required = false) String desiredRole,
        HttpServletRequest request
    ) {
        String stateId = resolveCookieValue(request, oauthStateCookieName);
        String roleFromState = oauthStateService.consumeState(stateId);
        String roleToUse = roleFromState != null ? roleFromState : desiredRole;
        AuthResponse response = authService.handleSupabaseAuth(authHeader, roleToUse);
        return withSessionCookie(response, stateId != null);
    }

    @PostMapping("/auth/google")
    public ResponseEntity<String> handleGoogleAuth(@RequestBody GoogleAuthRequest request) {
        return ResponseEntity.status(HttpStatus.GONE).body("Use Supabase Auth instead");
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> handleCredentialsLogin(@RequestBody @Valid LoginRequest request) {
        AuthResponse response = authService.handleCredentialsLogin(request);
        return withSessionCookie(response, false);
    }

    @PostMapping({"/register", "/auth/register"})
    public ResponseEntity<AuthResponse> registerUser(@RequestBody @Valid RegisterRequest request) {
        AuthResponse response = authService.registerUser(request);
        return withSessionCookie(response, false);
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
        ResponseCookie clearCookie = clearCookie(sessionCookieName);
        return ResponseEntity.noContent()
            .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
            .build();
    }

    @PutMapping("/users/profile")
    public AuthUser updateProfile(
        @RequestBody ProfileUpdateRequest request,
        @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        return authService.updateProfile(request, authHeader);
    }

    private ResponseEntity<AuthResponse> withSessionCookie(AuthResponse response, boolean clearOauthState) {
        ResponseCookie sessionCookie = ResponseCookie.from(sessionCookieName, response.token())
            .httpOnly(true)
            .secure(secureCookies)
            .sameSite("Lax")
            .path("/")
            .maxAge(Duration.ofSeconds(response.expiresIn()))
            .build();
        ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE, sessionCookie.toString());
        if (clearOauthState) {
            builder.header(HttpHeaders.SET_COOKIE, clearCookie(oauthStateCookieName).toString());
        }
        return builder.body(response);
    }

    private ResponseCookie clearCookie(String name) {
        return ResponseCookie.from(name, "")
            .httpOnly(true)
            .secure(secureCookies)
            .sameSite("Lax")
            .path("/")
            .maxAge(Duration.ZERO)
            .build();
    }

    private String resolveCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
