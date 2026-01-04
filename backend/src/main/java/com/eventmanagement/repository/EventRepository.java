package com.eventmanagement.repository;

import com.eventmanagement.model.Event;
import java.util.List;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {
    List<Event> findByOrganizationId(Long organizationId);
    long countByOrganizationId(Long organizationId);
    long countByOrganizationIdAndStatusIgnoreCase(Long organizationId, String status);
    long countByStatusIgnoreCase(String status);

    @Query("select e.id from Event e where e.organizationId = :organizationId")
    List<Long> findIdsByOrganizationId(@Param("organizationId") Long organizationId);

    @Query("select e.id from Event e")
    List<Long> findAllIds();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    Optional<Event> findByIdForUpdate(@Param("id") Long id);
}
