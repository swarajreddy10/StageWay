package com.eventmanagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.web.filter.OncePerRequestFilter;

public class AuthCookieFilter extends OncePerRequestFilter {
    private final String sessionCookieName;

    public AuthCookieFilter(String sessionCookieName) {
        this.sessionCookieName = sessionCookieName;
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        if (request.getHeader(HttpHeaders.AUTHORIZATION) != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = resolveSessionCookie(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        HttpServletRequestWrapper wrapped = new HttpServletRequestWrapper(request) {
            @Override
            public String getHeader(String name) {
                if (HttpHeaders.AUTHORIZATION.equalsIgnoreCase(name)) {
                    return "Bearer " + token;
                }
                return super.getHeader(name);
            }

            @Override
            public Enumeration<String> getHeaders(String name) {
                if (HttpHeaders.AUTHORIZATION.equalsIgnoreCase(name)) {
                    return Collections.enumeration(List.of("Bearer " + token));
                }
                return super.getHeaders(name);
            }

            @Override
            public Enumeration<String> getHeaderNames() {
                List<String> names = new ArrayList<>(Collections.list(super.getHeaderNames()));
                if (!names.contains(HttpHeaders.AUTHORIZATION)) {
                    names.add(HttpHeaders.AUTHORIZATION);
                }
                return Collections.enumeration(names);
            }
        };

        filterChain.doFilter(wrapped, response);
    }

    private String resolveSessionCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (sessionCookieName.equals(cookie.getName())) {
                String value = cookie.getValue();
                return value != null && !value.isBlank() ? value : null;
            }
        }
        return null;
    }
}
