package com.eventmanagement.service;

import com.eventmanagement.dto.AuthResponse;
import com.eventmanagement.dto.AuthUser;
import com.eventmanagement.dto.LoginRequest;
import com.eventmanagement.dto.ProfileUpdateRequest;
import com.eventmanagement.dto.RegisterRequest;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.UserRepository;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final SupabaseAuthService supabaseAuthService;
    private final SessionService sessionService;
    private final PasswordEncoder passwordEncoder;
    private final boolean allowLocalTokens;

    public AuthService(
        UserRepository userRepository,
        SupabaseAuthService supabaseAuthService,
        PasswordEncoder passwordEncoder,
        SessionService sessionService,
        @org.springframework.beans.factory.annotation.Value("${app.security.allow-local-tokens:false}")
        boolean allowLocalTokens
    ) {
        this.userRepository = userRepository;
        this.supabaseAuthService = supabaseAuthService;
        this.passwordEncoder = passwordEncoder;
        this.sessionService = sessionService;
        this.allowLocalTokens = allowLocalTokens;
    }

    public AuthResponse handleSupabaseAuth(String authHeader, String desiredRole) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            SupabaseAuthService.SupabaseUser supabaseUser = supabaseAuthService.verifyToken(token);
            String requestedRole = resolveDesiredRole(desiredRole);
            if (desiredRole == null || desiredRole.isBlank()) {
                requestedRole = resolveDesiredRole(supabaseUser.role());
            }

            User user = userRepository.findByEmail(supabaseUser.email());
            if (user == null) {
                user = new User();
                user.setEmail(supabaseUser.email());
                user.setFullName(supabaseUser.name());
                user.setRole(requestedRole);
                user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                user = userRepository.save(user);
            } else {
                String currentRole = normalizeStoredRole(user.getRole());
                if (shouldUpgradeRole(currentRole, requestedRole)) {
                    log.info("Upgraded role for userId={} from {} to {}", user.getId(), currentRole, requestedRole);
                    user.setRole(requestedRole);
                    user = userRepository.save(user);
                }
            }

            AuthUser authUser = buildAuthUser(user);
            String sessionToken = sessionService.createSession(user.getId());
            return new AuthResponse(sessionToken, "Bearer", 3600, authUser);
        } catch (ResponseStatusException e) {
            log.warn("Supabase auth failed: {}", e.getReason());
            throw e;
        } catch (Exception e) {
            log.error("Supabase auth unexpected failure", e);
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication failed: " + e.getMessage()
            );
        }
    }

    public AuthResponse handleCredentialsLogin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null || user.getPasswordHash() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password. Please check your credentials and try again.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password. Please check your credentials and try again.");
        }

        AuthUser authUser = buildAuthUser(user);
        String sessionToken = sessionService.createSession(user.getId());
        return new AuthResponse(sessionToken, "Bearer", 3600, authUser);
    }

    public AuthResponse registerUser(RegisterRequest request) {
        User existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "An account with this email already exists. Please sign in or use a different email.");
        }

        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name is required.");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(resolveRole(request.getRole()));
        user = userRepository.save(user);

        AuthUser authUser = buildAuthUser(user);
        String sessionToken = sessionService.createSession(user.getId());
        return new AuthResponse(sessionToken, "Bearer", 3600, authUser);
    }

    public AuthUser getCurrentUser(String authHeader) {
        Long userId = validateAuth(authHeader);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired."));
        return buildAuthUser(user);
    }

    public AuthUser updateProfile(ProfileUpdateRequest request, String authHeader) {
        Long userId = validateAuth(authHeader);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

        if (request.getFullName() != null) {
            if (request.getFullName().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name cannot be empty.");
            }
            user.setFullName(request.getFullName().trim());
        }

        user = userRepository.save(user);
        return buildAuthUser(user);
    }

    public Long validateAuth(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authorization header.");
        }

        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

        Long sessionUserId = sessionService.tryValidateSession(token);
        if (sessionUserId != null) {
            return sessionUserId;
        }

        if (allowLocalTokens && token.startsWith("local-")) {
            try {
                return Long.parseLong(token.substring(6));
            } catch (NumberFormatException e) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid session.");
            }
        }

        try {
            SupabaseAuthService.SupabaseUser supabaseUser = supabaseAuthService.verifyToken(token);
            User user = userRepository.findByEmail(supabaseUser.email());
            if (user != null) {
                return user.getId();
            }
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found.");
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token.");
        }
    }

    public Long validateOptionalAuth(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        return validateAuth(authHeader);
    }

    public void logout(String authHeader) {
        if (authHeader == null || authHeader.isBlank()) {
            return;
        }
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        sessionService.deleteSession(token);
    }

    public User requireOrganizer(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "ATTENDEE";
        if (!"ADMIN".equals(role) && !"ORGANIZER".equals(role) && !"HOST".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Organizer access required.");
        }
        return user;
    }

    public boolean isOrganizer(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return false;
            }
            String role = user.getRole() != null ? user.getRole().toUpperCase() : "ATTENDEE";
            return "ADMIN".equals(role) || "ORGANIZER".equals(role) || "HOST".equals(role);
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean isAdmin(Long userId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            return isAdmin(user);
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean isAdmin(User user) {
        if (user == null || user.getRole() == null) {
            return false;
        }
        return "ADMIN".equalsIgnoreCase(user.getRole());
    }

    public AuthUser buildAuthUser(User user) {
        String role = resolveRoleForResponse(user.getRole());
        return new AuthUser(
            user.getId(),
            user.getEmail(),
            user.getFullName(),
            role,
            null,
            null,
            user.getCreatedAt(),
            user.getUpdatedAt(),
            true,
            true
        );
    }

    public String resolveRole(String role) {
        if (role == null || role.isBlank()) {
            return "ATTENDEE";
        }
        String normalized = role.trim().toUpperCase();
        if ("HOST".equals(normalized)) {
            return "ORGANIZER";
        }
        if ("ORGANIZER".equals(normalized) || "ATTENDEE".equals(normalized)) {
            return normalized;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported role selection.");
    }

    public User createGuestUser() {
        User user = new User();
        user.setEmail("guest-" + UUID.randomUUID() + "@example.com");
        user.setFullName("Guest Attendee");
        user.setRole("ATTENDEE");
        user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        return userRepository.save(user);
    }

    private String resolveRoleForResponse(String role) {
        if (role == null || role.isBlank()) {
            return "ATTENDEE";
        }
        String normalized = role.trim().toUpperCase();
        if ("ORGANIZER".equals(normalized)) {
            return "HOST";
        }
        return normalized;
    }

    private String resolveDesiredRole(String desiredRole) {
        if (desiredRole == null || desiredRole.isBlank()) {
            return "ATTENDEE";
        }
        String normalized = desiredRole.trim().toUpperCase();
        if ("HOST".equals(normalized) || "ORGANIZER".equals(normalized)) {
            return "ORGANIZER";
        }
        if ("ATTENDEE".equals(normalized)) {
            return "ATTENDEE";
        }
        return "ATTENDEE";
    }

    public String normalizeDesiredRole(String desiredRole) {
        return resolveDesiredRole(desiredRole);
    }

    private String normalizeStoredRole(String role) {
        if (role == null || role.isBlank()) {
            return "ATTENDEE";
        }
        return role.trim().toUpperCase();
    }

    private boolean shouldUpgradeRole(String currentRole, String requestedRole) {
        return "ATTENDEE".equals(currentRole) && "ORGANIZER".equals(requestedRole);
    }
}
