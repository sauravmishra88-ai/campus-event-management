
        package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.dto.RegistrationResponse;
import com.campus.eventmanagement.service.RegistrationService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(
            RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    // Register for an event
    @PostMapping("/events/{eventId}/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationResponse registerForEvent(
            @PathVariable Long eventId) {

        return registrationService.registerForEvent(eventId);
    }


    @GetMapping("/student/registrations")
    public java.util.List<RegistrationResponse> getMyRegistrations() {
        return registrationService.getMyRegistrations();
    }

    @PatchMapping("/events/{eventId}/cancel-registration")
    public RegistrationResponse cancelRegistration(
            @PathVariable Long eventId) {
        return registrationService.cancelRegistration(eventId);
    }

}

