package com.encryption.comparison.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.security.SecureRandom;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

@SpringJUnitConfig
@SpringBootTest
class CryptoServiceTests {

    private RsaCryptoService rsaService;
    private EccCryptoService eccService;
    private SecureRandom secureRandom;

    @BeforeEach
    void setUp() {
        rsaService = new RsaCryptoService();
        eccService = new EccCryptoService();
        secureRandom = new SecureRandom();
    }

    @Test
    void testRsaEncryptionDecryption() throws Exception {
        // Test with different key sizes
        for (int keySize : rsaService.getSupportedKeySizes()) {
            // Calculate max data size for this key size
            int maxDataSize = (keySize / 8) - 11; // PKCS1 padding overhead

            // Test with smaller data sizes
            int[] testDataSizes = { 16, 32, Math.min(64, maxDataSize), Math.min(128, maxDataSize) };

            for (int dataSize : testDataSizes) {
                if (dataSize > maxDataSize)
                    continue;

                byte[] testData = new byte[dataSize];
                secureRandom.nextBytes(testData);

                Object[] keyPair = rsaService.generateKeyPair(keySize);
                byte[] encrypted = rsaService.encrypt(testData, keyPair[0]);
                byte[] decrypted = rsaService.decrypt(encrypted, keyPair[1]);

                assertArrayEquals(testData, decrypted,
                        "RSA decryption failed for key size " + keySize + " and data size " + dataSize);
            }
        }
    }

    @Test
    void testRsaDataSizeLimit() {
        assertThrows(IllegalArgumentException.class, () -> {
            Object[] keyPair = rsaService.generateKeyPair(1024);
            byte[] largeData = new byte[200]; // Too large for 1024-bit RSA
            secureRandom.nextBytes(largeData);
            rsaService.encrypt(largeData, keyPair[0]);
        }, "RSA should reject data that's too large");
    }

    @Test
    void testEccEncryptionDecryption() throws Exception {
        // Test with different key sizes
        for (int keySize : eccService.getSupportedKeySizes()) {
            // ECC can handle larger data sizes than RSA
            int[] testDataSizes = { 16, 32, 64, 128, 256, 512 };

            for (int dataSize : testDataSizes) {
                byte[] testData = new byte[dataSize];
                secureRandom.nextBytes(testData);

                Object[] keyPair = eccService.generateKeyPair(keySize);
                byte[] encrypted = eccService.encrypt(testData, keyPair[0]);
                byte[] decrypted = eccService.decrypt(encrypted, keyPair[1]);

                assertArrayEquals(testData, decrypted,
                        "ECC decryption failed for key size " + keySize + " and data size " + dataSize);
            }
        }
    }

    @Test
    void testKeyGeneration() throws Exception {
        // Test RSA key generation
        for (int keySize : rsaService.getSupportedKeySizes()) {
            Object[] keyPair = rsaService.generateKeyPair(keySize);
            assertNotNull(keyPair[0], "RSA public key should not be null");
            assertNotNull(keyPair[1], "RSA private key should not be null");
        }

        // Test ECC key generation
        for (int keySize : eccService.getSupportedKeySizes()) {
            Object[] keyPair = eccService.generateKeyPair(keySize);
            assertNotNull(keyPair[0], "ECC public key should not be null");
            assertNotNull(keyPair[1], "ECC private key should not be null");
        }
    }

    @Test
    void testServiceProperties() {
        assertEquals("RSA", rsaService.getAlgorithmName());
        assertEquals("ECC", eccService.getAlgorithmName());

        assertArrayEquals(new int[] { 1024, 2048, 3072, 4096 }, rsaService.getSupportedKeySizes());
        assertArrayEquals(new int[] { 256, 384, 521 }, eccService.getSupportedKeySizes());
    }

    @Test
    void testEncryptionConsistency() throws Exception {
        // Test that encryption produces different results each time (due to randomness)
        // but decryption always produces the same result

        byte[] testData = new byte[32];
        secureRandom.nextBytes(testData);

        // Test RSA
        Object[] rsaKeyPair = rsaService.generateKeyPair(2048);
        byte[] rsaEncrypted1 = rsaService.encrypt(testData, rsaKeyPair[0]);
        byte[] rsaEncrypted2 = rsaService.encrypt(testData, rsaKeyPair[0]);

        // Encrypted data should be different (RSA with padding uses randomness)
        assertFalse(Arrays.equals(rsaEncrypted1, rsaEncrypted2),
                "RSA encryption should produce different ciphertexts");

        // But decryption should always work
        assertArrayEquals(testData, rsaService.decrypt(rsaEncrypted1, rsaKeyPair[1]));
        assertArrayEquals(testData, rsaService.decrypt(rsaEncrypted2, rsaKeyPair[1]));

        // Test ECC
        Object[] eccKeyPair = eccService.generateKeyPair(256);
        byte[] eccEncrypted1 = eccService.encrypt(testData, eccKeyPair[0]);
        byte[] eccEncrypted2 = eccService.encrypt(testData, eccKeyPair[0]);

        // ECIES also uses randomness
        assertFalse(Arrays.equals(eccEncrypted1, eccEncrypted2),
                "ECC encryption should produce different ciphertexts");

        // But decryption should always work
        assertArrayEquals(testData, eccService.decrypt(eccEncrypted1, eccKeyPair[1]));
        assertArrayEquals(testData, eccService.decrypt(eccEncrypted2, eccKeyPair[1]));
    }
}
