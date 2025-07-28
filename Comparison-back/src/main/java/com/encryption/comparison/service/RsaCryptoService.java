package com.encryption.comparison.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import java.security.*;

@Service
@Slf4j
public class RsaCryptoService implements CryptoService {
    private static final int[] SUPPORTED_KEY_SIZES = { 1024, 2048, 3072, 4096 };

    @Override
    public String getAlgorithmName() {
        return "RSA";
    }

    @Override
    public byte[] encrypt(byte[] data, Object publicKey) throws Exception {
        // RSA can only encrypt data smaller than key size - padding
        // For PKCS1Padding, max data size = (key_size_bits / 8) - 11
        // We need to get the actual key size from the key itself
        java.security.interfaces.RSAPublicKey rsaKey = (java.security.interfaces.RSAPublicKey) publicKey;
        int keySizeBits = rsaKey.getModulus().bitLength();
        int maxDataSize = (keySizeBits / 8) - 11; // PKCS1 padding overhead

        if (data.length > maxDataSize) {
            throw new IllegalArgumentException("Data too large for RSA encryption. Max size: " + maxDataSize
                    + " bytes, got: " + data.length + " bytes");
        }

        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, (PublicKey) publicKey);
        return cipher.doFinal(data);
    }

    @Override
    public byte[] decrypt(byte[] encryptedData, Object privateKey) throws Exception {
        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.DECRYPT_MODE, (PrivateKey) privateKey);
        return cipher.doFinal(encryptedData);
    }

    @Override
    public Object[] generateKeyPair(int keySize) throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(keySize, new SecureRandom());
        KeyPair keyPair = keyGen.generateKeyPair();
        return new Object[] { keyPair.getPublic(), keyPair.getPrivate() };
    }

    @Override
    public int[] getSupportedKeySizes() {
        return SUPPORTED_KEY_SIZES;
    }
}