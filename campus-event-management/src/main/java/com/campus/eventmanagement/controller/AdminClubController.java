
package com.campus.eventmanagement.controller;

import com.campus.eventmanagement.dto.ClubResponse;
import com.campus.eventmanagement.service.ClubService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/clubs")
public class AdminClubController {

    private final ClubService clubService;

    public AdminClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @PatchMapping("/{id}/approve")
    public ClubResponse approveClub(@PathVariable Long id) {
        return clubService.approveClub(id);
    }

    @PatchMapping("/{id}/reject")
    public ClubResponse rejectClub(@PathVariable Long id) {
        return clubService.rejectClub(id);
    }

    @GetMapping("/pending")
    public java.util.List<ClubResponse> getPendingClubs() {
        return clubService.getPendingClubs();
    }


    @PatchMapping("/{id}/deactivate")
    public ClubResponse deactivateClub(@PathVariable Long id) {
        return clubService.deactivateClub(id);
    }

}

