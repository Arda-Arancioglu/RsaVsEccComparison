package com.encryption.comparison.service;

import com.encryption.comparison.model.CryptoTestConfig;
import com.encryption.comparison.model.CryptoTestResult;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringJUnitConfig
@SpringBootTest
class CryptoComparisonServiceTests {

    private CryptoComparisonService comparisonService;
    private RsaCryptoService rsaService;
    private EccCryptoService eccService;
    private SecurityEstimatorService securityEstimator;

    @BeforeEach
    void setUp() {
        rsaService = new RsaCryptoService();
        eccService = new EccCryptoService();
        securityEstimator = new SecurityEstimatorService();
        comparisonService = new CryptoComparisonService(rsaService, eccService, securityEstimator);
    }

    @Test
    void testComparisonWithValidConfig() {
        CryptoTestConfig config = new CryptoTestConfig();
        config.setDataSizes(new int[] { 16, 32 });
        config.setRsaKeySize(2048);
        config.setEccKeySize(256);

        List<CryptoTestResult> results = comparisonService.runComparison(config);

        assertEquals(4, results.size(), "Should have 2 algorithms × 2 data sizes = 4 results");

        // Verify all tests succeeded
        for (CryptoTestResult result : results) {
            assertTrue(result.isSuccess(),
                    "Test should succeed for " + result.getAlgorithm() +
                            " with key size " + result.getKeySize() +
                            " and data size " + result.getDataSize());
            assertNotNull(result.getSecurityEstimate());
            assertTrue(result.getKeyGenerationTime() > 0);
            assertTrue(result.getEncryptionTime() >= 0);
            assertTrue(result.getDecryptionTime() >= 0);
        }

        // Verify we have both algorithms
        long rsaCount = results.stream().filter(r -> "RSA".equals(r.getAlgorithm())).count();
        long eccCount = results.stream().filter(r -> "ECC".equals(r.getAlgorithm())).count();
        assertEquals(2, rsaCount, "Should have 2 RSA results");
        assertEquals(2, eccCount, "Should have 2 ECC results");
    }

    @Test
    void testComparisonWithLargeRsaData() {
        CryptoTestConfig config = new CryptoTestConfig();
        config.setDataSizes(new int[] { 300 }); // Too large for RSA-1024
        config.setRsaKeySize(1024);
        config.setEccKeySize(256);

        List<CryptoTestResult> results = comparisonService.runComparison(config);

        CryptoTestResult rsaResult = results.stream()
                .filter(r -> "RSA".equals(r.getAlgorithm()))
                .findFirst()
                .orElse(null);

        CryptoTestResult eccResult = results.stream()
                .filter(r -> "ECC".equals(r.getAlgorithm()))
                .findFirst()
                .orElse(null);

        assertNotNull(rsaResult);
        assertNotNull(eccResult);

        // RSA should fail with large data
        assertFalse(rsaResult.isSuccess(), "RSA should fail with data too large for key size");
        assertNotNull(rsaResult.getErrorMessage());

        // ECC should succeed
        assertTrue(eccResult.isSuccess(), "ECC should handle large data fine");
    }

    @Test
    void testPerformanceConsistency() {
        CryptoTestConfig config = new CryptoTestConfig();
        config.setDataSizes(new int[] { 32 });
        config.setRsaKeySize(2048);
        config.setEccKeySize(256);

        // Run the test multiple times
        List<CryptoTestResult> results1 = comparisonService.runComparison(config);
        List<CryptoTestResult> results2 = comparisonService.runComparison(config);

        assertEquals(results1.size(), results2.size());

        // Performance should be roughly consistent (within reasonable bounds)
        for (int i = 0; i < results1.size(); i++) {
            CryptoTestResult r1 = results1.get(i);
            CryptoTestResult r2 = results2.get(i);

            assertEquals(r1.getAlgorithm(), r2.getAlgorithm());
            assertEquals(r1.getKeySize(), r2.getKeySize());
            assertEquals(r1.getDataSize(), r2.getDataSize());

            if (r1.isSuccess() && r2.isSuccess()) {
                // Key generation times can vary significantly, but should be > 0
                assertTrue(r1.getKeyGenerationTime() > 0);
                assertTrue(r2.getKeyGenerationTime() > 0);

                // Encryption/decryption times should be relatively stable
                // Allow for some variance but not orders of magnitude
                double encryptRatio = r1.getEncryptionTime() / r2.getEncryptionTime();
                assertTrue(encryptRatio > 0.1 && encryptRatio < 10,
                        "Encryption times should be relatively consistent");

                double decryptRatio = r1.getDecryptionTime() / r2.getDecryptionTime();
                assertTrue(decryptRatio > 0.1 && decryptRatio < 10,
                        "Decryption times should be relatively consistent");
            }
        }
    }
}
