# RSA vs ECC Encryption Comparison Frontend

A React-based frontend application to compare the performance of RSA and ECC encryption algorithms. This application communicates with a backend server to perform encryption/decryption operations and measures timing performance.

## Features

- **Auto Text Generation**: Generate random text of various sizes for testing
- **RSA Encryption**: Test RSA encryption with key generation, encryption, and decryption timing
- **ECC Encryption**: Test ECC encryption with key generation, encryption, and decryption timing
- **Performance Comparison**: Visual charts comparing RSA vs ECC performance
- **Real-time Timing**: Accurate millisecond timing measurements
- **Test History**: Keep track of recent test results
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running with crypto endpoints

### Installation

1. Clone or download this project
2. Install dependencies:

   ```bash
   npm install
   ```

3. Update the backend URL in `src/services/api.js`:

   ```javascript
   const API_BASE_URL = "http://localhost:3000/api"; // Update this to your backend URL
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Backend API Requirements

Your backend server should implement the following endpoints:

### RSA Endpoints

- `POST /api/rsa/generate-keys` - Generate RSA key pair
- `POST /api/rsa/encrypt` - Encrypt data with RSA public key
- `POST /api/rsa/decrypt` - Decrypt data with RSA private key

### ECC Endpoints

- `POST /api/ecc/generate-keys` - Generate ECC key pair
- `POST /api/ecc/encrypt` - Encrypt data with ECC public key
- `POST /api/ecc/decrypt` - Decrypt data with ECC private key

### Expected Request/Response Formats

#### Key Generation Response

```json
{
  "publicKey": "...",
  "privateKey": "..."
}
```

#### Encryption Request

```json
{
  "publicKey": "...",
  "data": "text to encrypt"
}
```

#### Encryption Response

```json
{
  "encryptedData": "..."
}
```

#### Decryption Request

```json
{
  "privateKey": "...",
  "encryptedData": "..."
}
```

#### Decryption Response

```json
{
  "decryptedData": "original text"
}
```

## Usage

1. **Generate Test Data**: Click "Generate Text" to create random text of your chosen size
2. **Run Tests**: Click "Run Tests" to execute both RSA and ECC encryption tests
3. **View Results**: See timing results and performance comparison charts
4. **Compare Performance**: Review which algorithm performs better for different operations

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
