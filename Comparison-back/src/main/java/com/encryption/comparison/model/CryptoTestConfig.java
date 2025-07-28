package com.encryption.comparison.model;

import lombok.Data;

@Data
public class CryptoTestConfig {
    private int[] dataSizes = {1024, 10240, 102400}; // Data sizes in bytes
    private int rsaKeySize = 2048;
    private int eccKeySize = 256;
}