package com.ufidesk.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiter service to prevent brute force attacks on login endpoint.
 *
 * Industry standard: Allow 5 login attempts per 15 minutes per IP address.
 */
@Service
@Slf4j
public class RateLimiterService {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    // 5 attempts per 15 minutes
    private static final long REQUESTS = 5;
    private static final long MINUTES = 15;

    /**
     * Check if request is allowed under rate limit policy
     * @param key typically an IP address or username
     * @return true if allowed, false if rate limited
     */
    public boolean isAllowed(String key) {
        Bucket bucket = cache.computeIfAbsent(key, k -> createNewBucket());
        boolean allowed = bucket.tryConsume(1);

        if (!allowed) {
            log.warn("Rate limit exceeded for key: {}", key);
        }

        return allowed;
    }

    /**
     * Get remaining attempts for a key
     * @param key typically an IP address or username
     * @return number of remaining attempts
     */
    public long getRemainingAttempts(String key) {
        Bucket bucket = cache.get(key);
        if (bucket == null) {
            return REQUESTS;
        }
        return Math.max(0, REQUESTS - bucket.estimateAbilityToConsume(1).getRemainingTokens());
    }

    /**
     * Reset rate limit for a key (useful after successful login)
     * @param key typically an IP address
     */
    public void reset(String key) {
        cache.remove(key);
        log.debug("Rate limit reset for key: {}", key);
    }

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(REQUESTS, Refill.intervally(REQUESTS, Duration.ofMinutes(MINUTES)));
        return Bucket4j.builder()
                .addLimit(limit)
                .build();
    }
}
