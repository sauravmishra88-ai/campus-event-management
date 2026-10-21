
package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.dto.EventCreateRequest;
import com.campus.eventmanagement.dto.EventResponse;
import com.campus.eventmanagement.dto.EventUpdateRequest;
import com.campus.eventmanagement.service.EventService;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(
            @Valid @RequestBody EventCreateRequest request) {
        return eventService.createEvent(request);
    }


    @PatchMapping("/{id}/publish")
    public EventResponse publishEvent(@PathVariable Long id) {
        return eventService.publishEvent(id);
    }



    @PutMapping("/{id}")
    public EventResponse updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventUpdateRequest request) {

        return eventService.updateEvent(id, request);
    }

    @PatchMapping("/{id}/cancel")
    public EventResponse cancelEvent(@PathVariable Long id) {
        return eventService.cancelEvent(id);
    }

    @GetMapping("/published")
    public Page<EventResponse> searchPublishedEvents(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return eventService.searchPublishedEvents(
                title, category, page, size
        );
    }

}

