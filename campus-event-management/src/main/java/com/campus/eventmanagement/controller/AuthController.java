
package com.campus.eventmanagement.controller;
import com.campus.eventmanagement.dto.LoginResponse;
import com.campus.eventmanagement.service.JwtService;
import com.campus.eventmanagement.dto.RegisterRequest;
import com.campus.eventmanagement.dto.UserResponse;
import com.campus.eventmanagement.entity.User;
import com.campus.eventmanagement.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.campus.eventmanagement.dto.LoginRequest;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(
            AuthService authService,
            JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(UserResponse.from(user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        User user = authService.login(request);

        String token = jwtService.generateToken(user);

        LoginResponse response = new LoginResponse(
                token,
                "Bearer",
                900000L,
                UserResponse.from(user)
        );

        return ResponseEntity.ok(response);
    }


    @GetMapping("/me")
    public ResponseEntity<String> me(
            org.springframework.security.core.Authentication authentication) {

        return ResponseEntity.ok(
                "Authenticated as: " + authentication.getName()
        );
    }

}

