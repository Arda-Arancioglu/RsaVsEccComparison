import axios from 'axios';

// Configure your backend base URL here
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT, // 30 seconds timeout for crypto operations
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Request body:', config.data);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Text generation API
export const textAPI = {
  // Generate random text
  generateText: async (length) => {
    const response = await api.post('/crypto/generate/text', {
      length
    });
    return response.data;
  }
};

// RSA API endpoints
export const rsaAPI = {
  // Generate RSA key pair
  generateKeyPair: async (keySize = 2048) => {
    const response = await api.post('/crypto/rsa/generateKeys', {
      keySize
    });
    return response.data;
  },
  
  // Encrypt data using RSA
  encrypt: async (sessionId, data) => {
    const response = await api.post('/crypto/rsa/encrypt', {
      sessionId,
      data
    });
    return response.data;
  },
  
  // Decrypt data using RSA
  decrypt: async (sessionId, encryptedData) => {
    const response = await api.post('/crypto/rsa/decrypt', {
      sessionId,
      encryptedData
    });
    return response.data;
  }
};

// ECC API endpoints
export const eccAPI = {
  // Generate ECC key pair
  generateKeyPair: async (keySize = 256) => {
    const response = await api.post('/crypto/ecc/generateKeys', {
      keySize
    });
    return response.data;
  },
  
  // Encrypt data using ECC
  encrypt: async (sessionId, data) => {
    const response = await api.post('/crypto/ecc/encrypt', {
      sessionId,
      data
    });
    return response.data;
  },
  
  // Decrypt data using ECC
  decrypt: async (sessionId, encryptedData) => {
    const response = await api.post('/crypto/ecc/decrypt', {
      sessionId,
      encryptedData
    });
    return response.data;
  }
};

export default api;
