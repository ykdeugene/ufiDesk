package com.ufidesk.service;

import com.ufidesk.model.User;
import com.ufidesk.repository.UserRepository;
import com.ufidesk.security.EncryptionUtils;
import com.ufidesk.security.SecurityUtils;
import java.util.List;
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
     * Find user by email
     * @param email the email to search for
     * @return Optional containing the user if found
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
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
     * Validate client-hashed password against stored hash.
     * The frontend pre-hashes the password before sending it.
     * We compare the received hash directly with the stored hash.
     *
     * @param user the user entity with stored password hash
     * @param clientHashedPassword the hashed password received from frontend
     * @return true if hashes match
     */
    public boolean validateClientHashedPassword(User user, String clientHashedPassword) {
        if (clientHashedPassword == null || clientHashedPassword.isEmpty()) {
            return false;
        }
        return user.getPasswordHash().equals(clientHashedPassword);
    }

    /**
     * Validate encrypted password from frontend.
     *
     * Decrypts the password using email and loginTime, then validates against BCrypt hash.
     *
     * Flow:
     * 1. Frontend encrypts plaintext password with AES/CBC using derived key+IV
     * 2. Backend decrypts to get plaintext password
     * 3. BCrypt.matches() hashes plaintext and compares with stored BCrypt hash
     *
     * @param user the user entity with stored password hash
     * @param encryptedPassword Base64-encoded encrypted password from frontend
     * @param email Email used for decryption
     * @param loginTime Login timestamp used for decryption
     * @return true if decrypted password matches stored hash
     */
    public boolean validateEncryptedPassword(User user, String encryptedPassword, String email, String loginTime) {
      try {
        // Decrypt the password to get plaintext
        String decryptedPassword = EncryptionUtils.decryptPassword(
            encryptedPassword, email, loginTime);


        // **TEMPORARY: Generate and log the BCrypt hash for DB storage**
        // Remove this in production!
        log.debug("Decrypted password for user {}: {}", email, decryptedPassword);
        String generatedHash = passwordEncoder.encode(decryptedPassword);
        log.debug("HASH_FOR_DB - User {}: {}", email, generatedHash);
        log.debug("Copy this hash to your MongoDB setup script ^^^");

        // Validate decrypted plaintext password against stored BCrypt hash
        boolean isValid = passwordEncoder.matches(decryptedPassword, user.getPasswordHash());

        if (!isValid) {
          log.warn("Password validation failed for user: {}", email);
        } else {
          log.debug("Password validation successful for user: {}", email);
        }

        return isValid;
      } catch (Exception e) {
        log.error("Failed to validate encrypted password for user: {}", email, e);
        return false;
      }
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
            log.warn("Account locked due to {} failed login attempts: {}", MAX_FAILED_ATTEMPTS, user.getEmail());
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
        log.info("Successful login for user: {}", user.getEmail());
    }

    /**
     * Create a new user with validation
     * @param email the user's email (used as login identifier)
     * @param rawPassword the raw password (will be hashed)
     * @param role the user's role
     * @return the created user
     * @throws IllegalArgumentException if email exists or password is weak
     */
    public User createUser(String email, String rawPassword, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        if (!SecurityUtils.isValidPasswordStrength(rawPassword)) {
            throw new IllegalArgumentException(
                "Password does not meet security requirements. " +
                "Minimum 8 characters with at least 3 of: uppercase, lowercase, numbers, special characters"
            );
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role != null ? role : "USER");
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);

        return userRepository.save(user);
    }

    /**
     * Create a new user with a client-hashed password (already hashed on frontend)
     * @param email the user's email (used as login identifier)
     * @param clientHashedPassword the hashed password from frontend
     * @param role the user's role
     * @return the created user
     * @throws IllegalArgumentException if email exists
     */
    public User createUserWithHashedPassword(String email, String clientHashedPassword, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (clientHashedPassword == null || clientHashedPassword.isEmpty()) {
            throw new IllegalArgumentException("Password hash cannot be empty");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(clientHashedPassword);
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

    /**
     * Get all users from the database
     * @return List of all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Hash a plaintext password using BCrypt
     * @param plainPassword the plaintext password to hash
     * @return the BCrypt hashed password
     */
    public String hashPassword(String plainPassword) {
        return passwordEncoder.encode(plainPassword);
    }

    /**
     * Save a user to the database
     * @param user the user to save
     * @return the saved user
     */
    public User saveUser(User user) {
        return userRepository.save(user);
    }
}
