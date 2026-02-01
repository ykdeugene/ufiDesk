package com.ufidesk.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    private String passwordHash;
    
    private String email;
    
    private String role;
    
    private boolean enabled;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime lastLogin;

    // Account security fields
    private int failedLoginAttempts; // Track failed login attempts

    private LocalDateTime accountLockedUntil; // Account locked timestamp for brute force protection
}


