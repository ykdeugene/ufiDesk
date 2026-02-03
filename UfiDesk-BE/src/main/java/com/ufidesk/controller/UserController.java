package com.ufidesk.controller;

import com.ufidesk.dto.ApiResponse;
import com.ufidesk.dto.UserDto;
import com.ufidesk.dto.UserProfileUpdateRequest;
import com.ufidesk.model.User;
import com.ufidesk.security.EncryptionUtils;
import com.ufidesk.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for user profile management.
 *
 * Endpoints:
 * - PUT /user/update-profile - Update authenticated user's email and/or password
 *
 * Security Note: All endpoints enforce that the authenticated user can only modify their own profile.
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;

    /**
     * Update authenticated user's profile (email and/or password).
     *
     * IMPORTANT SECURITY: This endpoint updates the AUTHENTICATED USER's profile only.
     * Users CANNOT update other users' profiles. The authenticated user's email from the
     * security context is used to determine which user to update.
     *
     * This endpoint allows users to:
     * 1. Update their email address
     * 2. Update their password
     * 3. Update both email and password
     * 4. Do nothing if both fields are empty (no-op)
     *
     * Password update logic:
     * - If password field is blank or null, password is NOT updated
     * - If password is provided, it's decrypted and hashed using BCrypt (same logic as AdminController)
     * - Password is encrypted by frontend using email and updateTime as salt
     *
     * Email update logic:
     * - If email is provided, it will be updated for the authenticated user only
     * - Email must be unique (will return conflict error if already exists for another user)
     *
     * Only authenticated users can perform this operation, and only on their own profile.
     *
     * @param updateRequest Contains email (optional), password (optional), updateTime (required)
     * @return Updated user details (email, isAdmin, isActive)
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/update-profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(@Valid @RequestBody UserProfileUpdateRequest updateRequest) {
        // Get the AUTHENTICATED user (the one making the request)
        // This ensures users can ONLY update their own profile
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUserEmail = authentication.getName();

        log.info("User {} attempting to update their own profile", authenticatedUserEmail);

        try {
            // Fetch the authenticated user
            User user = userService.findByEmail(authenticatedUserEmail)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + authenticatedUserEmail));

            String originalEmail = user.getEmail();

            // Security verification: Ensure we're updating the authenticated user
            // This is already guaranteed by using authentication.getName(), but we log it for clarity
            log.debug("Profile update is for authenticated user: {} (original email: {})", authenticatedUserEmail, originalEmail);

            // Update email if provided
            if (updateRequest.getEmail() != null && !updateRequest.getEmail().trim().isEmpty()) {
                String newEmail = updateRequest.getEmail().trim();

                // Check if email is different from current email
                if (!newEmail.equals(originalEmail)) {
                    // Check if new email already exists for another user
                    if (userService.findByEmail(newEmail).isPresent()) {
                        log.warn("❌ Email already in use: {}. User {} cannot update to this email.", newEmail, authenticatedUserEmail);
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                .body(ApiResponse.error("Email already exists: " + newEmail));
                    }

                    // Update the authenticated user's email
                    user.setEmail(newEmail);
                    log.info("✅ Email updated for authenticated user {}: {} → {}", authenticatedUserEmail, originalEmail, newEmail);
                }
            }

            // Update password if provided
            if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
                log.debug("Updating password for authenticated user: {}", authenticatedUserEmail);

                // Decrypt the password using email and updateTime
                // Note: We use the CURRENT email (before update) as the salt for decryption
                String decryptedPassword = EncryptionUtils.decryptPassword(
                        updateRequest.getPassword(),
                        originalEmail, // Use original email for decryption
                        updateRequest.getUpdateTime()
                );

                // Hash and update using BCrypt (same logic as AdminController)
                user.setPasswordHash(userService.hashPassword(decryptedPassword));
                log.info("✅ Password updated for authenticated user: {}", authenticatedUserEmail);
            }

            // Save updated user
            User updatedUser = userService.saveUser(user);

            UserDto userDto = new UserDto(
                    updatedUser.getEmail(),
                    updatedUser.isAdmin(),
                    updatedUser.isEnabled()
            );

            log.info("✅ Profile update completed successfully for authenticated user: {}", authenticatedUserEmail);

            return ResponseEntity.ok(ApiResponse.success("Your profile has been updated successfully", userDto));

        } catch (IllegalArgumentException e) {
            log.error("❌ Authenticated user not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found"));
        } catch (Exception e) {
            log.error("❌ Failed to update profile for user {}: {}", authenticatedUserEmail, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update profile: " + e.getMessage()));
        }
    }
}
