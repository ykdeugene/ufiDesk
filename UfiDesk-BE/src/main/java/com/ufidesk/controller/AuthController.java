package com.ufidesk.controller;

import com.ufidesk.dto.ApiResponse;
import com.ufidesk.dto.LoginRequest;
import com.ufidesk.dto.LoginResponse;
import com.ufidesk.model.User;
import com.ufidesk.security.CustomUserDetails;
import com.ufidesk.service.NotificationService;
import com.ufidesk.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final UserService userService;
    private final NotificationService notificationService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest, 
                                   HttpServletRequest request) {
        log.info("Login attempt for email: {}", loginRequest.getEmail());

        // Find user by email
        Optional<User> userOptional = userService.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            log.warn("Login failed: User not found - {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password"));
        }
        
        User user = userOptional.get();
        
        // Check if user account is locked due to failed login attempts
        if (userService.isAccountLocked(user)) {
            log.warn("Login failed: Account locked - {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Account is temporarily locked due to too many failed login attempts"));
        }

        // Check if user is enabled
        if (!user.isEnabled()) {
            log.warn("Login failed: User account disabled - {}", loginRequest.getEmail());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Account is disabled"));
        }

        // Validate encrypted password (frontend sends encrypted password with email + loginTime as salt)
        if (!userService.validateEncryptedPassword(user, loginRequest.getPassword(),
                loginRequest.getEmail(), loginRequest.getLoginTime())) {
            log.warn("Login failed: Invalid password for user - {}", loginRequest.getEmail());
            userService.handleFailedLoginAttempt(user);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password"));
        }
        
        // Password is valid - handle successful login
        userService.handleSuccessfulLogin(user);

        // Check if account is locked
        boolean accountLocked = user.getAccountLockedUntil() != null &&
                java.time.LocalDateTime.now().isBefore(user.getAccountLockedUntil());

        // Set up Spring Security authentication context with individual user fields
        CustomUserDetails userDetails = new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.isEnabled(),
                user.isAdmin(),
                accountLocked
        );
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authentication);
        SecurityContextHolder.setContext(securityContext);

        // Create session with security context
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("email", user.getEmail());
        session.setAttribute("role", user.getRole());
        session.setAttribute("admin", user.isAdmin());
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

        log.info("✅ Login successful for user: {} (role: {}, admin: {})",
                user.getEmail(), user.getRole(), user.isAdmin());

        // Send any pending notifications to the user
        notificationService.sendPendingNotificationsOnLogin(user.getEmail());

        LoginResponse response = new LoginResponse(
                user.getEmail(),
                user.getRole(),
                user.isAdmin(),
                "Login successful"
        );
        
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            String email = (String) session.getAttribute("email");
            session.invalidate();
            log.info("User logged out: {}", email);
            return ResponseEntity.ok(ApiResponse.<Void>success("Logout successful", null));
        }
        return ResponseEntity.ok(ApiResponse.<Void>success("No active session", null));
    }
    
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<LoginResponse>> checkSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("userId") != null) {
            LoginResponse response = new LoginResponse(
                    (String) session.getAttribute("email"),
                    (String) session.getAttribute("role"),
                    (Boolean) session.getAttribute("admin"),
                    "Session active"
            );
            return ResponseEntity.ok(ApiResponse.success("Session active", response));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("No active session"));
    }
}
