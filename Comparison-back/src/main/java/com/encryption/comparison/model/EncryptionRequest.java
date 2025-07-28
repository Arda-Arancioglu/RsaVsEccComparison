package com.encryption.comparison.model;

import lombok.Data;

@Data
public class EncryptionRequest {
    private String sessionId;
    private String data;
}