package com.eventmanagement.dto;

public record AuthResponse(String token, String tokenType, long expiresIn, AuthUser user) {}
