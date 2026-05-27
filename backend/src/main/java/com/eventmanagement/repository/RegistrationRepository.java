package com.eventmanagement.repository;

import com.eventmanagement.model.Registration;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserId(Long userId);
    Registration findByEventIdAndUserId(Long eventId, Long userId);
    List<Registration> findByEventId(Long eventId);
    List<Registration> findByEventIdAndStatusIn(Long eventId, Collection<String> statuses);
    Registration findByEventIdAndSeatNumber(Long eventId, Integer seatNumber);
    long countByEventId(Long eventId);
    long countByEventIdAndStatusIn(Long eventId, Collection<String> statuses);
    long countByStatus(String status);

    @Query("select max(r.waitlistPosition) from Registration r where r.eventId = :eventId and r.status = 'WAITLISTED'")
    Integer findMaxWaitlistPosition(@Param("eventId") Long eventId);

    @Query("select r.eventId, count(r) from Registration r "
        + "where r.eventId in :eventIds and r.status in :statuses group by r.eventId")
    List<Object[]> countByEventIdInAndStatusIn(
        @Param("eventIds") List<Long> eventIds,
        @Param("statuses") Collection<String> statuses
    );

    @Query("select r.eventId, count(r) from Registration r where r.eventId in :eventIds group by r.eventId")
    List<Object[]> countByEventIdIn(@Param("eventIds") List<Long> eventIds);

    @Query(value = "select date(created_at) as day, count(*) from registrations "
        + "where event_id = :eventId and created_at is not null "
        + "group by date(created_at) order by day", nativeQuery = true)
    List<Object[]> countByEventIdGroupedByDate(@Param("eventId") Long eventId);

    @Query(value = "select extract(hour from created_at) as hour, count(*) from registrations "
        + "where event_id = :eventId and created_at is not null "
        + "group by extract(hour from created_at) order by hour", nativeQuery = true)
    List<Object[]> countByEventIdGroupedByHour(@Param("eventId") Long eventId);

    @Query(value = "select count(*) from registrations where event_id in (:eventIds)", nativeQuery = true)
    long countByEventIdInNative(@Param("eventIds") List<Long> eventIds);

    @Query(value = "select count(*) from registrations "
        + "where event_id in (:eventIds) and status in (:statuses)", nativeQuery = true)
    long countByEventIdInAndStatusInNative(
        @Param("eventIds") List<Long> eventIds,
        @Param("statuses") Collection<String> statuses
    );
}
