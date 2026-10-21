
package com.campus.eventmanagement.dto;

public record AdminDashboardResponse(
        long totalUsers,
        long activeUsers,
        long totalClubs,
        long pendingClubs,
        long totalEvents,
        long publishedEvents,
        long activeRegistrations
) {}

