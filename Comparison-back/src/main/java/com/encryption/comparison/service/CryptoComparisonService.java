package com.encryption.comparison.service;

import com.encryption.comparison.model.CryptoTestConfig;
import com.encryption.comparison.model.CryptoTestResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CryptoComparisonService {
    private final RsaCryptoService rsaService;
    private final EccCryptoService eccService;
    private final SecurityEstimatorService securityEstimator;
    private final SecureRandom secureRandom = new SecureRandom();

    public List<CryptoTestResult> runComparison(CryptoTestConfig config) {
        List<CryptoTestResult> results = new ArrayList<>();

        for (int dataSize : config.getDataSizes()) {
            byte[] testData = generateRandomData(dataSize);

            results.add(testAlgorithm(rsaService, testData, config.getRsaKeySize()));
            results.add(testAlgorithm(eccService, testData, config.getEccKeySize()));
        }

        return results;
    }

    private CryptoTestResult testAlgorithm(CryptoService service, byte[] data, int keySize) {
        CryptoTestResult result = new CryptoTestResult();
        result.setAlgorithm(service.getAlgorithmName());
        result.setDataSize(data.length);
        result.setKeySize(keySize);

        try {
            // Validate key size is supported
            boolean supportedKeySize = false;
            for (int supported : service.getSupportedKeySizes()) {
                if (supported == keySize) {
                    supportedKeySize = true;
                    break;
                }
            }
            if (!supportedKeySize) {
                throw new IllegalArgumentException("Unsupported key size: " + keySize);
            }

            // Generate keys
            long keyGenStart = System.nanoTime();
            Object[] keyPair = service.generateKeyPair(keySize);
            long keyGenTime = System.nanoTime() - keyGenStart;
            result.setKeyGenerationTime(keyGenTime / 1_000_000.0); // ms

            // Encrypt
            long encryptStart = System.nanoTime();
            byte[] encrypted = service.encrypt(data, keyPair[0]);
            long encryptTime = System.nanoTime() - encryptStart;
            result.setEncryptionTime(encryptTime / 1_000_000.0); // ms

            // Decrypt
            long decryptStart = System.nanoTime();
            byte[] decrypted = service.decrypt(encrypted, keyPair[1]);
            long decryptTime = System.nanoTime() - decryptStart;
            result.setDecryptionTime(decryptTime / 1_000_000.0); // ms

            // Verify decryption worked correctly
            if (!java.util.Arrays.equals(data, decrypted)) {
                throw new RuntimeException("Decryption failed - data mismatch");
            }

            // Calculate theoretical break time
            result.setSecurityEstimate(securityEstimator.estimateBreakTime(service.getAlgorithmName(), keySize));

            result.setSuccess(true);
            log.debug("Successfully tested {} with key size {} and data size {}",
                    service.getAlgorithmName(), keySize, data.length);
        } catch (Exception e) {
            log.error("Error testing {} with key size {}: {}",
                    service.getAlgorithmName(), keySize, e.getMessage());
            result.setSuccess(false);
            result.setErrorMessage(e.getMessage());
        }

        return result;
    }

    private byte[] generateRandomData(int size) {
        byte[] data = new byte[size];
        secureRandom.nextBytes(data);
        return data;
    }
}