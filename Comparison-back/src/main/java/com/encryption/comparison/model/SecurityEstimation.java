package com.encryption.comparison.model;

import lombok.Data;

@Data
public class SecurityEstimation {
    private String algorithm;
    private int keySize;
    private int securityBits;
    private String estimatedBreakTime;
}