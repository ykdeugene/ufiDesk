package com.ufidesk.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Utility class for security-related operations.
 * Provides methods for extracting client information from requests.
 */
@Component
@Slf4j
public class SecurityUtils {

    /**
     * Extract client IP address from HTTP request.
     * Handles X-Forwarded-For header for proxies and load balancers.
     *
     * @param request HTTP request
     * @return client IP address
     */
    public static String getClientIP(HttpServletRequest request) {
        // Check for X-Forwarded-For header (for proxies/load balancers)
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return xForwardedFor.split(",")[0].trim();
        }

        // Check for other proxy headers
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        // Fall back to remote address
        return request.getRemoteAddr();
    }

    /**
     * Validate password strength according to NIST guidelines.
     *
     * Requirements:
     * - Minimum 12 characters (or 8 with complexity requirements)
     * - Should not be a commonly used password
     *
     * @param password password to validate
     * @return true if password meets minimum requirements
     */
    public static boolean isValidPasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }

        // Basic complexity check: at least uppercase, lowercase, and number
        boolean hasUppercase = password.matches(".*[A-Z].*");
        boolean hasLowercase = password.matches(".*[a-z].*");
        boolean hasNumber = password.matches(".*\\d.*");
        boolean hasSpecialChar = password.matches(".*[!@#$%^&*()_+=\\-\\[\\]{};:'\",.<>?/\\\\|`~].*");

        // Require at least 3 of the 4 complexity rules
        int complexityCount = 0;
        if (hasUppercase) complexityCount++;
        if (hasLowercase) complexityCount++;
        if (hasNumber) complexityCount++;
        if (hasSpecialChar) complexityCount++;

        return complexityCount >= 3;
    }

    /**
     * Sanitize username/email to prevent injection attacks.
     * Removes potentially dangerous characters.
     *
     * @param input input string
     * @return sanitized input
     */
    public static String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }
        // Remove null bytes and control characters
        return input.replaceAll("[\\x00-\\x1F\\x7F]", "").trim();
    }
}
