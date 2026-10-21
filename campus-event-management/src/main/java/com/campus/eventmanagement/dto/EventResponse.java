
package com.campus.eventmanagement.dto;

import com.campus.eventmanagement.entity.Event;
import com.campus.eventmanagement.entity.EventStatus;

import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        Long clubId,
        String title,
        String description,
        String imageUrl,
        String category,
        String venue,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Integer capacity,
        EventStatus status,
        Long createdById
) {
    public static EventResponse from(Event event) {
        return new EventResponse(
                event.getId(),
                event.getClub().getId(),
                event.getTitle(),
                event.getDescription(),
                event.getImageUrl(),
                event.getCategory(),
                event.getVenue(),
                event.getStartTime(),
                event.getEndTime(),
                event.getCapacity(),
                event.getStatus(),
                event.getCreatedBy().getId()
        );
    }
}

