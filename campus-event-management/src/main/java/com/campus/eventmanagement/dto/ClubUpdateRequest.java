
package com.campus.eventmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ClubUpdateRequest {

    @NotBlank(message = "Club name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 2000)
    private String description;

    @Size(max = 80)
    private String clubType;

    @Size(max = 500)
    private String branches;

    @Size(max = 500)
    private String imageUrl;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getClubType() { return clubType; }
    public void setClubType(String clubType) { this.clubType = clubType; }
    public String getBranches() { return branches; }
    public void setBranches(String branches) { this.branches = branches; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}

