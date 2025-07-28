package com.encryption.comparison.model;

import lombok.Data;

@Data
public class CryptoTestResult {
    private String algorithm;
    private int dataSize;
    private int keySize;
    private double keyGenerationTime; // ms
    private double encryptionTime; // ms
    private double decryptionTime; // ms
    private SecurityEstimation securityEstimate;
    private boolean success;
    private String errorMessage;
}