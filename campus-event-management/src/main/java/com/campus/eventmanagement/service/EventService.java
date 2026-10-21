
package com.campus.eventmanagement.service;

import com.campus.eventmanagement.entity.*;
import com.campus.eventmanagement.dto.EventCreateRequest;
import com.campus.eventmanagement.dto.EventResponse;
import com.campus.eventmanagement.repository.ClubRepository;
import com.campus.eventmanagement.repository.EventRepository;
import com.campus.eventmanagement.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import com.campus.eventmanagement.dto.EventUpdateRequest;
import com.campus.eventmanagement.entity.EventStatus;
import com.campus.eventmanagement.entity.Role;
import com.campus.eventmanagement.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final UserRepository userRepository;

    public EventService(
            EventRepository eventRepository,
            ClubRepository clubRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public EventResponse createEvent(EventCreateRequest request) {

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End time must be after start time"
            );
        }

        Club club = clubRepository.findById(request.getClubId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Club not found"
                ));

        if (club.getStatus() != com.campus.eventmanagement.entity.ClubStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only approved clubs can create events"
            );
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        User currentUser = userRepository.findByEmail(
                authentication.getName()
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "User not found"
        ));


        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isAssignedManager =
                club.getManager() != null
                        && club.getManager().getId().equals(currentUser.getId());

        if (!isAdmin && !isAssignedManager) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot create events for this club"
            );
        }


        Event event = new Event();
        event.setClub(club);
        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription());
        event.setImageUrl(request.getImageUrl());
        event.setCategory(request.getCategory());
        event.setVenue(request.getVenue());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setCapacity(request.getCapacity());
        event.setCreatedBy(currentUser);

        // Event entity ka default status DRAFT rahega.
        Event savedEvent = eventRepository.save(event);

        return EventResponse.from(savedEvent);
    }


    @Transactional
    public EventResponse publishEvent(Long id) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found"
                ));

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isAssignedManager = event.getClub().getManager() != null
                && event.getClub().getManager().getId().equals(currentUser.getId());

        if (!isAdmin && !isAssignedManager) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot publish events for this club");
        }

        if (event.getClub().getStatus()
                != com.campus.eventmanagement.entity.ClubStatus.APPROVED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only events of approved clubs can be published"
            );
        }

        event.setStatus(EventStatus.PUBLISHED);

        Event savedEvent = eventRepository.save(event);

        return EventResponse.from(savedEvent);
    }


    @Transactional(readOnly = true)
    public java.util.List<EventResponse> getPublishedEvents() {
        return eventRepository.findByStatus(EventStatus.PUBLISHED)
                .stream()
                .map(EventResponse::from)
                .toList();
    }


    @Transactional
    public EventResponse updateEvent(
            Long id,
            EventUpdateRequest request) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Event not found"));

        // End time must be after start time
        if (!request.endTime().isAfter(request.startTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End time must be after start time");
        }

        // Find currently logged-in user
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        // Only ADMIN or the club's assigned manager can update
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        boolean isClubManager =
                event.getClub().getManager() != null
                        && event.getClub().getManager().getId()
                        .equals(currentUser.getId());

        if (!isAdmin && !isClubManager) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot update this event");
        }

        if (event.getStatus() == EventStatus.CANCELLED
                || event.getStatus() == EventStatus.COMPLETED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cancelled or completed events cannot be updated");
        }

        event.setTitle(request.title().trim());
        event.setDescription(request.description());
        event.setImageUrl(request.imageUrl());
        event.setCategory(request.category().trim());
        event.setVenue(request.venue().trim());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setCapacity(request.capacity());

        Event savedEvent = eventRepository.save(event);

        return EventResponse.from(savedEvent);
    }


    @Transactional
    public EventResponse cancelEvent(Long id) {

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Event not found"
                ));

        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        boolean isClubManager =
                event.getClub().getManager() != null
                        && event.getClub().getManager().getId()
                        .equals(currentUser.getId());

        if (!isAdmin && !isClubManager) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot cancel this event"
            );
        }

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Event is already cancelled"
            );
        }

        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Completed event cannot be cancelled"
            );
        }

        event.setStatus(EventStatus.CANCELLED);

        Event savedEvent = eventRepository.save(event);

        return EventResponse.from(savedEvent);
    }

    @Transactional(readOnly = true)
    public Page<EventResponse> getPublishedEvents(int page, int size) {

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page must be >= 0 and size must be between 1 and 100"
            );
        }

        Pageable pageable = PageRequest.of(page, size);

        return eventRepository
                .findByStatus(EventStatus.PUBLISHED, pageable)
                .map(EventResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<EventResponse> searchPublishedEvents(
            String title,
            String category,
            int page,
            int size) {

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid page or size"
            );
        }

        Pageable pageable = PageRequest.of(page, size);

        Page<Event> events;

        if (title != null && !title.isBlank()
                && category != null && !category.isBlank()) {

            // Both title and category provided
            events = eventRepository
                    .findByStatusAndTitleContainingIgnoreCaseAndCategoryIgnoreCase(
                            EventStatus.PUBLISHED,
                            title.trim(),
                            category.trim(),
                            pageable
                    );

        } else if (title != null && !title.isBlank()) {

            // Search by title only
            events = eventRepository
                    .findByStatusAndTitleContainingIgnoreCase(
                            EventStatus.PUBLISHED,
                            title.trim(),
                            pageable
                    );

        } else if (category != null && !category.isBlank()) {

            // Filter by category only
            events = eventRepository
                    .findByStatusAndCategoryIgnoreCase(
                            EventStatus.PUBLISHED,
                            category.trim(),
                            pageable
                    );

        } else {

            // No search/filter: show all published events
            events = eventRepository.findByStatus(
                    EventStatus.PUBLISHED,
                    pageable
            );
        }

        return events.map(EventResponse::from);
    }

}

