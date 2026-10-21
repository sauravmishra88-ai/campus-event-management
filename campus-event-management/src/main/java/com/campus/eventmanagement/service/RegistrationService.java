
        package com.campus.eventmanagement.service;

import com.campus.eventmanagement.dto.RegistrationResponse;
import com.campus.eventmanagement.entity.*;
import com.campus.eventmanagement.repository.EventRepository;
import com.campus.eventmanagement.repository.RegistrationRepository;
import com.campus.eventmanagement.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public RegistrationService(
            RegistrationRepository registrationRepository,
            EventRepository eventRepository,
            UserRepository userRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RegistrationResponse registerForEvent(Long eventId) {

        // 1. Get logged-in user's email from JWT authentication
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        // 2. Only STUDENT role can register
        if (student.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can register for events");
        }

        // 3. Find event
        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found"));

        // 4. Event must be published
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only published events can be registered for");
        }

        // 5. Event must not have already started
        if (!event.getStartTime().isAfter(LocalDateTime.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Registration is closed because the event has started");
        }

        // 6. Check existing registration
        var existing = registrationRepository
                .findByEventIdAndStudentId(eventId, student.getId());

        if (existing.isPresent()) {
            Registration registration = existing.get();

            if (registration.getStatus() == RegistrationStatus.REGISTERED) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Already registered for this event");
            }

            // Reactivate previously cancelled registration
            long activeCount = registrationRepository
                    .countByEventIdAndStatus(
                            eventId, RegistrationStatus.REGISTERED);

            if (activeCount >= event.getCapacity()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Event capacity is full");
            }

            registration.setStatus(RegistrationStatus.REGISTERED);
            registration.setCancelledAt(null);

            Registration saved = registrationRepository.save(registration);
            return RegistrationResponse.from(saved);
        }

        // 7. Check event capacity
        long activeCount = registrationRepository
                .countByEventIdAndStatus(
                        eventId, RegistrationStatus.REGISTERED);

        if (activeCount >= event.getCapacity()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Event capacity is full");
        }

        // 8. Create registration
        Registration registration = new Registration();
        registration.setEvent(event);
        registration.setStudent(student);
        registration.setStatus(RegistrationStatus.REGISTERED);

        Registration saved = registrationRepository.save(registration);

        return RegistrationResponse.from(saved);
    }


    @Transactional(readOnly = true)
    public java.util.List<RegistrationResponse> getMyRegistrations() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can view their registrations");
        }

        return registrationRepository.findByStudentId(student.getId())
                .stream()
                .map(RegistrationResponse::from)
                .toList();
    }

    @Transactional
    public RegistrationResponse cancelRegistration(Long eventId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only students can cancel registrations");
        }

        Registration registration = registrationRepository
                .findByEventIdAndStudentId(eventId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Registration not found"));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Registration is already cancelled");
        }

        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setCancelledAt(LocalDateTime.now());

        Registration saved = registrationRepository.save(registration);

        return RegistrationResponse.from(saved);
    }

}

