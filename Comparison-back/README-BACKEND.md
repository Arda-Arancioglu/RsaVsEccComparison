# Backend - Spring Boot Crypto Comparison API

This is the backend service for the RSA vs ECC performance comparison tool, built with Spring Boot and Java 21.

## 🚀 Quick Start

### Prerequisites

- **Java 21 or higher**
- **Gradle 7.0+**

### Running the Backend

#### Option 1: Using Gradle Wrapper (Recommended)

```bash
# Windows
.\gradlew clean bootRun

# macOS/Linux
./gradlew clean bootRun
```

#### Option 2: Using IDE

1. Open the project in IntelliJ IDEA
2. Wait for Gradle to sync
3. Run `RsaApplication.java`

#### Option 3: Building JAR

```bash
# Build
.\gradlew clean build

# Run the JAR
java -jar build/libs/rsa-0.0.1-SNAPSHOT.jar
```

The server will start on **http://localhost:8080**

## 📚 API Documentation

### Base URL: `http://localhost:8080/api/crypto`

### 1. Generate Random Text

```http
POST /generate/text
Content-Type: application/json

{
  "length": 1000
}
```

**Response:**

```json
{
  "text": "base64-encoded-random-text",
  "length": 1000
}
```

### 2. RSA Key Generation

```http
POST /rsa/generateKeys
Content-Type: application/json

{
  "keySize": 2048
}
```

**Response:**

```json
{
  "success": true,
  "sessionId": "uuid-session-id",
  "keySize": 2048,
  "algorithm": "RSA",
  "generationTime": 245.67
}
```

### 3. RSA Encryption

```http
POST /rsa/encrypt
Content-Type: application/json

{
  "sessionId": "uuid-from-key-generation",
  "data": "text to encrypt"
}
```

**Response:**

```json
{
  "success": true,
  "encryptedData": "base64-encoded-encrypted-data",
  "algorithm": "RSA",
  "encryptionTime": 1.23
}
```

### 4. RSA Decryption

```http
POST /rsa/decrypt
Content-Type: application/json

{
  "sessionId": "uuid-from-key-generation",
  "encryptedData": "base64-encoded-encrypted-data"
}
```

**Response:**

```json
{
  "success": true,
  "decryptedData": "original text",
  "algorithm": "RSA",
  "decryptionTime": 2.45
}
```

### 5. ECC Key Generation

```http
POST /ecc/generateKeys
Content-Type: application/json

{
  "keySize": 256
}
```

### 6. ECC Encryption

```http
POST /ecc/encrypt
Content-Type: application/json

{
  "sessionId": "uuid-from-key-generation",
  "data": "text to encrypt"
}
```

### 7. ECC Decryption

```http
POST /ecc/decrypt
Content-Type: application/json

{
  "sessionId": "uuid-from-key-generation",
  "encryptedData": "encrypted-data"
}
```

### 8. Performance Comparison

```http
POST /compare
Content-Type: application/json

{
  "dataSizes": [1024, 2048],
  "rsaKeySize": 2048,
  "eccKeySize": 256
}
```

**Response:**

```json
[
  {
    "algorithm": "RSA",
    "dataSize": 1024,
    "keySize": 2048,
    "keyGenerationTime": 245.67,
    "encryptionTime": 1.23,
    "decryptionTime": 12.45,
    "securityEstimate": {
      "algorithm": "RSA",
      "keySize": 2048,
      "securityBits": 112,
      "estimatedBreakTime": "Years with current technology"
    },
    "success": true,
    "errorMessage": null
  }
]
```

## 🏗️ Architecture

### Project Structure

