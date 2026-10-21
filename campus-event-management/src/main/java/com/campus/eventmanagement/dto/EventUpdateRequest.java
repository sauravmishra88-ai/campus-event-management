package com.campus.eventmanagement.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record EventUpdateRequest(

        @NotBlank
        @Size(max = 150)
        String title,

        @Size(max = 2000)
        String description,

        @Size(max = 500)
        String imageUrl,

        @NotBlank
        @Size(max = 100)
        String category,

        @NotBlank
        @Size(max = 255)
        String venue,

        @NotNull
        @Future
        LocalDateTime startTime,

        @NotNull
        @Future
        LocalDateTime endTime,

        @NotNull
        @Positive
        Integer capacity

) {}
