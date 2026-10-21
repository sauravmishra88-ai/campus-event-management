
package com.campus.eventmanagement.config;

import com.campus.eventmanagement.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                // REST API: authentication will use tokens later
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )



                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/uploads/**"
                        ).permitAll()

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs"
                        ).permitAll()

                        .requestMatchers("/api/events/published")
                        .permitAll()

                        .requestMatchers("/api/events/*/register")
                        .hasRole("STUDENT")

                        .requestMatchers(HttpMethod.POST, "/api/events")
                        .hasAnyRole("ADMIN", "CLUB_MANAGER", "STUDENT")

                        .requestMatchers(HttpMethod.PATCH, "/api/events/*/publish")
                        .hasAnyRole("ADMIN", "CLUB_MANAGER", "STUDENT")

                        .requestMatchers(HttpMethod.PUT, "/api/events/*")
                        .hasAnyRole("ADMIN", "CLUB_MANAGER", "STUDENT")

                        .requestMatchers(HttpMethod.PATCH, "/api/events/*/cancel")
                        .hasAnyRole("ADMIN", "CLUB_MANAGER", "STUDENT")


                        .requestMatchers("/api/events/*/cancel-registration")
                        .hasRole("STUDENT")

                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        .requestMatchers("/api/manager/**")
                        .hasAnyRole("ADMIN", "CLUB_MANAGER")

                        .requestMatchers("/api/student/**")
                        .hasAnyRole("ADMIN", "CLUB_MANAGER", "STUDENT")

                        .requestMatchers("/api/events/**")
                        .hasAnyRole("ADMIN", "CLUB_MANAGER")

                        .requestMatchers(
                                "/api/clubs/*/approve",
                                "/api/clubs/*/reject",
                                "/api/clubs/pending"
                        ).hasRole("ADMIN")

                        .anyRequest().authenticated()
                )



                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );



        return http.build();
    }
}

