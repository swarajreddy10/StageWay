package com.eventmanagement.config;

import com.eventmanagement.model.User;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.service.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class SessionAuthenticationFilter extends OncePerRequestFilter {
    private final SessionService sessionService;
    private final UserRepository userRepository;
    private final boolean allowLocalTokens;

    public SessionAuthenticationFilter(
        SessionService sessionService,
        UserRepository userRepository,
        boolean allowLocalTokens
    ) {
        this.sessionService = sessionService;
        this.userRepository = userRepository;
        this.allowLocalTokens = allowLocalTokens;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = resolveBearerToken(request);
            if (token != null) {
                Long userId = resolveUserId(token);
                if (userId != null) {
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        String role = user.getRole() != null ? user.getRole().toUpperCase() : "ATTENDEE";
                        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                        var authentication = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            authorities
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveBearerToken(HttpServletRequest request) {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || authHeader.isBlank()) {
            return null;
        }
        return authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    }

    private Long resolveUserId(String token) {
        Long sessionUserId = sessionService.tryValidateSession(token);
        if (sessionUserId != null) {
            return sessionUserId;
        }
        if (allowLocalTokens && token.startsWith("local-")) {
            try {
                return Long.parseLong(token.substring(6));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
