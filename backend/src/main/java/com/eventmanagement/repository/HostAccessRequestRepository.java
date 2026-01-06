package com.eventmanagement.repository;

import com.eventmanagement.model.HostAccessRequest;
import com.eventmanagement.model.HostAccessRequestStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HostAccessRequestRepository extends JpaRepository<HostAccessRequest, Long> {
    Optional<HostAccessRequest> findByUserIdAndStatus(Long userId, HostAccessRequestStatus status);
    Optional<HostAccessRequest> findTopByUserIdOrderByCreatedAtDesc(Long userId);
    List<HostAccessRequest> findByStatusOrderByCreatedAtDesc(HostAccessRequestStatus status);
    List<HostAccessRequest> findAllByOrderByCreatedAtDesc();
}
