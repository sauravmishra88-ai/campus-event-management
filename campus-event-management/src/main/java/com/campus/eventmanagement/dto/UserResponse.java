
package com.campus.eventmanagement.dto;

import com.campus.eventmanagement.entity.Role;
import com.campus.eventmanagement.entity.User;

public record UserResponse(
        Long id,
        String name,
        String email,
        Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}

