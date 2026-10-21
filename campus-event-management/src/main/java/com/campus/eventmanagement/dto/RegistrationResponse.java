
        package com.campus.eventmanagement.dto;

import com.campus.eventmanagement.entity.Registration;
import com.campus.eventmanagement.entity.RegistrationStatus;
import java.time.LocalDateTime;

public record RegistrationResponse(
        Long id,
        Long eventId,
        Long studentId,
        RegistrationStatus status,
        LocalDateTime registeredAt,
        LocalDateTime cancelledAt
) {
    public static RegistrationResponse from(Registration registration) {
        return new RegistrationResponse(
                registration.getId(),
                registration.getEvent().getId(),
                registration.getStudent().getId(),
                registration.getStatus(),
                registration.getRegisteredAt(),
                registration.getCancelledAt()
        );
    }
}

