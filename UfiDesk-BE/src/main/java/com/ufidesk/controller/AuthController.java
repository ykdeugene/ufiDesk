package com.ufidesk.controller;

import com.ufidesk.dto.ApiResponse;
import com.ufidesk.dto.LoginRequest;
import com.ufidesk.dto.LoginResponse;
import com.ufidesk.model.User;
import com.ufidesk.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final UserService userService;
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest, 
                                   HttpServletRequest request) {
        log.info("Login attempt for username: {}", loginRequest.getUsername());
        
        // Find user by username
        Optional<User> userOptional = userService.findByUsername(loginRequest.getUsername());
        
        if (userOptional.isEmpty()) {
            log.warn("Login failed: User not found - {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        }
        
        User user = userOptional.get();
        
        // Check if user account is locked due to failed login attempts
        if (userService.isAccountLocked(user)) {
            log.warn("Login failed: Account locked - {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Account is temporarily locked due to too many failed login attempts"));
        }

        // Check if user is enabled
        if (!user.isEnabled()) {
            log.warn("Login failed: User account disabled - {}", loginRequest.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Account is disabled"));
        }

        // Validate password using BCrypt
        if (!userService.validatePassword(user, loginRequest.getPassword())) {
            log.warn("Login failed: Invalid password for user - {}", loginRequest.getUsername());
            userService.handleFailedLoginAttempt(user);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        }
        
        // Password is valid - handle successful login
        userService.handleSuccessfulLogin(user);

        // Create session
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("username", user.getUsername());
        session.setAttribute("role", user.getRole());
        
        log.info("Login successful for user: {}", user.getUsername());
        
        LoginResponse response = new LoginResponse(
                user.getUsername(),
                user.getRole(),
                "Login successful"
        );
        
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            String username = (String) session.getAttribute("username");
            session.invalidate();
            log.info("User logged out: {}", username);
            return ResponseEntity.ok(ApiResponse.<Void>success("Logout successful", null));
        }
        return ResponseEntity.ok(ApiResponse.<Void>success("No active session", null));
    }
    
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<LoginResponse>> checkSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("userId") != null) {
            LoginResponse response = new LoginResponse(
                    (String) session.getAttribute("username"),
                    (String) session.getAttribute("role"),
                    "Session active"
            );
            return ResponseEntity.ok(ApiResponse.success("Session active", response));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("No active session"));
    }
}
