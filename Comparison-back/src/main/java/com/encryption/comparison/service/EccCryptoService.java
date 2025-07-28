package com.encryption.comparison.service;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import java.security.*;
import java.security.spec.ECGenParameterSpec;

@Service
public class EccCryptoService implements CryptoService {

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    @Override
    public String getAlgorithmName() {
        return "ECC";
    }

    @Override
    public int[] getSupportedKeySizes() {
        return new int[] {256, 384, 521};
    }

    @Override
    public Object[] generateKeyPair(int keySize) throws Exception {
        // Select curve based on key size
        String curve;
        switch (keySize) {
            case 384: curve = "secp384r1"; break;
            case 521: curve = "secp521r1"; break;
            default: curve = "secp256r1"; break; // Default to P-256
        }

        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("EC", "BC");
        ECGenParameterSpec ecSpec = new ECGenParameterSpec(curve);
        keyGen.initialize(ecSpec, new SecureRandom());

        KeyPair keyPair = keyGen.generateKeyPair();
        return new Object[] {keyPair.getPublic(), keyPair.getPrivate()};
    }

    @Override
    public byte[] encrypt(byte[] data, Object publicKeyObj) throws Exception {
        PublicKey publicKey = (PublicKey) publicKeyObj;

        // For ECC, we'll use ECIES (Elliptic Curve Integrated Encryption Scheme)
        Cipher cipher = Cipher.getInstance("ECIES", "BC");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);

        return cipher.doFinal(data);
    }

    @Override
    public byte[] decrypt(byte[] encryptedData, Object privateKeyObj) throws Exception {
        PrivateKey privateKey = (PrivateKey) privateKeyObj;

        // For ECC, we'll use ECIES (Elliptic Curve Integrated Encryption Scheme)
        Cipher cipher = Cipher.getInstance("ECIES", "BC");
        cipher.init(Cipher.DECRYPT_MODE, privateKey);

        return cipher.doFinal(encryptedData);
    }
}