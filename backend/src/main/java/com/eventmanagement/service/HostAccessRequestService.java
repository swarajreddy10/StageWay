package com.eventmanagement.service;

import com.eventmanagement.dto.HostAccessRequestAdminResponse;
import com.eventmanagement.dto.HostAccessRequestResponse;
import com.eventmanagement.model.HostAccessRequest;
import com.eventmanagement.model.HostAccessRequestStatus;
import com.eventmanagement.model.User;
import com.eventmanagement.repository.HostAccessRequestRepository;
import com.eventmanagement.repository.UserRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class HostAccessRequestService {
    private final HostAccessRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    public HostAccessRequestService(
        HostAccessRequestRepository requestRepository,
        UserRepository userRepository,
        AuthService authService
    ) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    public HostAccessRequestResponse createRequest(Long userId, String note, String companyName, String eventPlan) {
        User user = requireUser(userId);
        if (hasHostAccess(user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Host access already granted.");
        }

        Optional<HostAccessRequest> pending =
            requestRepository.findByUserIdAndStatus(userId, HostAccessRequestStatus.PENDING);
        if (pending.isPresent()) {
            return toResponse(pending.get());
        }

        HostAccessRequest request = new HostAccessRequest();
        request.setUserId(userId);
        request.setStatus(HostAccessRequestStatus.PENDING);
        request.setNote(normalizeText(note));
        request.setCompanyName(normalizeText(companyName));
        request.setEventPlan(normalizeText(eventPlan));
        HostAccessRequest saved = requestRepository.save(request);
        return toResponse(saved);
    }

    public HostAccessRequestResponse getLatestRequest(Long userId) {
        Optional<HostAccessRequest> latest =
            requestRepository.findTopByUserIdOrderByCreatedAtDesc(userId);
        return latest.map(this::toResponse).orElse(null);
    }

    public List<HostAccessRequestAdminResponse> listRequests(String status) {
        List<HostAccessRequest> requests;
        if (status == null || status.isBlank()) {
            requests = requestRepository.findAllByOrderByCreatedAtDesc();
        } else {
            HostAccessRequestStatus parsed = parseStatus(status);
            requests = requestRepository.findByStatusOrderByCreatedAtDesc(parsed);
        }
        return requests.stream().map(this::toAdminResponse).toList();
    }

    public HostAccessRequestAdminResponse reviewRequest(
        Long requestId,
        String status,
        Long adminUserId
    ) {
        HostAccessRequest request = requestRepository.findById(requestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found."));
        HostAccessRequestStatus decision = parseDecision(status);
        if (request.getStatus() != HostAccessRequestStatus.PENDING) {
            return toAdminResponse(request);
        }

        request.setStatus(decision);
        request.setReviewedBy(adminUserId);
        request.setReviewedAt(OffsetDateTime.now(ZoneOffset.UTC));

        if (decision == HostAccessRequestStatus.APPROVED) {
            authService.updateUserRole(request.getUserId(), "HOST");
        }

        HostAccessRequest saved = requestRepository.save(request);
        return toAdminResponse(saved);
    }

    private HostAccessRequestResponse toResponse(HostAccessRequest request) {
        return new HostAccessRequestResponse(
            request.getId(),
            request.getStatus().name(),
            request.getNote(),
            request.getCompanyName(),
            request.getEventPlan(),
            request.getCreatedAt(),
            request.getReviewedAt()
        );
    }

    private HostAccessRequestAdminResponse toAdminResponse(HostAccessRequest request) {
        User user = userRepository.findById(request.getUserId()).orElse(null);
        return new HostAccessRequestAdminResponse(
            request.getId(),
            request.getUserId(),
            user != null ? user.getEmail() : null,
            user != null ? user.getFullName() : null,
            request.getStatus().name(),
            request.getNote(),
            request.getCompanyName(),
            request.getEventPlan(),
            request.getCreatedAt(),
            request.getReviewedAt()
        );
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
    }

    private boolean hasHostAccess(User user) {
        if (user == null || user.getRole() == null) {
            return false;
        }
        String role = user.getRole().trim().toUpperCase();
        return "ADMIN".equals(role) || "HOST".equals(role);
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private HostAccessRequestStatus parseStatus(String status) {
        String normalized = status.trim().toUpperCase();
        try {
            return HostAccessRequestStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status.");
        }
    }

    private HostAccessRequestStatus parseDecision(String status) {
        HostAccessRequestStatus parsed = parseStatus(status);
        if (parsed == HostAccessRequestStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decision required.");
        }
        return parsed;
    }
}
