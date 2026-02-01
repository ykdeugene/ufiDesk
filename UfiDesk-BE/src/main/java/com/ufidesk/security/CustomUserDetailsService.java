package com.ufidesk.security;

import com.ufidesk.model.User;
import com.ufidesk.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom UserDetailsService for Spring Security authentication.
 * Loads user details from the database using email as username.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final UserService userService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);

        User user = userService.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", email);
                    return new UsernameNotFoundException("User not found: " + email);
                });

        log.debug("User loaded successfully: {} (role: {}, admin: {})",
                email, user.getRole(), user.isAdmin());

        // Check if account is locked
        boolean accountLocked = user.getAccountLockedUntil() != null &&
                java.time.LocalDateTime.now().isBefore(user.getAccountLockedUntil());

        // Create CustomUserDetails with individual fields (not the User entity)
        // This allows it to be serializable for MongoDB session storage
        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.isEnabled(),
                user.isAdmin(),
                accountLocked
        );
    }
}
