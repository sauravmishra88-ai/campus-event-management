
        package com.campus.eventmanagement.service;

import com.campus.eventmanagement.dto.AdminDashboardResponse;
import com.campus.eventmanagement.entity.ClubStatus;
import com.campus.eventmanagement.entity.EventStatus;
import com.campus.eventmanagement.entity.RegistrationStatus;

import com.campus.eventmanagement.repository.UserRepository;
import com.campus.eventmanagement.repository.ClubRepository;
import com.campus.eventmanagement.repository.EventRepository;
import com.campus.eventmanagement.repository.RegistrationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    public AdminDashboardService(
            UserRepository userRepository,
            ClubRepository clubRepository,
            EventRepository eventRepository,
            RegistrationRepository registrationRepository) {
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {

        return new AdminDashboardResponse(
                userRepository.count(),
                userRepository.countByIsActiveTrue(),
                clubRepository.count(),
                clubRepository.countByStatus(ClubStatus.PENDING),
                eventRepository.count(),
                eventRepository.countByStatus(EventStatus.PUBLISHED),
                registrationRepository.countByStatus(
                        RegistrationStatus.REGISTERED)
        );
    }
}

