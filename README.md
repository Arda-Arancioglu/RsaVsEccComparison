# RSA vs ECC Encryption Performance Comparison

A comprehensive comparison tool for analyzing the performance differences between RSA and ECC (Elliptic Curve Cryptography) encryption algorithms.

## 🚀 Features

- **Real-time Performance Testing**: Compare RSA and ECC encryption/decryption speeds
- **Multiple Key Sizes**: Test various RSA (1024-4096 bit) and ECC (256-521 bit) configurations
- **Batch Testing**: Run multiple tests for statistical analysis
- **Security Analysis**: Theoretical break-time estimates for different key sizes
- **Interactive Web Interface**: Modern React frontend with real-time charts
- **RESTful API**: Spring Boot backend with comprehensive crypto endpoints

## 📋 Prerequisites

### Backend Requirements

- **Java 17 or higher**
- **Gradle 7.0+**
- **IntelliJ IDEA** (recommended) or any Java IDE

### Frontend Requirements

- **Node.js 18.0 or higher**
- **npm 9.0 or higher**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Arda-Arancioglu/RsaVsEccComparison.git
cd RsaVsEccComparison
```

### 2. Backend Setup (Terminal 1)

```bash
# From the root directory (RsaVsEccComparison/)
cd Comparison-back

# On Windows
.\gradlew clean build
.\gradlew bootRun

# On macOS/Linux
./gradlew clean build
./gradlew bootRun
```

The backend will start on `http://localhost:8080`

⚠️ **Keep this terminal running** - the backend server will continue running here.

### 3. Frontend Setup (Terminal 2)

**Open a NEW terminal window/tab** (the backend terminal is busy running the server)

```bash
# From the root directory (RsaVsEccComparison/)
cd Comparison-front

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

⚠️ **Keep this terminal running** - the Vite dev server will continue running here.

## 🎯 Usage

1. **Backend Running**: Keep Terminal 1 running with the Spring Boot application on port 8080
2. **Frontend Running**: Keep Terminal 2 running with the Vite dev server on port 5173
3. **Open Browser**: Navigate to `http://localhost:5173`
4. **Run Tests**:
   - Select data size (100-2000 characters)
   - Choose between individual algorithm tests or comparison tests
   - Run batch tests for statistical analysis
5. **View Results**: Real-time performance charts and detailed metrics

💡 **Both terminals must stay open** while you're using the application!

## 📊 Performance Metrics

The application measures:

- **Key Generation Time**: Time to create public/private key pairs
- **Encryption Time**: Time to encrypt test data
- **Decryption Time**: Time to decrypt encrypted data
- **Security Estimates**: Theoretical time to break encryption

## 🔧 API Endpoints

### Text Generation

- `POST /api/crypto/generate/text` - Generate random test data

### RSA Operations

- `POST /api/crypto/rsa/generateKeys` - Generate RSA key pair
- `POST /api/crypto/rsa/encrypt` - Encrypt data with RSA
- `POST /api/crypto/rsa/decrypt` - Decrypt data with RSA

### ECC Operations

- `POST /api/crypto/ecc/generateKeys` - Generate ECC key pair
- `POST /api/crypto/ecc/encrypt` - Encrypt data with ECC
- `POST /api/crypto/ecc/decrypt` - Decrypt data with ECC

### Comparison

- `POST /api/crypto/compare` - Run performance comparison

## 📁 Project Structure

```
RsaVsEccComparison/
├── Comparison-back/          # Spring Boot Backend
│   ├── src/main/java/
│   │   └── com/encryption/
│   │       ├── RsaApplication.java
│   │       └── comparison/
│   │           ├── controller/    # REST Controllers
│   │           ├── service/       # Crypto Services
│   │           └── model/         # Data Models
│   ├── build.gradle
│   └── README-BACKEND.md
├── Comparison-front/         # React Frontend
│   ├── src/
│   │   ├── components/       # React Components
│   │   ├── pages/           # Page Components
│   │   ├── services/        # API Services
│   │   └── utils/           # Utility Functions
│   ├── package.json
│   └── README.md
└── README.md                # This file
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues

- **Port 8080 already in use**: Change server port in `application.properties`
- **Java version issues**: Ensure Java 17+ is installed and set as JAVA_HOME
- **Gradle build fails**: Run `./gradlew clean` then `./gradlew build`

#### Frontend Issues

- **Vite dev server won't start**:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npm run dev
  ```
- **API connection failed**: Verify backend is running on `http://localhost:8080`
- **PostCSS/TailwindCSS errors**:
  ```bash
  npm install @tailwindcss/postcss@next
  ```

#### CORS Issues

If you encounter CORS errors, the backend is configured to allow all origins in development mode.

## 🔐 Security Notes

- This is a **demonstration/educational tool**
- **DO NOT** use in production without proper security reviews
- Keys are stored in memory only (session-based)
- Random data generation uses `SecureRandom`

## 📈 Expected Performance Results

### Typical Performance Characteristics:

- **ECC Key Generation**: ~90% faster than RSA
- **ECC Encryption**: ~5-10% slower than RSA (normal - see explanation below)
- **ECC Decryption**: ~70-80% faster than RSA
- **Security**: ECC-256 ≈ RSA-3072 security level

### Important Note on Encryption Methods:

- **RSA**: Uses direct public key encryption (PKCS1 padding)

  - ✅ Fast for small data
  - ❌ Limited to ~245 bytes for 2048-bit keys
  - Real-world use: Key exchange, digital signatures

- **ECC**: Uses ECIES (Elliptic Curve Integrated Encryption Scheme)
  - ✅ No data size limitations
  - ✅ Includes built-in AES encryption + HMAC integrity
  - ⚠️ Slight overhead due to hybrid encryption process
  - Real-world use: Data encryption, modern cryptographic systems

This comparison reflects **real-world cryptographic usage patterns** where RSA is used for small data/keys and ECC (ECIES) is used for secure data encryption.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Arda Arancioglu**

- GitHub: [@Arda-Arancioglu](https://github.com/Arda-Arancioglu)

## 🙏 Acknowledgments

- BouncyCastle Crypto Library
- Spring Boot Framework
- React and Vite
- TailwindCSS for styling
