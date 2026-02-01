package com.ufidesk.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Custom UserDetails implementation for Spring Security.
 * Implements Serializable to work with MongoDB session storage.
 * Stores only necessary user information, not the entire User entity.
 */
@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails, Serializable {

    private static final long serialVersionUID = 1L;

    private final String userId;
    private final String email;
    private final String passwordHash;
    private final String role;
    private final boolean enabled;
    private final boolean admin;
    private final boolean accountLocked;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();

        if (role != null) {
            // Add role as authority with ROLE_ prefix
            authorities.add(new SimpleGrantedAuthority(role));
        }

        // Add ADMIN authority if user is admin
        if (admin) {
            authorities.add(new SimpleGrantedAuthority("ADMIN"));
        }

        // Add USER authority as default
        if (!authorities.contains(new SimpleGrantedAuthority("USER"))) {
            authorities.add(new SimpleGrantedAuthority("USER"));
        }

        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !accountLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    // Getters for user information
    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public boolean isAdmin() {
        return admin;
    }
}
