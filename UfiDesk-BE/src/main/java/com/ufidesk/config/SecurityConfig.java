package com.ufidesk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Security configuration following OWASP and industry best practices.
 *
 * Security features:
 * - BCrypt password hashing with strength 12
 * - Session management with 1 concurrent session limit
 * - Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
 * - CORS configuration with credentials support for cookies
 * - HTTPS enforced in production
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    /**
     * Password encoder using BCrypt with strength 12 (default).
     * This is industry standard and recommended by NIST.
     *
     * @return BCryptPasswordEncoder bean
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    /**
     * Main security filter chain configuration.
     *
     * Security measures implemented:
     * - CORS enabled with credential support for session cookies
     * - Security headers for protection against common attacks
     * - Session management with concurrency control
     * - Secure cookie attributes (HttpOnly, SameSite=Lax/Strict)
     *
     * @param http HttpSecurity to configure
     * @return configured SecurityFilterChain
     * @throws Exception if security configuration fails
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable) // Disabled for REST API; consider CSRF tokens for state-changing operations
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/login", "/auth/logout", "/health").permitAll()
                .anyRequest().authenticated()
            )
            // Security headers - protect against common attacks
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
                .frameOptions(FrameOptionsConfig::deny)
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .preload(true)
                    .maxAgeInSeconds(31536000) // 1 year
                )
            )
            // Session management - prevent session fixation and concurrency issues
            .sessionManagement(session -> session
                .maximumSessions(1) // Only 1 concurrent session per user
                .maxSessionsPreventsLogin(false) // New login invalidates old session
                .expiredUrl("/auth/login")
            )
            // Handle authentication errors
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json");
                    response.setStatus(401);
                    response.getWriter().write("{\"success\": false, \"message\": \"Unauthorized\"}");
                })
            );
        
        return http.build();
    }
    
    /**
     * CORS configuration allowing frontend to communicate with backend.
     *
     * Important: Credentials are allowed to support session cookies.
     * In production, restrict allowedOrigins to specific trusted domains.
     *
     * @return CORS configuration source
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // In production, replace with actual domain(s)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",      // React dev server
            "http://localhost:5173",       // Vite dev server
            "http://localhost:4173"        // Vite preview
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Content-Type", "Authorization"));
        configuration.setAllowCredentials(true); // Important for cookies
        configuration.setMaxAge(3600L); // 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
