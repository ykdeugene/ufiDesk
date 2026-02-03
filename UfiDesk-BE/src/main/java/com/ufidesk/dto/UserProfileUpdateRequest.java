package com.ufidesk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user profile updates (email and/or password).
 *
 * This request updates the authenticated user's OWN profile only.
 * The authenticated user cannot update other users' profiles.
 *
 * Fields:
 * - email: Optional. If provided, email will be updated for the authenticated user.
 *          Must be unique (not already used by another user).
 * - password: Optional. If blank or null, password will not be updated.
 * - updateTime: Required. ISO-8601 format timestamp when update was initiated.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateRequest {

    private String email; // Blank/null means don't update email

    private String password; // Blank/null means don't update password

    private String updateTime; // ISO-8601 format timestamp when update was initiated
}
