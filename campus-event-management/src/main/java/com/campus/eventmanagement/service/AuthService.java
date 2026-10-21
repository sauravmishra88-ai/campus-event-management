
package com.campus.eventmanagement.service;

import com.campus.eventmanagement.dto.RegisterRequest;
import com.campus.eventmanagement.entity.User;
import com.campus.eventmanagement.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.campus.eventmanagement.dto.LoginRequest;
import java.util.Locale;
import org.springframework.security.authentication
        .BadCredentialsException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase();

        // 1. Check duplicate email
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        // 2. Create new user
        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);

        // 3. Hash password before saving
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        // Entity default role is STUDENT.
        // Never accept ADMIN role from public registration.

        // 4. Save user in MySQL
        return userRepository.save(user);
    }
    public User login(LoginRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BadCredentialsException(
                                "Invalid email or password"
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new BadCredentialsException(
                    "Invalid email or password"
            );
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new org.springframework.web.server
                    .ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Account is inactive"
            );
        }

        return user;
    }
}

