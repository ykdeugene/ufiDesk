package com.ufidesk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @NotBlank(message = "Email is required")
    private String email;

    private String password;

    private boolean admin;

    private boolean active;

    @NotBlank(message = "Update time is required")
    private String updateTime; // ISO-8601 format timestamp when update was initiated
}
