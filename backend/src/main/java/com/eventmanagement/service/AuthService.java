package com.eventmanagement.service;

import com.eventmanagement.dto.AuthResponse;
import com.eventmanagement.dto.AuthUser;
import com.eventmanagement.dto.ProfileUpdateRequest;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.UserRepository;
import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final SupabaseAuthService supabaseAuthService;
    private final PasswordEncoder passwordEncoder;
    private final Set<String> adminEmails;
    private final boolean allowSelfUpgrade;

    public AuthService(
        UserRepository userRepository,
        SupabaseAuthService supabaseAuthService,
        PasswordEncoder passwordEncoder,
        @Value("${app.security.admin-emails:}") String adminEmails,
        @Value("${app.security.allow-self-upgrade:false}") boolean allowSelfUpgrade
    ) {
        this.userRepository = userRepository;
        this.supabaseAuthService = supabaseAuthService;
        this.passwordEncoder = passwordEncoder;
        this.adminEmails = parseAdminEmails(adminEmails);
        this.allowSelfUpgrade = allowSelfUpgrade;
    }

    public AuthResponse handleSupabaseAuth(String authHeader, String desiredRole) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            SupabaseAuthService.SupabaseUser supabaseUser = supabaseAuthService.verifyToken(token);

            User user = userRepository.findByEmail(supabaseUser.email());
            if (user == null) {
                user = new User();
                user.setEmail(supabaseUser.email());
                user.setFullName(supabaseUser.name());
                user.setRole(resolveInitialRole(supabaseUser.email()));
                user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                user = userRepository.save(user);
            } else {
                String currentRole = normalizeStoredRole(user.getRole());
                String targetRole = resolveLoginRole(currentRole, user.getEmail());
                if (!currentRole.equals(targetRole)) {
                    log.info("Updated role for userId={} from {} to {}", user.getId(), currentRole, targetRole);
                    user.setRole(targetRole);
                    user = userRepository.save(user);
                }
            }

            AuthUser authUser = buildAuthUser(user);
            return new AuthResponse(token, "Bearer", 3600, authUser);
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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof Long userId) {
                return userId;
            }
        }
        if (authHeader == null || authHeader.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authorization header.");
        }

        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof Long userId) {
                return userId;
            }
        }
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        return validateAuth(authHeader);
    }

    public void logout(String authHeader) {
        return;
    }

    public User requireOrganizer(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "ATTENDEE";
        if (!"HOST".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Host access required.");
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
            return "HOST".equals(role);
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
        if ("HOST".equals(normalized) || "ATTENDEE".equals(normalized)) {
            return normalized;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported role selection.");
    }

    public String resolveAdminRole(String role) {
        if (role == null || role.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required.");
        }
        String normalized = role.trim().toUpperCase();
        if ("ADMIN".equals(normalized)) {
            return "ADMIN";
        }
        return resolveRole(normalized);
    }

    public User updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        String normalized = resolveAdminRole(role);
        user.setRole(normalized);
        return userRepository.save(user);
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
        if ("HOST".equals(normalized) || "ADMIN".equals(normalized)) {
            return normalized;
        }
        return "ATTENDEE";
    }

    private String resolveDesiredRole(String desiredRole) {
        if (desiredRole == null || desiredRole.isBlank()) {
            return "ATTENDEE";
        }
        String normalized = desiredRole.trim().toUpperCase();
        if ("HOST".equals(normalized)) {
            return "HOST";
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

    private String resolveLoginRole(String currentRole, String email) {
        if (isAdminEmail(email)) {
            return "ADMIN";
        }
        return currentRole;
    }

    private String resolveInitialRole(String email) {
        if (isAdminEmail(email)) {
            return "ADMIN";
        }
        return "ATTENDEE";
    }

    private boolean isAdminEmail(String email) {
        if (email == null) {
            return false;
        }
        return adminEmails.contains(email.trim().toLowerCase());
    }

    private Set<String> parseAdminEmails(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptySet();
        }
        return Arrays.stream(value.split(","))
            .map(String::trim)
            .filter(item -> !item.isBlank())
            .map(String::toLowerCase)
            .collect(Collectors.toUnmodifiableSet());
    }
}
