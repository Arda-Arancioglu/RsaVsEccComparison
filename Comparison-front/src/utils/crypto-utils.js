// Utility functions for text generation and timing

export const generateRandomText = (length = 1000) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generateTestDataSizes = () => [
  { name: 'Tiny (50 chars)', size: 50 },
  { name: 'Small (100 chars)', size: 100 },
  { name: 'Medium (150 chars)', size: 150 },
  { name: 'Large (175 chars) - RSA Safe', size: 175 },
  { name: 'XL (245 chars) - RSA Limit', size: 245 },
  { name: 'XXL (500 chars) - Needs Hybrid', size: 500 }
];

// Set default size to 150 (truly RSA-safe)
export const DEFAULT_DATA_SIZE = 150;

// RSA encryption limits based on key size and padding (conservative estimates)
export const RSA_LIMITS = {
  1024: 100, // RSA-1024 with OAEP padding (conservative)
  2048: 200, // RSA-2048 with OAEP padding (conservative - theoretical is 245)
  3072: 300, // RSA-3072 with OAEP padding (conservative)
  4096: 400  // RSA-4096 with OAEP padding (conservative)
};

export const getMaxDataSize = (algorithm, keySize) => {
  if (algorithm === 'RSA') {
    return RSA_LIMITS[keySize] || 200; // Default to conservative 2048-bit limit
  }
  if (algorithm === 'ECC') {
    // ECC typically uses hybrid encryption for any substantial data
    return 100; // Conservative limit for pure ECC
  }
  return Infinity;
};

export const shouldUseHybridEncryption = (algorithm, keySize, dataSize) => {
  const maxSize = getMaxDataSize(algorithm, keySize);
  return dataSize > maxSize;
};

export const formatTime = (milliseconds) => {
  if (milliseconds < 1) {
    return `${(milliseconds * 1000).toFixed(2)}μs`;
  } else if (milliseconds < 1000) {
    return `${milliseconds.toFixed(2)}ms`;
  } else {
    return `${(milliseconds / 1000).toFixed(2)}s`;
  }
};

export const calculatePerformanceMetrics = (timings) => {
  const total = timings.reduce((sum, time) => sum + time, 0);
  const average = total / timings.length;
  const min = Math.min(...timings);
  const max = Math.max(...timings);
  
  return {
    total: formatTime(total),
    average: formatTime(average),
    min: formatTime(min),
    max: formatTime(max),
    rawAverage: average,
    rawMin: min,
    rawMax: max
  };
};

export const createPerformanceLogger = () => {
  const logs = [];
  
  return {
    start: (operation) => {
      const startTime = performance.now();
      return {
        end: () => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          logs.push({ operation, duration, timestamp: new Date() });
          return duration;
        }
      };
    },
    getLogs: () => [...logs],
    clear: () => logs.length = 0
  };
};
