# RSA Encryption Size Limits & Solutions

## The Problem

You're getting "Data must not be longer than 245 bytes" because **RSA has strict size limitations** based on the key size and padding scheme used.

## RSA Size Limits

| Key Size | Max Data Size (OAEP) | Max Data Size (PKCS1) |
| -------- | -------------------- | --------------------- |
| 1024-bit | 117 bytes            | 117 bytes             |
| 2048-bit | 245 bytes            | 245 bytes             |
| 3072-bit | 369 bytes            | 369 bytes             |
| 4096-bit | 501 bytes            | 501 bytes             |

### Why These Limits?

- **RSA encryption** can only handle data smaller than the key size
- **Padding schemes** (OAEP/PKCS#1) reduce available space for security
- **2048-bit RSA** = 256 bytes total - 11 bytes padding = 245 bytes max

## Solutions

### 1. Use Smaller Test Data (Quick Fix)

```javascript
// Use data under 245 bytes for RSA testing
const smallTestData = "Hello World!"; // 12 bytes - works fine
```

### 2. Implement Hybrid Encryption (Production Solution)

This is what **real applications** do:

```java
// Backend Hybrid Encryption
public class HybridEncryption {

    public HybridResult encrypt(String data, PublicKey rsaKey) {
        // 1. Generate random AES key
        SecretKey aesKey = generateAESKey();

        // 2. Encrypt data with AES (no size limit)
        byte[] encryptedData = encryptWithAES(data, aesKey);

        // 3. Encrypt AES key with RSA (small key fits RSA limit)
        byte[] encryptedAESKey = encryptWithRSA(aesKey.getEncoded(), rsaKey);

        return new HybridResult(encryptedData, encryptedAESKey);
    }

    public String decrypt(HybridResult hybrid, PrivateKey rsaKey) {
        // 1. Decrypt AES key with RSA
        byte[] aesKeyBytes = decryptWithRSA(hybrid.encryptedAESKey, rsaKey);
        SecretKey aesKey = new SecretKeySpec(aesKeyBytes, "AES");

        // 2. Decrypt data with AES
        return decryptWithAES(hybrid.encryptedData, aesKey);
    }
}
```

### 3. Frontend Data Size Management

The frontend now includes:

- ✅ **Size warnings** when data exceeds RSA limits
- ✅ **Byte counting** to show exact data size
- ✅ **Recommended data sizes** in the dropdown
- ✅ **Clear error messages** explaining the limitation

## Current Status

### Working Test Sizes:

- ✅ **50 characters** (50 bytes) - Safe for all algorithms
- ✅ **100 characters** (100 bytes) - Safe for all algorithms
- ✅ **200 characters** (200 bytes) - Safe for RSA 2048-bit

### Problematic Sizes:

- ❌ **500 characters** (500 bytes) - Exceeds RSA limit
- ❌ **1000 characters** (1KB) - Exceeds RSA limit

## Recommendations

### For Testing (Immediate):

1. **Use 200 characters or less** for RSA testing
2. **Test ECC separately** (it has different limits)
3. **Use the "Medium (200 chars) - RSA Safe" option** from the dropdown

### For Production (Long-term):

1. **Implement hybrid encryption** in your backend
2. **Use RSA only for key exchange** (encrypt AES keys)
3. **Use AES for actual data encryption** (fast, no size limits)

## Modified Frontend Features

1. **Smart Data Size Options**: Dropdown now shows RSA-safe sizes
2. **Real-time Warnings**: Yellow warning box when data exceeds limits
3. **Byte Counting**: Shows exact byte size, not just character count
4. **Educational Messages**: Explains why limits exist and how to solve them

The frontend is now **production-ready** and **educational** - it teaches users about cryptographic limitations while providing a smooth testing experience!

## Next Steps

1. **Test with smaller data** (≤200 chars) to verify RSA works
2. **Implement hybrid encryption** in backend for larger data support
3. **Use this experience** to build a robust production crypto system
