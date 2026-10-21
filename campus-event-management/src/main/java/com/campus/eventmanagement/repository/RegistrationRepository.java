package com.campus.eventmanagement.repository;

import com.campus.eventmanagement.entity.Registration;
import com.campus.eventmanagement.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // Check if a registration record already exists
    boolean existsByEventIdAndStudentId(
            Long eventId,
            Long studentId
    );

    // Find a student's registration for a particular event
    Optional<Registration> findByEventIdAndStudentId(
            Long eventId,
            Long studentId
    );

    // Fetch all registrations made by a student
    List<Registration> findByStudentId(Long studentId);

    // Fetch registrations by event and status
    List<Registration> findByEventIdAndStatus(
            Long eventId,
            RegistrationStatus status
    );

    // Count active registrations for capacity checking
    long countByEventIdAndStatus(
            Long eventId,
            RegistrationStatus status
    );

    long countByStatus(RegistrationStatus status);
}
