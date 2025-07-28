package com.encryption.comparison.controller;

import com.encryption.comparison.model.*;
import com.encryption.comparison.service.CryptoComparisonService;
import com.encryption.comparison.service.EccCryptoService;
import com.encryption.comparison.service.RsaCryptoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/crypto")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For development only
public class CryptoComparisonController {

    private final CryptoComparisonService comparisonService;
    private final RsaCryptoService rsaService;
    private final EccCryptoService eccService;

    // Store keys for demonstration (in production, use proper key management)
    private final Map<String, Object[]> sessionKeys = new HashMap<>();

    @PostMapping("/generate/text")
    public Map<String, Object> generateRandomText(@RequestBody Map<String, Integer> request) {
        int length = request.getOrDefault("length", 100);
        byte[] randomData = new byte[length];
        new Random().nextBytes(randomData);
        String randomText = Base64.getEncoder().encodeToString(randomData);

        Map<String, Object> response = new HashMap<>();
        response.put("text", randomText);
        response.put("length", length);
        return response;
    }

    @PostMapping("/rsa/generateKeys")
    public Map<String, Object> generateRsaKeys(@RequestBody Map<String, Integer> request) {
        int keySize = request.getOrDefault("keySize", 2048);
        String sessionId = java.util.UUID.randomUUID().toString();

        Map<String, Object> response = new HashMap<>();
        long startTime = System.nanoTime();

        try {
            Object[] keyPair = rsaService.generateKeyPair(keySize);
            sessionKeys.put("rsa-" + sessionId, keyPair);

            long endTime = System.nanoTime();
            double elapsedTime = (endTime - startTime) / 1_000_000.0; // ms

            response.put("success", true);
            response.put("sessionId", sessionId);
            response.put("keySize", keySize);
            response.put("algorithm", "RSA");
            response.put("generationTime", elapsedTime);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    @PostMapping("/ecc/generateKeys")
    public Map<String, Object> generateEccKeys(@RequestBody Map<String, Integer> request) {
        int keySize = request.getOrDefault("keySize", 256);
        String sessionId = java.util.UUID.randomUUID().toString();

        Map<String, Object> response = new HashMap<>();
        long startTime = System.nanoTime();

        try {
            Object[] keyPair = eccService.generateKeyPair(keySize);
            sessionKeys.put("ecc-" + sessionId, keyPair);

            long endTime = System.nanoTime();
            double elapsedTime = (endTime - startTime) / 1_000_000.0; // ms

            response.put("success", true);
            response.put("sessionId", sessionId);
            response.put("keySize", keySize);
            response.put("algorithm", "ECC");
            response.put("generationTime", elapsedTime);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    @PostMapping("/rsa/encrypt")
    public Map<String, Object> encryptWithRsa(@RequestBody EncryptionRequest request) {
        Map<String, Object> response = new HashMap<>();
        String sessionId = request.getSessionId();
        Object[] keyPair = sessionKeys.get("rsa-" + sessionId);

        if (keyPair == null) {
            response.put("success", false);
            response.put("error", "No RSA key pair found for session ID");
            return response;
        }

        long startTime = System.nanoTime();
        try {
            byte[] data = request.getData().getBytes();
            byte[] encrypted = rsaService.encrypt(data, keyPair[0]);
            String encodedData = Base64.getEncoder().encodeToString(encrypted);

            long endTime = System.nanoTime();
            double elapsedTime = (endTime - startTime) / 1_000_000.0; // ms

            response.put("success", true);
            response.put("encryptedData", encodedData);
            response.put("algorithm", "RSA");
            response.put("encryptionTime", elapsedTime);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    @PostMapping("/ecc/encrypt")
    public Map<String, Object> encryptWithEcc(@RequestBody EncryptionRequest request) {
        Map<String, Object> response = new HashMap<>();
        String sessionId = request.getSessionId();
        Object[] keyPair = sessionKeys.get("ecc-" + sessionId);

        if (keyPair == null) {
            response.put("success", false);
            response.put("error", "No ECC key pair found for session ID");
            return response;
        }

        long startTime = System.nanoTime();
        try {
            byte[] data = request.getData().getBytes();
            byte[] encrypted = eccService.encrypt(data, keyPair[0]);
            String encodedData = Base64.getEncoder().encodeToString(encrypted);

            long endTime = System.nanoTime();
            double elapsedTime = (endTime - startTime) / 1_000_000.0; // ms

            response.put("success", true);
            response.put("encryptedData", encodedData);
            response.put("algorithm", "ECC");
            response.put("encryptionTime", elapsedTime);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    @PostMapping("/rsa/decrypt")
    public Map<String, Object> decryptWithRsa(@RequestBody DecryptionRequest request) {
        Map<String, Object> response = new HashMap<>();
        String sessionId = request.getSessionId();
        Object[] keyPair = sessionKeys.get("rsa-" + sessionId);

        if (keyPair == null) {
            response.put("success", false);
            response.put("error", "No RSA key pair found for session ID");
            return response;
        }

        long startTime = System.nanoTime();
        try {
            byte[] encryptedData = Base64.getDecoder().decode(request.getEncryptedData());
            byte[] decrypted = rsaService.decrypt(encryptedData, keyPair[1]);
            String decryptedText = new String(decrypted);

            long endTime = System.nanoTime();
            double elapsedTime = (endTime - startTime) / 1_000_000.0; // ms

            response.put("success", true);
            response.put("decryptedData", decryptedText);
            response.put("algorithm", "RSA");
            response.put("decryptionTime", elapsedTime);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    @PostMapping("/ecc/decrypt")
    public Map<String, Object> decryptWithEcc(@RequestBody DecryptionRequest request) {
        Map<String, Object> response = new HashMap<>();
        String sessionId = request.getSessionId();
        Object[] keyPair = sessionKeys.get("ecc-" + sessionId);

        if (keyPair == null) {
            response.put("success", false);
            response.put("error", "No ECC key pair found for session ID");
            return response;
        }

        long startTime = System.nanoTime();
        try {
            byte[] encryptedData = Base64.getDecoder().decode(request.getEncryptedData());
            byte[] decrypted = eccService.decrypt(encryptedData, keyPair[1]);
            String decryptedText = new String(decrypted);

            long endTime = System.nanoTime();
            double elapsedTime = (endTime - startTime) / 1_000_000.0; // ms

            response.put("success", true);
            response.put("decryptedData", decryptedText);
            response.put("algorithm", "ECC");
            response.put("decryptionTime", elapsedTime);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
        }

        return response;
    }

    // Keep the original comparison endpoints
    @PostMapping("/compare")
    public List<CryptoTestResult> compareAlgorithms(@RequestBody CryptoTestConfig config) {
        return comparisonService.runComparison(config);
    }

    @GetMapping("/compare/default")
    public List<CryptoTestResult> compareWithDefaults() {
        return comparisonService.runComparison(new CryptoTestConfig());
    }
}