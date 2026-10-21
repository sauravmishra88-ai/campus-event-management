
package com.campus.eventmanagement.repository;


import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import com.campus.eventmanagement.entity.Event;
import com.campus.eventmanagement.entity.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatus(EventStatus status);

    List<Event> findByClubId(Long clubId);

    boolean existsByClubIdAndTitleIgnoreCase(
            Long clubId,
            String title
    );

    Page<Event> findByStatus(
            EventStatus status,
            Pageable pageable
    );

    Page<Event> findByStatusAndTitleContainingIgnoreCase(
            EventStatus status,
            String title,
            Pageable pageable
    );

    Page<Event> findByStatusAndCategoryIgnoreCase(
            EventStatus status,
            String category,
            Pageable pageable
    );


    Page<Event> findByStatusAndTitleContainingIgnoreCaseAndCategoryIgnoreCase(
            EventStatus status,
            String title,
            String category,
            Pageable pageable
    );

    long countByStatus(EventStatus status);


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM Event e WHERE e.id = :eventId")
    Optional<Event> findByIdForUpdate(
            @Param("eventId") Long eventId
    );
}

