package com.ufidesk.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Encrypted password is required")
    private String password;

    private boolean admin;

    private boolean active;

    @NotBlank(message = "Create time is required")
    private String createTime; // ISO-8601 format timestamp when create was initiated
}
