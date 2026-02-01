package com.ufidesk.security;

import lombok.extern.slf4j.Slf4j;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Encryption utility for password encryption/decryption.
 *
 * Uses AES/CBC encryption with email and loginTime as salt for key derivation.
 * The IV is deterministically derived from the email and loginTime to ensure
 * both frontend and backend can encrypt/decrypt consistently.
 * This prevents plaintext passwords from being visible in network traffic.
 */
@Slf4j
public class EncryptionUtils {

    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final String KEY_ALGORITHM = "AES";
    private static final int KEY_SIZE = 256; // bits
    private static final int IV_SIZE = 128; // bits (16 bytes for AES)

    /**
     * Decrypt password that was encrypted on the frontend.
     *
     * @param encryptedPassword Base64-encoded encrypted password
     * @param email Email used as part of the salt
     * @param loginTime Login timestamp used as part of the salt
     * @return Decrypted plaintext password
     * @throws Exception if decryption fails
     */
    public static String decryptPassword(String encryptedPassword, String email, String loginTime) throws Exception {
        try {
            // Derive key and IV from email and loginTime
            SecretKeySpec key = deriveKey(email, loginTime);
            IvParameterSpec iv = deriveIV(email, loginTime);

            // Decode the Base64 encrypted password
            byte[] decodedPassword = Base64.getDecoder().decode(encryptedPassword);

            // Create cipher and decrypt
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key, iv);
            byte[] decryptedBytes = cipher.doFinal(decodedPassword);

            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to decrypt password for user: {} at time: {}", email, loginTime, e);
            throw new RuntimeException("Password decryption failed: " + e.getMessage(), e);
        }
    }

    /**
     * Encrypt password on the frontend (for reference/testing).
     *
     * @param plainPassword Plaintext password to encrypt
     * @param email Email used as part of the salt
     * @param loginTime Login timestamp used as part of the salt
     * @return Base64-encoded encrypted password
     * @throws Exception if encryption fails
     */
    public static String encryptPassword(String plainPassword, String email, String loginTime) throws Exception {
        try {
            // Derive key and IV from email and loginTime
            SecretKeySpec key = deriveKey(email, loginTime);
            IvParameterSpec iv = deriveIV(email, loginTime);

            // Create cipher and encrypt
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key, iv);
            byte[] encryptedBytes = cipher.doFinal(plainPassword.getBytes(StandardCharsets.UTF_8));

            // Encode to Base64
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            log.error("Failed to encrypt password for user: {} at time: {}", email, loginTime, e);
            throw new RuntimeException("Password encryption failed: " + e.getMessage(), e);
        }
    }

    /**
     * Derive a 256-bit AES key from email and loginTime.
     *
     * Uses SHA-256 hash of concatenated email and loginTime.
     * The resulting 256-bit hash becomes the AES key.
     *
     * @param email Email as part of salt
     * @param loginTime Login timestamp as part of salt
     * @return SecretKeySpec for AES encryption
     * @throws Exception if key derivation fails
     */
    private static SecretKeySpec deriveKey(String email, String loginTime) throws Exception {
        // Combine email and loginTime as salt material
        String salt = email + ":" + loginTime;

        // Hash using SHA-256 to get 256 bits (32 bytes)
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = digest.digest(salt.getBytes(StandardCharsets.UTF_8));

        // Create AES key spec (SHA-256 produces exactly 256 bits)
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, KEY_ALGORITHM);
    }

    /**
     * Derive a 128-bit IV (Initialization Vector) from email and loginTime.
     *
     * Uses SHA-256 hash of concatenated email + "IV" + loginTime, then takes first 16 bytes.
     * This ensures a deterministic IV that can be recreated on the frontend.
     *
     * @param email Email as part of IV derivation
     * @param loginTime Login timestamp as part of IV derivation
     * @return IvParameterSpec for AES/CBC mode
     * @throws Exception if IV derivation fails
     */
    private static IvParameterSpec deriveIV(String email, String loginTime) throws Exception {
        // Create a different hash for IV to distinguish from key
        String ivSalt = email + ":IV:" + loginTime;

        // Hash using SHA-256
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] ivBytes = digest.digest(ivSalt.getBytes(StandardCharsets.UTF_8));

        // Take first 16 bytes (128 bits) for AES IV
        return new IvParameterSpec(ivBytes, 0, 16);
    }
}
