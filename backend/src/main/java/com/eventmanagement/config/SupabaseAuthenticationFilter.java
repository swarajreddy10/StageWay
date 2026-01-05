package com.eventmanagement.config;

import com.eventmanagement.model.User;
import com.eventmanagement.repository.UserRepository;
import com.eventmanagement.service.SupabaseAuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

public class SupabaseAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(SupabaseAuthenticationFilter.class);
    private final SupabaseAuthService supabaseAuthService;
    private final UserRepository userRepository;

    public SupabaseAuthenticationFilter(
        SupabaseAuthService supabaseAuthService,
        UserRepository userRepository
    ) {
        this.supabaseAuthService = supabaseAuthService;
        this.userRepository = userRepository;
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
                try {
                    SupabaseAuthService.SupabaseUser supabaseUser = supabaseAuthService.verifyToken(token);
                    User user = userRepository.findByEmail(supabaseUser.email());
                    if (user != null) {
                        String role = normalizeRole(user.getRole());
                        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                        var authentication = new UsernamePasswordAuthenticationToken(
                            user.getId(),
                            null,
                            authorities
                        );
                        authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                } catch (Exception ex) {
                    log.debug("Supabase auth filter skipped token: {}", ex.getMessage());
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || header.isBlank()) {
            return null;
        }
        return header.startsWith("Bearer ") ? header.substring(7) : header;
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "ATTENDEE";
        }
        String normalized = role.trim().toUpperCase();
        if ("ORGANIZER".equals(normalized)) {
            return "HOST";
        }
        return normalized;
    }
}
