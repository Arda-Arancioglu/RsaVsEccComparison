package com.encryption.comparison.model;

import lombok.Data;

@Data
public class DecryptionRequest {
    private String sessionId;
    private String encryptedData;
}