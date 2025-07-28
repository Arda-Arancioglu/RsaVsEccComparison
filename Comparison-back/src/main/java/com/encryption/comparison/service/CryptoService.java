package com.encryption.comparison.service;

public interface CryptoService {
    String getAlgorithmName();
    byte[] encrypt(byte[] data, Object publicKey) throws Exception;
    byte[] decrypt(byte[] encryptedData, Object privateKey) throws Exception;
    Object[] generateKeyPair(int keySize) throws Exception;
    int[] getSupportedKeySizes();
}