```
src/main/java/com/encryption/
├── RsaApplication.java                 # Main Spring Boot Application
└── comparison/
    ├── controller/
    │   └── CryptoComparisonController.java   # REST API Endpoints
    ├── service/
    │   ├── CryptoService.java               # Interface for crypto operations
    │   ├── RsaCryptoService.java            # RSA implementation
    │   ├── EccCryptoService.java            # ECC implementation
    │   ├── CryptoComparisonService.java     # Performance testing service
    │   └── SecurityEstimatorService.java    # Security analysis service
    └── model/
        ├── CryptoTestConfig.java            # Test configuration
        ├── CryptoTestResult.java            # Test results
        ├── SecurityEstimation.java          # Security estimates
        ├── EncryptionRequest.java           # Request DTOs
        └── DecryptionRequest.java
```

### Key Components

#### CryptoService Interface

Common interface for RSA and ECC implementations:

- `generateKeyPair(int keySize)`
- `encrypt(byte[] data, Object publicKey)`
- `decrypt(byte[] encryptedData, Object privateKey)`
- `getSupportedKeySizes()`

#### RsaCryptoService

- Uses Java's built-in RSA implementation
- PKCS1 padding
- Supported key sizes: 1024, 2048, 3072, 4096 bits
- Data size limit: (keySize/8 - 11) bytes

#### EccCryptoService

- Uses BouncyCastle provider
- ECIES (Elliptic Curve Integrated Encryption Scheme)
- Supported curves: secp256r1, secp384r1, secp521r1
- No practical data size limits

## 🔧 Configuration

### Application Properties

```properties
# Server configuration
server.port=8080

# Logging
logging.level.com.encryption=DEBUG
logging.level.org.springframework.security=DEBUG

# CORS (Development only)
spring.web.cors.allowed-origins=*
```

### Dependencies

Key dependencies in `build.gradle`:

- Spring Boot Starter Web
- BouncyCastle Crypto Provider
- Lombok
- JUnit 5 (testing)

## 🧪 Testing

### Run Tests

```bash
.\gradlew test
```

### Test Coverage

- Unit tests for crypto services
- Integration tests for comparison service
- Controller tests for API endpoints

## 🔐 Security Features

### Crypto Implementations

- **Secure Random**: Uses `SecureRandom` for key generation
- **Input Validation**: Data size limits and key size validation
- **Error Handling**: Comprehensive error messages without exposing internals

### Session Management

- UUID-based session IDs
- In-memory key storage (development only)
- Automatic cleanup (keys expire with session)

## 🚨 Production Considerations

⚠️ **This is a demonstration application. For production use:**

1. **Key Management**: Implement proper key storage (HSM, key vault)
2. **Authentication**: Add API authentication
3. **Rate Limiting**: Prevent abuse
4. **Input Validation**: Enhanced validation and sanitization
5. **Logging**: Remove sensitive data from logs
6. **CORS**: Configure specific allowed origins
7. **HTTPS**: Use TLS for all communications

## 🐛 Troubleshooting

### Common Issues

#### Java Version

```bash
# Check Java version
java -version
# Should show Java 21 or higher
```

#### Port Already in Use

Change port in `application.properties`:

```properties
server.port=8081
```

#### BouncyCastle Issues

If you get crypto provider errors:

```bash
# Clean and rebuild
.\gradlew clean build
```

#### OutOfMemory Errors

Increase heap size:

```bash
java -Xmx1024m -jar build/libs/rsa-0.0.1-SNAPSHOT.jar
```

### Logs

Check logs for detailed error information:

```bash
# Enable debug logging
logging.level.com.encryption=DEBUG
```

## 📊 Performance Notes

### Expected Timings (approximate)

- **RSA-2048 Key Generation**: 200-500ms
- **RSA-2048 Encryption**: 1-5ms
- **RSA-2048 Decryption**: 10-50ms
- **ECC-256 Key Generation**: 20-100ms
- **ECC-256 Encryption**: 2-10ms
- **ECC-256 Decryption**: 1-5ms

### Memory Usage

- Minimal memory footprint
- Keys stored in memory during session
- No persistent storage

## 🔍 Monitoring

### Health Check

```http
GET /actuator/health
```

### Metrics (if actuator enabled)

```http
GET /actuator/metrics
```
