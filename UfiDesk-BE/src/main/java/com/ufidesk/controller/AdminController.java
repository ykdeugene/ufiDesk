package com.ufidesk.controller;

import com.ufidesk.dto.ApiResponse;
import com.ufidesk.dto.CreateUserRequest;
import com.ufidesk.dto.UpdateUserRequest;
import com.ufidesk.dto.UserDto;
import com.ufidesk.model.User;
import com.ufidesk.security.EncryptionUtils;
import com.ufidesk.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserService userService;

    private static final String SUPERADMIN_EMAIL = "superadmin@ufidesk.com";

    /**
     * Get all users with their email, admin status, and active status
     *
     * @return List of all users (email, isAdmin, isActive)
     */
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SUPERADMIN')")
    @GetMapping("/get-users")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        log.info("Fetching all users");

        List<User> users = userService.getAllUsers();

        List<UserDto> userDtos = users.stream()
                .map(user -> new UserDto(
                        user.getEmail(),
                        user.isAdmin(),
                        user.isEnabled()
                ))
                .collect(Collectors.toList());

        log.info("Retrieved {} users", userDtos.size());

        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", userDtos));
    }

    /**
     * Update user details (email, password, admin status, active status)
     *
     * Protection: superadmin@ufidesk.com cannot be inactivated
     *
     * @param updateUserRequest Contains email, encrypted password, isAdmin, isActive, updateTime
     * @return Updated user details or error response
     */
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SUPERADMIN')")
    @PostMapping("/update-user")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@Valid @RequestBody UpdateUserRequest updateUserRequest) {
        log.info("Attempting to update user: {}", updateUserRequest.getEmail());

        // Protection: Prevent superadmin deactivation
        if (SUPERADMIN_EMAIL.equals(updateUserRequest.getEmail()) && !updateUserRequest.isActive()) {
            log.warn("⚠️  Attempted to deactivate superadmin account: {}", SUPERADMIN_EMAIL);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Cannot deactivate the superadmin account"));
        }

        try {
            // Fetch the user
            User user = userService.findByEmail(updateUserRequest.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + updateUserRequest.getEmail()));

            // Update password if provided
            if (updateUserRequest.getPassword() != null && !updateUserRequest.getPassword().isEmpty()) {
                log.debug("Updating password for user: {}", updateUserRequest.getEmail());

                // Decrypt the password using email and updateTime
                String decryptedPassword = EncryptionUtils.decryptPassword(
                        updateUserRequest.getPassword(),
                        updateUserRequest.getEmail(),
                        updateUserRequest.getUpdateTime()
                );

                // Hash and update
                user.setPasswordHash(userService.hashPassword(decryptedPassword));
                log.info("✅ Password updated for user: {}", updateUserRequest.getEmail());
            }

            // Update admin status
            boolean previousAdmin = user.isAdmin();
            user.setAdmin(updateUserRequest.isAdmin());

            if (previousAdmin != updateUserRequest.isAdmin()) {
                log.info("Admin status changed for user {}: {} → {}",
                        updateUserRequest.getEmail(), previousAdmin, updateUserRequest.isAdmin());
            }

            // Update active status
            boolean previousActive = user.isEnabled();
            user.setEnabled(updateUserRequest.isActive());

            if (previousActive != updateUserRequest.isActive()) {
                log.info("Active status changed for user {}: {} → {}",
                        updateUserRequest.getEmail(), previousActive, updateUserRequest.isActive());
            }

            // Save updated user
            User updatedUser = userService.saveUser(user);

            UserDto userDto = new UserDto(
                    updatedUser.getEmail(),
                    updatedUser.isAdmin(),
                    updatedUser.isEnabled()
            );

            log.info("✅ User updated successfully: {}", updateUserRequest.getEmail());

            return ResponseEntity.ok(ApiResponse.success("User updated successfully", userDto));

        } catch (Exception e) {
            log.error("❌ Failed to update user {}: {}", updateUserRequest.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update user: " + e.getMessage()));
        }
    }

    /**
     * Create a new user
     *
     * @param createUserRequest Contains email, encrypted password, isAdmin, isActive, createTime
     * @return Created user details or error response
     */
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SUPERADMIN')")
    @PostMapping("/create-user")
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest createUserRequest) {
        log.info("Attempting to create new user: {}", createUserRequest.getEmail());

        try {
            // Check if user already exists
            if (userService.findByEmail(createUserRequest.getEmail()).isPresent()) {
                log.warn("⚠️  Attempted to create user that already exists: {}", createUserRequest.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("User already exists: " + createUserRequest.getEmail()));
            }

            // Decrypt the password using email and createTime
            log.debug("Decrypting password for new user: {}", createUserRequest.getEmail());
            String decryptedPassword = EncryptionUtils.decryptPassword(
                    createUserRequest.getPassword(),
                    createUserRequest.getEmail(),
                    createUserRequest.getCreateTime()
            );

            // Create new user
            User newUser = new User();
            newUser.setEmail(createUserRequest.getEmail());
            newUser.setPasswordHash(userService.hashPassword(decryptedPassword));
            newUser.setAdmin(createUserRequest.isAdmin());
            newUser.setEnabled(createUserRequest.isActive());
            newUser.setRole(createUserRequest.isAdmin() ? "ADMIN" : "USER");
            newUser.setFailedLoginAttempts(0);
            newUser.setCreatedAt(java.time.LocalDateTime.now());

            // Save user
            User savedUser = userService.saveUser(newUser);

            UserDto userDto = new UserDto(
                    savedUser.getEmail(),
                    savedUser.isAdmin(),
                    savedUser.isEnabled()
            );

            log.info("✅ User created successfully: {} (admin: {}, active: {})",
                    createUserRequest.getEmail(), createUserRequest.isAdmin(), createUserRequest.isActive());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("User created successfully", userDto));

        } catch (Exception e) {
            log.error("❌ Failed to create user {}: {}", createUserRequest.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to create user: " + e.getMessage()));
        }
    }
}
