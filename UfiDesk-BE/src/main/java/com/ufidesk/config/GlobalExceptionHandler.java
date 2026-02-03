package com.ufidesk.config;

import com.ufidesk.dto.ApiResponse;
import com.mongodb.MongoInterruptedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

/**
 * Global exception handler for all uncaught exceptions.
 * Provides consistent error responses and logging for different exception types.
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle MongoDB interruption exceptions.
     * These occur when MongoDB connections timeout or are interrupted.
     */
    @ExceptionHandler(MongoInterruptedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMongoInterruptedException(
            MongoInterruptedException ex, WebRequest request) {
        log.error("MongoDB connection interrupted: {}", ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error("Database service temporarily unavailable. Please try again."));
    }

    /**
     * Handle interrupted exceptions (general thread interruption).
     * These can occur during concurrent operations or timeouts.
     */
    @ExceptionHandler(InterruptedException.class)
    public ResponseEntity<ApiResponse<Void>> handleInterruptedException(
            InterruptedException ex, WebRequest request) {
        log.error("Thread interrupted: {}", ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error("Request interrupted. Please try again."));
    }

    /**
     * Handle authorization denied exceptions.
     * These occur when @PreAuthorize validation fails.
     */
    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthorizationDeniedException(
            AuthorizationDeniedException ex, WebRequest request) {
        log.warn("Authorization denied: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied. You do not have permission to access this resource."));
    }

    /**
     * Handle user not found exceptions during authorization.
     * These occur when a user's session is still active but they've been deleted.
     */
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleUsernameNotFoundException(
            UsernameNotFoundException ex, WebRequest request) {
        log.warn("User not found during authorization: {}", ex.getMessage());

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("User not found. Session may have expired. Please log in again."));
    }

    /**
     * Handle generic runtime exceptions.
     * Catches any unhandled exceptions to prevent internal server errors from leaking details.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(
            RuntimeException ex, WebRequest request) {
        log.error("Unexpected runtime exception: {}", ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred. Please try again later."));
    }

    /**
     * Handle generic exceptions.
     * Catches any unhandled exceptions to prevent internal server errors from leaking details.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(
            Exception ex, WebRequest request) {
        log.error("Unexpected exception: {}", ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An unexpected error occurred. Please try again later."));
    }
}
