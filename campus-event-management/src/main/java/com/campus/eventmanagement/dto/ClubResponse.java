package com.campus.eventmanagement.dto;

import com.campus.eventmanagement.entity.Club;
import com.campus.eventmanagement.entity.ClubStatus;

import java.time.LocalDateTime;

public record ClubResponse(
        Long id,
        String name,
        String description,
        String clubType,
        String branches,
        String imageUrl,
        Long managerId,
        Long createdById,
        ClubStatus status,
        LocalDateTime createdAt
) {
    public static ClubResponse from(Club club) {
        return new ClubResponse(
                club.getId(),
                club.getName(),
                club.getDescription(),
                club.getClubType(),
                club.getBranches(),
                club.getImageUrl(),
                club.getManager() == null
                        ? null : club.getManager().getId(),
                club.getCreatedBy().getId(),
                club.getStatus(),
                club.getCreatedAt()
        );
    }
}
