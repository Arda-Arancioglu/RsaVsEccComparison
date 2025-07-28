package com.encryption.comparison.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import java.security.*;

@Service
@Slf4j
public class RsaCryptoService implements CryptoService {
    private static final int[] SUPPORTED_KEY_SIZES = {1024, 2048, 3072, 4096};

    @Override
    public String getAlgorithmName() {
        return "RSA";
    }

    @Override
    public byte[] encrypt(byte[] data, Object publicKey) throws Exception {
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
        keyGen.initialize(keySize);
        KeyPair keyPair = keyGen.generateKeyPair();
        return new Object[]{keyPair.getPublic(), keyPair.getPrivate()};
    }

    @Override
    public int[] getSupportedKeySizes() {
        return SUPPORTED_KEY_SIZES;
    }
}