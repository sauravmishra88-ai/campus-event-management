package com.campus.eventmanagement.repository;

import com.campus.eventmanagement.entity.Club;
import com.campus.eventmanagement.entity.ClubStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubRepository extends JpaRepository<Club, Long> {

    boolean existsByNameIgnoreCase(String name);

    List<Club> findByStatus(ClubStatus status);

    long countByStatus(ClubStatus status);
}
