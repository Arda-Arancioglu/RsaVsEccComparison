package com.encryption.comparison.service;

import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;

@Service
public class RsaAesHybridService implements CryptoService {

    private static final String RSA_ALGORITHM = "RSA";
    private static final String AES_ALGORITHM = "AES";
    private static final String RSA_TRANSFORMATION = "RSA/ECB/PKCS1Padding";
    private static final String AES_TRANSFORMATION = "AES/ECB/PKCS5Padding";
    private static final int AES_KEY_SIZE = 256;

    @Override
    public Object[] generateKeyPair(int keySize) throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance(RSA_ALGORITHM);
        keyGen.initialize(keySize, new SecureRandom());
        KeyPair keyPair = keyGen.generateKeyPair();
        return new Object[] { keyPair.getPublic(), keyPair.getPrivate() };
    }

    @Override
    public int[] getSupportedKeySizes() {
        return new int[] { 1024, 2048, 3072, 4096 };
    }

    @Override
    public byte[] encrypt(byte[] data, Object publicKey) throws Exception {
        PublicKey rsaPublicKey = (PublicKey) publicKey;

        // Step 1: Generate random AES key
        KeyGenerator aesKeyGen = KeyGenerator.getInstance(AES_ALGORITHM);
        aesKeyGen.init(AES_KEY_SIZE);
        SecretKey aesKey = aesKeyGen.generateKey();

        // Step 2: Encrypt data with AES
        Cipher aesCipher = Cipher.getInstance(AES_TRANSFORMATION);
        aesCipher.init(Cipher.ENCRYPT_MODE, aesKey);
        byte[] encryptedData = aesCipher.doFinal(data);

        // Step 3: Encrypt AES key with RSA
        Cipher rsaCipher = Cipher.getInstance(RSA_TRANSFORMATION);
        rsaCipher.init(Cipher.ENCRYPT_MODE, rsaPublicKey);
        byte[] encryptedAesKey = rsaCipher.doFinal(aesKey.getEncoded());

        // Step 4: Combine encrypted AES key + encrypted data
        // Format: [4 bytes: key length][encrypted AES key][encrypted data]
        ByteBuffer buffer = ByteBuffer.allocate(4 + encryptedAesKey.length + encryptedData.length);
        buffer.putInt(encryptedAesKey.length);
        buffer.put(encryptedAesKey);
        buffer.put(encryptedData);

        return buffer.array();
    }

    @Override
    public byte[] decrypt(byte[] encryptedData, Object privateKey) throws Exception {
        PrivateKey rsaPrivateKey = (PrivateKey) privateKey;

        // Step 1: Extract encrypted AES key and encrypted data
        ByteBuffer buffer = ByteBuffer.wrap(encryptedData);
        int keyLength = buffer.getInt();

        byte[] encryptedAesKey = new byte[keyLength];
        buffer.get(encryptedAesKey);

        byte[] encryptedContent = new byte[buffer.remaining()];
        buffer.get(encryptedContent);

        // Step 2: Decrypt AES key with RSA
        Cipher rsaCipher = Cipher.getInstance(RSA_TRANSFORMATION);
        rsaCipher.init(Cipher.DECRYPT_MODE, rsaPrivateKey);
        byte[] aesKeyBytes = rsaCipher.doFinal(encryptedAesKey);
        SecretKey aesKey = new SecretKeySpec(aesKeyBytes, AES_ALGORITHM);

        // Step 3: Decrypt data with AES
        Cipher aesCipher = Cipher.getInstance(AES_TRANSFORMATION);
        aesCipher.init(Cipher.DECRYPT_MODE, aesKey);
        byte[] decryptedData = aesCipher.doFinal(encryptedContent);

        return decryptedData;
    }

    @Override
    public String getAlgorithmName() {
        return "RSA+AES Hybrid";
    }
}
