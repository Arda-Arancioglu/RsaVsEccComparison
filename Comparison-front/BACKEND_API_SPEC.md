# Backend API Specification for RSA vs ECC Frontend

This document describes the exact API endpoints and data formats that your backend needs to implement to work with this frontend application.

## Base URL Configuration

The frontend is configured to send requests to: `http://localhost:3000/api`

You can change this by updating the `VITE_API_BASE_URL` environment variable or modifying `src/services/api.js`.

## Required API Endpoints

### 1. Text Generation (Optional)

**Endpoint:** `POST /api/crypto/generate/text`

**Request:**

```json
{
  "length": 1000
}
```

**Response:**

```json
{
  "text": "Generated random text of specified length..."
}
```

### 2. RSA Key Generation

**Endpoint:** `POST /api/crypto/rsa/generateKeys`

**Request:**

```json
{
  "keySize": 2048
}
```

**Response:**

```json
{
  "sessionId": "unique-session-identifier",
  "publicKey": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  "privateKey": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
}
```

### 3. RSA Encryption

**Endpoint:** `POST /api/crypto/rsa/encrypt`

**Request:**

```json
{
  "sessionId": "session-id-from-key-generation",
  "data": "Text to encrypt"
}
```

**Response:**

```json
{
  "encryptedData": "base64-encoded-encrypted-data"
}
```

### 4. RSA Decryption

**Endpoint:** `POST /api/crypto/rsa/decrypt`

**Request:**

```json
{
  "sessionId": "session-id-from-key-generation",
  "encryptedData": "base64-encoded-encrypted-data"
}
```

**Response:**

```json
{
  "decryptedData": "Original text"
}
```

### 5. ECC Key Generation

**Endpoint:** `POST /api/crypto/ecc/generateKeys`

**Request:**

```json
{
  "keySize": 256
}
```

**Response:**

```json
{
  "sessionId": "unique-session-identifier",
  "publicKey": "ecc-public-key-string",
  "privateKey": "ecc-private-key-string"
}
```

### 6. ECC Encryption

**Endpoint:** `POST /api/crypto/ecc/encrypt`

**Request:**

```json
{
  "sessionId": "session-id-from-key-generation",
  "data": "Text to encrypt"
}
```

**Response:**

```json
{
  "encryptedData": "encrypted-data-format"
}
```

### 7. ECC Decryption

**Endpoint:** `POST /api/crypto/ecc/decrypt`

**Request:**

```json
{
  "sessionId": "session-id-from-key-generation",
  "encryptedData": "encrypted-data-format"
}
```

**Response:**

```json
{
  "decryptedData": "Original text"
}
```

## Important Notes

### Session-Based Architecture

- Key generation creates a session with a unique ID
- The session stores the generated keys on the backend
- Encryption and decryption operations use the session ID to access the stored keys
- This approach is more secure as private keys never leave the server

### Data Flow Process

1. Frontend generates or gets random text
2. Frontend calls RSA key generation → receives session ID
3. Frontend calls ECC key generation → receives different session ID
4. Frontend calls RSA encryption with RSA session ID and text
5. Frontend calls RSA decryption with RSA session ID and encrypted data
6. Frontend calls ECC encryption with ECC session ID and text
7. Frontend calls ECC decryption with ECC session ID and encrypted data
8. Frontend measures timing for each step and compares results

### Expected Key Sizes

- **RSA**: 2048 bits (standard secure size)
- **ECC**: 256 bits (equivalent security to RSA 2048)

### Error Handling

Your backend should return appropriate HTTP status codes:

- `200 OK` for successful operations
- `400 Bad Request` for invalid input (missing sessionId, invalid keySize, etc.)
- `404 Not Found` for invalid session IDs
- `500 Internal Server Error` for server errors

Error response format:

```json
{
  "error": "Description of what went wrong",
  "details": "Additional error details (optional)"
}
```

### Performance Considerations

- The frontend will test with text sizes: 100, 500, 1000, and 2000 characters
- Operations should complete within 30 seconds (frontend timeout)
- Consider implementing caching for key generation if needed
- Ensure your server can handle concurrent requests

### CORS Configuration

Make sure your backend allows CORS requests from your frontend domain:

```javascript
// Example for Express.js
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
```

### Testing Your Backend

You can test your backend endpoints using curl or Postman:

```bash
# Test RSA key generation
curl -X POST http://localhost:3000/api/rsa/generate-keys \
  -H "Content-Type: application/json" \
  -d "{}"

# Test RSA encryption
curl -X POST http://localhost:3000/api/rsa/encrypt \
  -H "Content-Type: application/json" \
  -d '{"publicKey": "your-public-key", "data": "test data"}'
```

## Frontend Features

### Test Data Generation

- Auto-generates random text with letters, numbers, and punctuation
- Configurable sizes: 100, 500, 1000, 2000 characters
- Users can also input custom test data

### Performance Measurement

The frontend measures:

- **Key Generation Time**: Time to generate public/private key pairs
- **Encryption Time**: Time to encrypt the test data
- **Decryption Time**: Time to decrypt the encrypted data
- **Total Time**: Combined time for all operations
- **Verification**: Ensures decrypted data matches original

### Results Display

- Individual test results for RSA and ECC
- Performance comparison charts
- Historical test results
- Detailed timing breakdowns
- Visual indicators for success/failure

### Error Handling

- Network error detection
- API timeout handling
- Data validation
- User-friendly error messages

## Development Tips

1. **Start Simple**: Implement one algorithm at a time (start with RSA)
2. **Test Incrementally**: Test each endpoint individually before full integration
3. **Monitor Performance**: Log timing on your backend to compare with frontend measurements
4. **Handle Edge Cases**: Large data sizes, special characters, malformed requests
5. **Security**: In production, consider rate limiting and input validation

## Example Backend Implementation Structure

```
backend/
├── routes/
│   ├── rsa.js          # RSA endpoints
│   └── ecc.js          # ECC endpoints
├── services/
│   ├── rsaService.js   # RSA crypto operations
│   └── eccService.js   # ECC crypto operations
├── middleware/
│   └── cors.js         # CORS configuration
└── app.js              # Main server file
```

This specification should give your backend developer everything they need to implement the required API endpoints.
