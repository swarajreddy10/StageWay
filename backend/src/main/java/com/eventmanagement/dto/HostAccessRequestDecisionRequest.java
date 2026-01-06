package com.eventmanagement.dto;

import jakarta.validation.constraints.NotBlank;

public record HostAccessRequestDecisionRequest(@NotBlank String status) {}
