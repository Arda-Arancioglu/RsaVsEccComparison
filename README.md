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

- **Java 21 or higher**
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

### 2. Backend Setup

```bash
cd Comparison-back

# On Windows
.\gradlew clean build
.\gradlew bootRun

# On macOS/Linux
./gradlew clean build
./gradlew bootRun
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 🎯 Usage

1. **Start the Backend**: Make sure the Spring Boot application is running on port 8080
2. **Start the Frontend**: Open your browser to `http://localhost:5173`
3. **Run Tests**:
   - Select data size (100-2000 characters)
   - Choose between individual algorithm tests or comparison tests
   - Run batch tests for statistical analysis
4. **View Results**: Real-time performance charts and detailed metrics

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
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/       # React Components
│   │   ├── pages/           # Page Components
│   │   ├── services/        # API Services
│   │   └── utils/           # Utility Functions
│   ├── package.json
│   └── README-FRONTEND.md
└── README.md                # This file
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues

- **Port 8080 already in use**: Change server port in `application.properties`
- **Java version issues**: Ensure Java 21+ is installed and set as JAVA_HOME
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
- **ECC Encryption**: ~5-10% slower than RSA (normal)
- **ECC Decryption**: ~70-80% faster than RSA
- **Security**: ECC-256 ≈ RSA-3072 security level

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
