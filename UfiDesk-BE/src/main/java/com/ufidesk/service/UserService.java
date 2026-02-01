package com.ufidesk.service;

import com.ufidesk.model.User;
import com.ufidesk.repository.UserRepository;
import com.ufidesk.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * User service with security-focused operations.
 *
 * Implements:
 * - Password validation and hashing (BCrypt)
 * - Account lockout after failed login attempts
 * - Failed login attempt tracking
 * - Password strength validation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    // Account lockout configuration
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCKOUT_DURATION_MINUTES = 15;

    /**
     * Find user by username
     * @param username the username to search for
     * @return Optional containing the user if found
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Validate provided password against stored hash using BCrypt.
     * Industry standard comparison that's resistant to timing attacks.
     *
     * @param user the user entity with stored password hash
     * @param rawPassword the raw password to validate
     * @return true if password matches
     */
    public boolean validatePassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }
    
    /**
     * Check if user account is locked due to failed login attempts
     * @param user the user to check
     * @return true if account is currently locked
     */
    public boolean isAccountLocked(User user) {
        if (user.getAccountLockedUntil() == null) {
            return false;
        }

        if (LocalDateTime.now().isBefore(user.getAccountLockedUntil())) {
            return true;
        }

        // Unlock the account if lockout period has expired
        user.setAccountLockedUntil(null);
        user.setFailedLoginAttempts(0);
        userRepository.save(user);
        return false;
    }

    /**
     * Handle failed login attempt - increment counter and lock if needed
     * @param user the user with failed login
     */
    public void handleFailedLoginAttempt(User user) {
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

        if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
            // Lock the account for LOCKOUT_DURATION_MINUTES
            user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
            log.warn("Account locked due to {} failed login attempts: {}", MAX_FAILED_ATTEMPTS, user.getUsername());
        }

        userRepository.save(user);
    }

    /**
     * Handle successful login - reset failed attempts counter
     * @param user the user with successful login
     */
    public void handleSuccessfulLogin(User user) {
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        log.info("Successful login for user: {}", user.getUsername());
    }

    /**
     * Create a new user with validation
     * @param username the username
     * @param rawPassword the raw password (will be hashed)
     * @param email the user's email
     * @param role the user's role
     * @return the created user
     * @throws IllegalArgumentException if username exists or password is weak
     */
    public User createUser(String username, String rawPassword, String email, String role) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        if (!SecurityUtils.isValidPasswordStrength(rawPassword)) {
            throw new IllegalArgumentException(
                "Password does not meet security requirements. " +
                "Minimum 8 characters with at least 3 of: uppercase, lowercase, numbers, special characters"
            );
        }

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setEmail(email);
        user.setRole(role != null ? role : "USER");
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);

        return userRepository.save(user);
    }
    
    /**
     * Update user's last login timestamp
     * @param user the user to update
     */
    public void updateLastLogin(User user) {
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
    }
}
