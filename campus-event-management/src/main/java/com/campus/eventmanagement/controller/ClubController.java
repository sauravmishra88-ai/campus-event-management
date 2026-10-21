package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.dto.ClubCreateRequest;
import com.campus.eventmanagement.dto.ClubResponse;
import com.campus.eventmanagement.dto.ClubUpdateRequest;
import com.campus.eventmanagement.service.ClubService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClubResponse createClub(
            @Valid @RequestBody ClubCreateRequest request) {
        return clubService.createClub(request);
    }

    @GetMapping
    public java.util.List<ClubResponse> getAllClubs() {
        return clubService.getAllClubs();
    }


    @GetMapping("/pending")
    public List<ClubResponse> getPendingClubs() {
        return clubService.getPendingClubs();
    }

    @PatchMapping("/{id}/approve")
    public ClubResponse approveClub(@PathVariable Long id) {
        return clubService.approveClub(id);
    }

    @PatchMapping("/{id}/reject")
    public ClubResponse rejectClub(@PathVariable Long id) {
        return clubService.rejectClub(id);
    }


    @PutMapping("/{id}")
    public ClubResponse updateClub(
            @PathVariable Long id,
            @Valid @RequestBody ClubUpdateRequest request) {

        return clubService.updateClub(id, request);
    }
}
