package com.campus.eventmanagement.service;

import com.campus.eventmanagement.dto.ClubCreateRequest;
import com.campus.eventmanagement.dto.ClubResponse;
import com.campus.eventmanagement.entity.Club;
import com.campus.eventmanagement.entity.ClubStatus;
import com.campus.eventmanagement.entity.Role;
import com.campus.eventmanagement.entity.User;
import com.campus.eventmanagement.repository.ClubRepository;
import com.campus.eventmanagement.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.campus.eventmanagement.dto.ClubUpdateRequest;



@Service
public class ClubService {

    private final ClubRepository clubRepository;
    private final UserRepository userRepository;

    public ClubService(
            ClubRepository clubRepository,
            UserRepository userRepository) {
        this.clubRepository = clubRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ClubResponse createClub(ClubCreateRequest request) {

        String name = request.getName().trim();

        if (clubRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Club name already exists"
            );
        }

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ));

        Club club = new Club();
        club.setName(name);
        club.setDescription(request.getDescription());
        club.setClubType(request.getClubType());
        club.setBranches(request.getBranches());
        club.setImageUrl(request.getImageUrl());
        club.setCreatedBy(currentUser);

        // New club ka default status PENDING rahega.
        // Manager assignment aur approval baad mein add karenge.

        Club savedClub = clubRepository.save(club);

        return ClubResponse.from(savedClub);
    }

    @Transactional(readOnly = true)
    public java.util.List<ClubResponse> getAllClubs() {
        return clubRepository.findAll()
                .stream()
                .map(ClubResponse::from)
                .toList();
    }


    @Transactional
    public ClubResponse approveClub(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Club not found"
                ));

        club.setStatus(ClubStatus.APPROVED);

        // The student who submitted the club becomes its manager.
        // Keep the user's STUDENT role so they can still use student features;
        // club management is granted through this club-to-user assignment.
        if (club.getManager() == null) {
            club.setManager(club.getCreatedBy());
        }

        Club savedClub = clubRepository.save(club);
        return ClubResponse.from(savedClub);
    }

    @Transactional
    public ClubResponse rejectClub(Long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Club not found"
                ));

        club.setStatus(ClubStatus.REJECTED);

        Club savedClub = clubRepository.save(club);
        return ClubResponse.from(savedClub);
    }

    @Transactional(readOnly = true)
    public java.util.List<ClubResponse> getPendingClubs() {
        return clubRepository.findByStatus(ClubStatus.PENDING)
                .stream()
                .map(ClubResponse::from)
                .toList();
    }


    @Transactional
    public ClubResponse updateClub(
            Long id,
            ClubUpdateRequest request) {

        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Club not found"
                ));

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "User not found"
                ));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        boolean isManager = club.getManager() != null
                && club.getManager().getId().equals(currentUser.getId());

        if (!isAdmin && !isManager) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot update this club"
            );
        }

        String newName = request.getName().trim();

        if (!club.getName().equalsIgnoreCase(newName)
                && clubRepository.existsByNameIgnoreCase(newName)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Club name already exists"
            );
        }

        club.setName(newName);
        club.setDescription(request.getDescription());
        club.setClubType(request.getClubType());
        club.setBranches(request.getBranches());
        club.setImageUrl(request.getImageUrl());

        return ClubResponse.from(clubRepository.save(club));
    }


    @Transactional
    public ClubResponse deactivateClub(Long id) {

        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Club not found"
                ));

        club.setStatus(ClubStatus.INACTIVE);

        Club savedClub = clubRepository.save(club);

        return ClubResponse.from(savedClub);
    }



}
