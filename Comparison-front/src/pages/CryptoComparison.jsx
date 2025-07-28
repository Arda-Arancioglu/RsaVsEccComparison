import React, { useState, useRef } from 'react';
import { Play, RotateCcw, Settings, FileText, Zap, AlertTriangle, X, BarChart3, Square } from 'lucide-react';
import { rsaAPI, eccAPI, rsaAesAPI, textAPI } from '../services/api';
import { generateTestDataSizes, getMaxDataSize, shouldUseHybridEncryption } from '../utils/crypto-utils';
import TestResult from '../components/TestResult';
import ComparisonChart from '../components/ComparisonChart';

const CryptoComparison = () => {
  const [testData, setTestData] = useState('');
  const [dataSize, setDataSize] = useState(150); // Default to truly RSA-safe size
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [results, setResults] = useState([]);
  const [testHistory, setTestHistory] = useState([]);
  const [excludeKeyGeneration, setExcludeKeyGeneration] = useState(false);
  const [batchTestCount, setBatchTestCount] = useState(20);
  const [batchResults, setBatchResults] = useState(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [realTimeComparison, setRealTimeComparison] = useState(null);
  const [currentTestNumber, setCurrentTestNumber] = useState(0);
  const [useRsaHybrid, setUseRsaHybrid] = useState(false);
  const batchTestAbortRef = useRef(false);

  const dataSizes = generateTestDataSizes();

  const generateNewText = async () => {
    try {
      // Try to get text from backend API first
      const response = await textAPI.generateText(dataSize);
      if (response && response.text) {
        setTestData(response.text);
      } else {
        // Fallback to local generation if backend doesn't provide text
        generateLocalText();
      }
    } catch (error) {
      console.warn('Backend text generation failed, using local generation:', error);
      generateLocalText();
    }
  };

  const generateLocalText = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:';
    let result = '';
    for (let i = 0; i < dataSize; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setTestData(result); // Replace existing text, don't add up
  };

  const clearTestData = () => {
    setTestData('');
  };

  const runSingleTest = async (algorithm, apiMethods, data, keySize) => {
    const startTime = performance.now();
    let keyGenTime = 0;
    
    try {
      console.log(`[${algorithm}] Starting test with ${data.length} characters (${new Blob([data]).size} bytes)`);
      
      // Check data size limits for RSA (skip if using hybrid)
      if (algorithm === 'RSA' && new Blob([data]).size > 200) {
        console.warn(`[${algorithm}] Data size (${new Blob([data]).size} bytes) exceeds conservative RSA limit of 200 bytes`);
        console.log(`[${algorithm}] RSA 2048-bit theoretical limit is 245 bytes, but 200 bytes is safer for real data`);
        console.log(`[${algorithm}] Consider implementing hybrid encryption for larger data`);
      } else if (algorithm === 'RSA+AES') {
        console.log(`[${algorithm}] Using hybrid encryption - no data size limitations`);
      }
      
      // Step 1: Generate key pair (creates session)
      const keyGenStart = performance.now();
      console.log(`[${algorithm}] Generating ${keySize}-bit keys...`);
      const sessionData = await apiMethods.generateKeyPair(keySize);
      keyGenTime = performance.now() - keyGenStart;
      console.log(`[${algorithm}] Key generation completed in ${keyGenTime.toFixed(2)}ms`);

      // Extract session ID from response
      const sessionId = sessionData.sessionId || sessionData.id;
      if (!sessionId) {
        throw new Error('No session ID received from key generation');
      }
      console.log(`[${algorithm}] Session ID: ${sessionId}`);

      // Adjust start time if excluding key generation
      const actualStartTime = excludeKeyGeneration ? performance.now() : startTime;

      // Step 2: Encrypt data
      const encryptStart = performance.now();
      console.log(`[${algorithm}] Encrypting data...`);
      const encryptedResult = await apiMethods.encrypt(sessionId, data);
      const encryptTime = performance.now() - encryptStart;
      console.log(`[${algorithm}] Encryption completed in ${encryptTime.toFixed(2)}ms`);
      console.log(`[${algorithm}] Encrypted result:`, encryptedResult);

      // Check if encryption was successful
      if (!encryptedResult.success && encryptedResult.error) {
        throw new Error(`Encryption failed: ${encryptedResult.error}`);
      }

      // Step 3: Decrypt data
      const decryptStart = performance.now();
      const encryptedData = encryptedResult.encryptedData || encryptedResult.data;
      console.log(`[${algorithm}] Decrypting data...`);
      console.log(`[${algorithm}] Encrypted data being sent for decryption:`, encryptedData);
      console.log(`[${algorithm}] Encrypted data type:`, typeof encryptedData);
      console.log(`[${algorithm}] Encrypted data length:`, encryptedData?.length || 0);
      console.log(`[${algorithm}] Encrypted data is null/undefined:`, encryptedData == null);
      
      if (!encryptedData) {
        throw new Error('No encrypted data received from encryption step');
      }
      
      const decryptedResult = await apiMethods.decrypt(sessionId, encryptedData);
      const decryptTime = performance.now() - decryptStart;
      console.log(`[${algorithm}] Decryption completed in ${decryptTime.toFixed(2)}ms`);
      console.log(`[${algorithm}] Decrypted result:`, decryptedResult);

      const totalTime = excludeKeyGeneration ? 
        performance.now() - actualStartTime : 
        performance.now() - startTime;

      // Verify decryption
      const decryptedText = decryptedResult.decryptedData || decryptedResult.data || decryptedResult.text;
      const success = decryptedText === data;
      
      console.log(`[${algorithm}] Original data (${data.length} chars):`, data);
      console.log(`[${algorithm}] Decrypted data (${decryptedText?.length || 0} chars):`, decryptedText);
      console.log(`[${algorithm}] Data types - Original: ${typeof data}, Decrypted: ${typeof decryptedText}`);
      console.log(`[${algorithm}] Verification: ${success}`);
      console.log(`[${algorithm}] Test completed in ${totalTime.toFixed(2)}ms, success: ${success}${excludeKeyGeneration ? ' (excluding key generation)' : ''}`);

      return {
        algorithm,
        success,
        keyGenTime,
        encryptTime,
        decryptTime,
        totalTime,
        sessionId,
        encryptedData: encryptedResult.encryptedData || encryptedResult.data,
        decryptedData: decryptedText,
        verified: success,
        keySize,
        excludedKeyGen: excludeKeyGeneration
      };
    } catch (error) {
      console.error(`[${algorithm}] Test failed:`, error);
      return {
        algorithm,
        success: false,
        error: error.response?.data?.message || error.message || 'Unknown error occurred',
        totalTime: excludeKeyGeneration ? 
          performance.now() - (keyGenTime > 0 ? startTime + keyGenTime : startTime) : 
          performance.now() - startTime,
        keySize,
        excludedKeyGen: excludeKeyGeneration
      };
    }
  };

  const runSingleAlgorithmTest = async (algorithm, apiMethods, keySize) => {
    if (!testData.trim()) {
      alert('Please generate or enter test data first!');
      return;
    }

    setIsRunning(true);
    setCurrentTest(algorithm);
    
    try {
      console.log(`Starting individual ${algorithm} test...`);
      const result = await runSingleTest(algorithm, apiMethods, testData, keySize);
      
      // Update or add the result for this algorithm
      setResults(prevResults => {
        const filtered = prevResults.filter(r => r.algorithm !== algorithm);
        return [...filtered, result];
      });

    } catch (error) {
      console.error(`${algorithm} individual test failed:`, error);
      alert(`Failed to run ${algorithm} test. Please check your backend connection.`);
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const runAllTests = async () => {
    if (!testData.trim()) {
      alert('Please generate or enter test data first!');
      return;
    }

    setIsRunning(true);
    setResults([]);
    const newResults = [];
    
    try {
      // Test RSA with 2048-bit keys (separate request)
      setCurrentTest(useRsaHybrid ? 'RSA+AES' : 'RSA');
      console.log(`Starting ${useRsaHybrid ? 'RSA+AES Hybrid' : 'RSA'} test with 2048-bit keys...`);
      const rsaResult = await runSingleTest(
        useRsaHybrid ? 'RSA+AES' : 'RSA', 
        useRsaHybrid ? rsaAesAPI : rsaAPI, 
        testData, 
        2048
      );
      newResults.push(rsaResult);
      setResults([...newResults]);

      // Longer delay between tests to ensure backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test ECC with 256-bit keys (completely separate request)
      setCurrentTest('ECC');
      console.log('Starting ECC test with 256-bit keys...');
      const eccResult = await runSingleTest('ECC', eccAPI, testData, 256);
      newResults.push(eccResult);
      setResults([...newResults]);

      // Add to history
      const testSession = {
        timestamp: new Date(),
        dataLength: testData.length,
        results: [...newResults]
      };
      setTestHistory(prev => [testSession, ...prev.slice(0, 4)]); // Keep last 5 tests

    } catch (error) {
      console.error('Test execution failed:', error);
      alert('Failed to run tests. Please check your backend connection.');
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const clearResults = () => {
    setResults([]);
    setTestHistory([]);
    setBatchResults(null);
  };

  const generateRandomText = (size) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,!?;:';
    let result = '';
    for (let i = 0; i < size; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const runBatchTests = async () => {
    if (batchTestCount < 1 || batchTestCount > 200) {
      alert('Please enter a number between 1 and 200 for batch tests');
      return;
    }

    setIsBatchRunning(true);
    setBatchProgress(0);
    setBatchResults(null);
    setRealTimeComparison(null);
    setCurrentTestNumber(0);
    batchTestAbortRef.current = false;
    
    const allResults = [];
    const rsaResults = [];
    const eccResults = [];

    try {
      for (let i = 0; i < batchTestCount; i++) {
        // Check if test should be stopped
        if (batchTestAbortRef.current) {
          console.log(`\n🛑 Batch test stopped by user at test ${i + 1}/${batchTestCount}`);
          break;
        }

        setCurrentTestNumber(i + 1);
        console.log(`\n=== Batch Test ${i + 1}/${batchTestCount} ===`);
        
        // Generate random test data for this iteration
        const randomData = generateRandomText(dataSize);
        
        // Test RSA (or RSA+AES Hybrid)
        console.log(`Running ${useRsaHybrid ? 'RSA+AES Hybrid' : 'RSA'} test ${i + 1}...`);
        const rsaResult = await runSingleTest(
          useRsaHybrid ? 'RSA+AES' : 'RSA', 
          useRsaHybrid ? rsaAesAPI : rsaAPI, 
          randomData, 
          2048
        );
        
        // Check abort again after RSA/RSA+AES test
        if (batchTestAbortRef.current) {
          console.log(`🛑 Batch test stopped by user after ${useRsaHybrid ? 'RSA+AES' : 'RSA'} test ${i + 1}`);
          break;
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Test ECC
        console.log(`Running ECC test ${i + 1}...`);
        const eccResult = await runSingleTest('ECC', eccAPI, randomData, 256);
        
        // Store results if both successful
        if (rsaResult.success && eccResult.success) {
          rsaResults.push(rsaResult);
          eccResults.push(eccResult);
          allResults.push({
            testNumber: i + 1,
            dataLength: randomData.length,
            rsa: rsaResult,
            ecc: eccResult
          });

          // Update real-time comparison after each successful test
          if (rsaResults.length > 0 && eccResults.length > 0) {
            const rsaAvgTotal = rsaResults.reduce((sum, r) => sum + r.totalTime, 0) / rsaResults.length;
            const eccAvgTotal = eccResults.reduce((sum, r) => sum + r.totalTime, 0) / eccResults.length;
            const rsaAvgEncrypt = rsaResults.reduce((sum, r) => sum + r.encryptTime, 0) / rsaResults.length;
            const eccAvgEncrypt = eccResults.reduce((sum, r) => sum + r.encryptTime, 0) / eccResults.length;
            const rsaAvgDecrypt = rsaResults.reduce((sum, r) => sum + r.decryptTime, 0) / rsaResults.length;
            const eccAvgDecrypt = eccResults.reduce((sum, r) => sum + r.decryptTime, 0) / eccResults.length;
            
            const totalTimeDiff = ((rsaAvgTotal - eccAvgTotal) / rsaAvgTotal) * 100;
            const encryptTimeDiff = ((rsaAvgEncrypt - eccAvgEncrypt) / rsaAvgEncrypt) * 100;
            const decryptTimeDiff = ((rsaAvgDecrypt - eccAvgDecrypt) / rsaAvgDecrypt) * 100;
            
            setRealTimeComparison({
              completedTests: rsaResults.length,
              rsaWins: rsaResults.filter((r, idx) => r.totalTime < eccResults[idx].totalTime).length,
              eccWins: eccResults.filter((r, idx) => r.totalTime < rsaResults[idx].totalTime).length,
              totalTimeDiff,
              encryptTimeDiff,
              decryptTimeDiff,
              rsaAvgTotal,
              eccAvgTotal,
              trend: totalTimeDiff > 0 ? 'ECC Leading' : 'RSA Leading'
            });
          }
        }

        // Update progress
        setBatchProgress(((i + 1) / batchTestCount) * 100);
        
        // Small delay before next test
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Calculate statistics
      if (rsaResults.length > 0 && eccResults.length > 0) {
        const rsaAvgTotal = rsaResults.reduce((sum, r) => sum + r.totalTime, 0) / rsaResults.length;
        const eccAvgTotal = eccResults.reduce((sum, r) => sum + r.totalTime, 0) / eccResults.length;
        
        const rsaAvgEncrypt = rsaResults.reduce((sum, r) => sum + r.encryptTime, 0) / rsaResults.length;
        const eccAvgEncrypt = eccResults.reduce((sum, r) => sum + r.encryptTime, 0) / eccResults.length;
        
        const rsaAvgDecrypt = rsaResults.reduce((sum, r) => sum + r.decryptTime, 0) / rsaResults.length;
        const eccAvgDecrypt = eccResults.reduce((sum, r) => sum + r.decryptTime, 0) / eccResults.length;

        const rsaAvgKeyGen = rsaResults.reduce((sum, r) => sum + r.keyGenTime, 0) / rsaResults.length;
        const eccAvgKeyGen = eccResults.reduce((sum, r) => sum + r.keyGenTime, 0) / eccResults.length;

        // Calculate percentage differences (positive = ECC is faster, negative = RSA is faster)
        const totalTimeDiff = ((rsaAvgTotal - eccAvgTotal) / rsaAvgTotal) * 100;
        const encryptTimeDiff = ((rsaAvgEncrypt - eccAvgEncrypt) / rsaAvgEncrypt) * 100;
        const decryptTimeDiff = ((rsaAvgDecrypt - eccAvgDecrypt) / rsaAvgDecrypt) * 100;
        const keyGenTimeDiff = ((rsaAvgKeyGen - eccAvgKeyGen) / rsaAvgKeyGen) * 100;

        setBatchResults({
          totalTests: batchTestCount,
          successfulTests: allResults.length,
          dataSize: dataSize,
          wasStoppedEarly: batchTestAbortRef.current,
          completedTests: allResults.length,
          requestedTests: batchTestCount,
          averages: {
            rsa: {
              total: rsaAvgTotal,
              encrypt: rsaAvgEncrypt,
              decrypt: rsaAvgDecrypt,
              keyGen: rsaAvgKeyGen
            },
            ecc: {
              total: eccAvgTotal,
              encrypt: eccAvgEncrypt,
              decrypt: eccAvgDecrypt,
              keyGen: eccAvgKeyGen
            }
          },
          percentageDifferences: {
            total: totalTimeDiff,
            encrypt: encryptTimeDiff,
            decrypt: decryptTimeDiff,
            keyGen: keyGenTimeDiff
          },
          allResults: allResults
        });

        console.log(`\n=== Batch Test Summary ===`);
        console.log(`Successful Tests: ${allResults.length}/${batchTestCount}${batchTestAbortRef.current ? ' (stopped early)' : ''}`);
        console.log(`Data Size: ${dataSize} characters per test`);
        console.log(`Key Generation Excluded: ${excludeKeyGeneration}`);
        console.log(`RSA Mode: ${useRsaHybrid ? 'RSA+AES Hybrid' : 'RSA Direct'}`);
        console.log(`\n--- Average Times ---`);
        console.log(`RSA Total: ${rsaAvgTotal.toFixed(2)}ms | ECC Total: ${eccAvgTotal.toFixed(2)}ms`);
        console.log(`RSA Encrypt: ${rsaAvgEncrypt.toFixed(2)}ms | ECC Encrypt: ${eccAvgEncrypt.toFixed(2)}ms`);
        console.log(`RSA Decrypt: ${rsaAvgDecrypt.toFixed(2)}ms | ECC Decrypt: ${eccAvgDecrypt.toFixed(2)}ms`);
        console.log(`RSA KeyGen: ${rsaAvgKeyGen.toFixed(2)}ms | ECC KeyGen: ${eccAvgKeyGen.toFixed(2)}ms`);
        console.log(`\n--- Performance Analysis ---`);
        console.log(`Total Time: ECC is ${totalTimeDiff > 0 ? totalTimeDiff.toFixed(1) + '% faster' : Math.abs(totalTimeDiff).toFixed(1) + '% slower'} than RSA`);
        console.log(`Encryption: ECC is ${encryptTimeDiff > 0 ? encryptTimeDiff.toFixed(1) + '% faster' : Math.abs(encryptTimeDiff).toFixed(1) + '% slower'} than RSA`);
        console.log(`Decryption: ECC is ${decryptTimeDiff > 0 ? decryptTimeDiff.toFixed(1) + '% faster' : Math.abs(decryptTimeDiff).toFixed(1) + '% slower'} than RSA`);
        console.log(`Key Gen: ECC is ${keyGenTimeDiff > 0 ? keyGenTimeDiff.toFixed(1) + '% faster' : Math.abs(keyGenTimeDiff).toFixed(1) + '% slower'} than RSA`);
        
        // Performance insights
        if (encryptTimeDiff < 0) {
          console.log(`\n⚠️  UNEXPECTED: ECC encryption is slower than RSA!`);
          console.log(`   This suggests potential backend implementation issues:`);
          console.log(`   - ECC library might not be optimized`);
          console.log(`   - Wrong ECC curve selection`);
          console.log(`   - Java crypto provider issues`);
        }
        
        if (keyGenTimeDiff < 0) {
          console.log(`\n⚠️  UNEXPECTED: ECC key generation is slower than RSA!`);
          console.log(`   ECC key generation should typically be much faster than RSA`);
        }
      }

    } catch (error) {
      console.error('Batch test failed:', error);
      alert('Batch test failed. Check console for details.');
    } finally {
      setIsBatchRunning(false);
      setBatchProgress(0);
      setCurrentTestNumber(0);
      batchTestAbortRef.current = false;
    }
  };

  const stopBatchTests = () => {
    batchTestAbortRef.current = true;
    console.log('🛑 Stop signal sent - batch tests will stop after current test completes');
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="rounded-lg shadow-lg border p-6 mb-6" style={{ backgroundColor: '#121212', borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#f0f0f0', fontSize: '2rem' }}>RSA vs ECC Encryption Comparison</h1>
              <p style={{ color: '#e0e0e0', fontSize: '1.1rem' }}>Compare the performance of RSA and ECC encryption algorithms</p>
            </div>
          </div>

          {/* Test Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block font-medium mb-2" style={{ color: '#f0f0f0', fontSize: '1rem' }}>
                Data Size
              </label>
              <select
                value={dataSize}
                onChange={(e) => setDataSize(Number(e.target.value))}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                style={{ backgroundColor: '#1a1a1a', color: '#f0f0f0', borderColor: '#333333' }}
                disabled={isRunning}
              >
                {dataSizes.map(size => (
                  <option key={size.size} value={size.size}>{size.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateNewText}
                disabled={isRunning || isBatchRunning}
                className="w-full px-4 py-2 dark-button-primary rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generate Text
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearTestData}
                disabled={isRunning || isBatchRunning}
                className={`w-full px-4 py-2 rounded-md disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all ${
                  testData.trim() 
                    ? 'dark-button-danger hover:bg-red-700 disabled:opacity-50' 
                    : 'dark-button opacity-30 cursor-not-allowed'
                }`}
              >
                <X className="w-4 h-4" />
                Clear Text
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={runAllTests}
                disabled={isRunning || isBatchRunning || !testData.trim()}
                className="w-full px-4 py-2 dark-button-primary rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isRunning ? 'Running...' : 'Run Both Tests'}
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearResults}
                disabled={isRunning || isBatchRunning}
                className="w-full px-4 py-2 dark-button-danger rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Results
              </button>
            </div>
          </div>

          {/* Performance Options */}
          <div className="mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeKeyGeneration}
                    onChange={(e) => setExcludeKeyGeneration(e.target.checked)}
                    disabled={isRunning || isBatchRunning}
                    className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-200">
                    Exclude key generation from timing measurements
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-400 ml-6">
                In real applications, keys are generated once and reused many times
              </p>
              
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useRsaHybrid}
                    onChange={(e) => setUseRsaHybrid(e.target.checked)}
                    disabled={isRunning || isBatchRunning}
                    className="w-4 h-4 text-orange-600 bg-gray-600 border-gray-500 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-200">
                    Use RSA+AES Hybrid Encryption (unlimited data size)
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-400 ml-6">
                Enables RSA+AES hybrid encryption, allowing unlimited data size like real-world applications
              </p>
            </div>
          </div>
        </div>

        {/* Batch Testing Section */}
        <div className="border rounded-lg p-4 mb-6" style={{ backgroundColor: '#1a0d2e', borderColor: '#4a2c6a' }}>
          <h3 className="text-xl font-semibold mb-3 flex items-center gap-2" style={{ color: '#e1bee7' }}>
            <BarChart3 className="w-6 h-6" />
            Batch Performance Testing - Real World Comparison
          </h3>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block font-medium mb-2" style={{ color: '#ce93d8', fontSize: '1rem' }}>
                  Number of Tests
                </label>
                <div className="flex gap-2 items-center justify-between">
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={batchTestCount}
                    onChange={(e) => setBatchTestCount(Number(e.target.value))}
                    disabled={isRunning || isBatchRunning}
                    className="p-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-400"
                    style={{ backgroundColor: '#1a1a1a', color: '#f0f0f0', borderColor: '#4a2c6a', width: '80px' }}
                    placeholder="20"
                  />
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={runBatchTests}
                      disabled={isRunning || isBatchRunning || batchTestCount < 1}
                      className="px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-bold shadow-lg transition-all whitespace-nowrap"
                      style={{ 
                        backgroundColor: '#5d4037', 
                        borderColor: '#4a2c20',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)' 
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#4a2c20'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#5d4037'}
                    >
                      <BarChart3 className="w-4 h-4" />
                      {isBatchRunning ? `Test ${currentTestNumber}/${batchTestCount}` : `🚀 Run ${batchTestCount} Tests`}
                    </button>
                    {isBatchRunning && (
                      <button
                        onClick={stopBatchTests}
                        className="px-3 py-2 text-white rounded-md hover:bg-red-800 flex items-center justify-center gap-1 font-bold shadow-lg transition-all whitespace-nowrap"
                        style={{ backgroundColor: '#dc2626', textShadow: '0 1px 2px rgba(0, 0, 0, 0.7)' }}
                      >
                        <Square className="w-4 h-4" />
                        Stop
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs mt-1" style={{ color: '#ba68c8' }}>Max: 200 tests</p>
              </div>
            </div>

            {/* Progress Bar - Always show when running */}
            {isBatchRunning && (
              <div className="mt-4">
                <div className="flex justify-between text-sm font-medium mb-2" style={{ color: '#ce93d8' }}>
                  <span>Progress: {Math.round(batchProgress)}%</span>
                  <span>Test {currentTestNumber}/{batchTestCount}</span>
                </div>
                <div className="w-full rounded-full h-3 shadow-inner" style={{ backgroundColor: '#2a1a3a' }}>
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${batchProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <p className="text-xs mt-2" style={{ color: '#ba68c8' }}>
              🎯 <strong>Real-world simulation:</strong> Each test uses different random data to simulate actual application usage patterns
            </p>
          </div>

          {/* Live Performance Tracker - Separate section */}
          {isBatchRunning && realTimeComparison && realTimeComparison.completedTests > 0 && (
            <div className="dark-card rounded-lg shadow-sm border border-gray-600 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                📊 Live Performance Tracker
                <span className="text-sm font-normal text-gray-400">({realTimeComparison.completedTests} tests completed)</span>
              </h3>
              
              {/* Head-to-Head Wins */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-900 rounded-lg">
                  <div className="text-3xl font-bold text-blue-300">{realTimeComparison.rsaWins}</div>
                  <div className="text-sm text-gray-400 font-medium">RSA Wins</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded-lg flex items-center justify-center">
                  <div>
                    <div className="text-xl font-semibold text-gray-300">VS</div>
                    <div className="text-xs text-gray-500">Head-to-Head</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-green-900 rounded-lg">
                  <div className="text-3xl font-bold text-green-300">{realTimeComparison.eccWins}</div>
                  <div className="text-sm text-gray-400 font-medium">ECC Wins</div>
                </div>
              </div>

              {/* Performance Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-300">Overall Performance Leader</span>
                    <span className={realTimeComparison.totalTimeDiff > 0 ? 'text-green-400 font-semibold' : 'text-blue-400 font-semibold'}>
                      {realTimeComparison.totalTimeDiff > 0 ? 'ECC' : 'RSA'} +{Math.abs(realTimeComparison.totalTimeDiff).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${realTimeComparison.totalTimeDiff > 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, Math.max(15, Math.abs(realTimeComparison.totalTimeDiff) * 3))}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-300">Encryption Speed Leader</span>
                    <span className={realTimeComparison.encryptTimeDiff > 0 ? 'text-green-400 font-semibold' : 'text-blue-400 font-semibold'}>
                      {realTimeComparison.encryptTimeDiff > 0 ? 'ECC' : 'RSA'} +{Math.abs(realTimeComparison.encryptTimeDiff).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${realTimeComparison.encryptTimeDiff > 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, Math.max(15, Math.abs(realTimeComparison.encryptTimeDiff) * 3))}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-300">Decryption Speed Leader</span>
                    <span className={realTimeComparison.decryptTimeDiff > 0 ? 'text-green-400 font-semibold' : 'text-blue-400 font-semibold'}>
                      {realTimeComparison.decryptTimeDiff > 0 ? 'ECC' : 'RSA'} +{Math.abs(realTimeComparison.decryptTimeDiff).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${realTimeComparison.decryptTimeDiff > 0 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(100, Math.max(15, Math.abs(realTimeComparison.decryptTimeDiff) * 3))}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Current Trend */}
              <div className="mt-6 text-center">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                  realTimeComparison.trend === 'ECC Leading' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  🏆 {realTimeComparison.trend} ({realTimeComparison.rsaAvgTotal.toFixed(1)}ms vs {realTimeComparison.eccAvgTotal.toFixed(1)}ms average)
                </span>
              </div>
            </div>
          )}

          {/* Individual Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => runSingleAlgorithmTest(
                useRsaHybrid ? 'RSA+AES' : 'RSA', 
                useRsaHybrid ? rsaAesAPI : rsaAPI, 
                2048
              )}
              disabled={isRunning || isBatchRunning || !testData.trim()}
              className="px-4 py-2 dark-button-primary rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning && (currentTest === 'RSA' || currentTest === 'RSA+AES') ? 
                `Running ${useRsaHybrid ? 'RSA+AES...' : 'RSA...'}` : 
                `Test ${useRsaHybrid ? 'RSA+AES Hybrid' : 'RSA Only'} (2048-bit)`
              }
            </button>
            
            <button
              onClick={() => runSingleAlgorithmTest('ECC', eccAPI, 256)}
              disabled={isRunning || isBatchRunning || !testData.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning && currentTest === 'ECC' ? 'Running ECC...' : 'Test ECC Only (256-bit)'}
            </button>
          </div>

          {/* Data Size Warning */}
          {testData && (
            <div className="mt-4">
              {!useRsaHybrid && shouldUseHybridEncryption('RSA', 2048, new Blob([testData]).size) && (
                <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <h4 className="font-medium text-yellow-200">Data Size Warning</h4>
                  </div>
                  <p className="text-sm text-yellow-300 mb-2">
                    Your test data ({new Blob([testData]).size} bytes) exceeds RSA's safe encryption limit (200 bytes for 2048-bit keys).
                  </p>
                  <p className="text-xs text-yellow-400 mb-2">
                    <strong>Note:</strong> While RSA 2048-bit theoretical limit is 245 bytes, 200 bytes is safer in practice. 
                    Real applications use hybrid encryption (RSA + AES) for larger data.
                  </p>
                  <p className="text-xs text-blue-400 font-medium">
                    💡 Tip: Enable "RSA+AES Hybrid Encryption" above to test with unlimited data size!
                  </p>
                </div>
              )}
              {useRsaHybrid && (
                <div style={{ backgroundColor: '#1a1a1a', border: '1px solid #4a5568', borderRadius: '8px', padding: '16px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" style={{ color: '#68d391' }} />
                    <h4 className="font-medium" style={{ color: '#68d391', fontSize: '1.1rem' }}>RSA+AES Hybrid Mode Enabled</h4>
                  </div>
                  <p style={{ fontSize: '1rem', color: '#e0e0e0' }}>
                    Using RSA+AES hybrid encryption - no data size limitations! 
                    This is how RSA is used in production applications.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Test Data Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Data ({testData.length} characters)
            </label>
            <textarea
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              placeholder="Enter text to encrypt or click 'Generate Text' to create random data"
              rows={3}
              disabled={isRunning}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          
        {/* Batch Test Results */}
        {batchResults && (
          <div className="dark-card rounded-lg shadow-sm border border-gray-600 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Batch Test Results ({batchResults.successfulTests}/{batchResults.requestedTests} successful{batchResults.wasStoppedEarly ? ', stopped early' : ''})
            </h3>
            
            {/* Performance Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Average Times */}
              <div>
                <h4 className="font-medium text-gray-300 mb-3">Average Performance</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Total Time:</span>
                    <div className="flex gap-4">
                      <span className="text-blue-600">RSA: {batchResults.averages.rsa.total.toFixed(2)}ms</span>
                      <span className="text-green-600">ECC: {batchResults.averages.ecc.total.toFixed(2)}ms</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Encryption:</span>
                    <div className="flex gap-4">
                      <span className="text-blue-600">RSA: {batchResults.averages.rsa.encrypt.toFixed(2)}ms</span>
                      <span className="text-green-600">ECC: {batchResults.averages.ecc.encrypt.toFixed(2)}ms</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Decryption:</span>
                    <div className="flex gap-4">
                      <span className="text-blue-600">RSA: {batchResults.averages.rsa.decrypt.toFixed(2)}ms</span>
                      <span className="text-green-600">ECC: {batchResults.averages.ecc.decrypt.toFixed(2)}ms</span>
                    </div>
                  </div>
                  {!excludeKeyGeneration && (
                    <div className="flex justify-between items-center">
                      <span>Key Generation:</span>
                      <div className="flex gap-4">
                        <span className="text-blue-600">RSA: {batchResults.averages.rsa.keyGen.toFixed(2)}ms</span>
                        <span className="text-green-600">ECC: {batchResults.averages.ecc.keyGen.toFixed(2)}ms</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Percentage Differences */}
              <div>
                <h4 className="font-medium text-gray-300 mb-3">Performance Comparison</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Total Time:</span>
                    <span className={batchResults.percentageDifferences.total > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      ECC is {Math.abs(batchResults.percentageDifferences.total).toFixed(1)}% {batchResults.percentageDifferences.total > 0 ? 'faster' : 'slower'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Encryption:</span>
                    <span className={batchResults.percentageDifferences.encrypt > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      ECC is {Math.abs(batchResults.percentageDifferences.encrypt).toFixed(1)}% {batchResults.percentageDifferences.encrypt > 0 ? 'faster' : 'slower'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Decryption:</span>
                    <span className={batchResults.percentageDifferences.decrypt > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      ECC is {Math.abs(batchResults.percentageDifferences.decrypt).toFixed(1)}% {batchResults.percentageDifferences.decrypt > 0 ? 'faster' : 'slower'}
                    </span>
                  </div>
                  {!excludeKeyGeneration && (
                    <div className="flex justify-between items-center">
                      <span>Key Generation:</span>
                      <span className={batchResults.percentageDifferences.keyGen > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        ECC is {Math.abs(batchResults.percentageDifferences.keyGen).toFixed(1)}% {batchResults.percentageDifferences.keyGen > 0 ? 'faster' : 'slower'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Winner Summary */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-300 mb-2">
                Overall Performance Winner
                {batchResults.wasStoppedEarly && (
                  <span className="text-sm font-normal text-orange-400 ml-2">(Based on completed tests)</span>
                )}
              </h4>
              <div className="text-lg font-semibold">
                {batchResults.percentageDifferences.total > 0 ? (
                  <span className="text-green-600">🏆 ECC wins by {batchResults.percentageDifferences.total.toFixed(1)}% average performance improvement</span>
                ) : (
                  <span className="text-blue-600">🏆 RSA wins by {Math.abs(batchResults.percentageDifferences.total).toFixed(1)}% average performance improvement</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Based on {batchResults.successfulTests} successful tests with {batchResults.dataSize}-character random data
                {excludeKeyGeneration && ' (excluding key generation time)'}
                {batchResults.wasStoppedEarly && ` • Test was stopped early (${batchResults.completedTests}/${batchResults.requestedTests} completed)`}
              </p>
            </div>

            {/* Performance Insights */}
            {(batchResults.percentageDifferences.encrypt < 0 || batchResults.percentageDifferences.keyGen < 0) && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Performance Analysis
                </h4>
                <div className="text-sm text-orange-700 space-y-1">
                  {batchResults.percentageDifferences.encrypt < 0 && (
                    <div>
                      <strong>⚠️ Unexpected:</strong> ECC encryption is {Math.abs(batchResults.percentageDifferences.encrypt).toFixed(1)}% slower than RSA
                      <br />
                      <span className="text-xs">ECC should typically be faster. This suggests backend implementation issues.</span>
                    </div>
                  )}
                  {batchResults.percentageDifferences.keyGen < 0 && (
                    <div>
                      <strong>⚠️ Unexpected:</strong> ECC key generation is {Math.abs(batchResults.percentageDifferences.keyGen).toFixed(1)}% slower than RSA
                      <br />
                      <span className="text-xs">ECC key generation should be much faster than RSA.</span>
                    </div>
                  )}
                  <div className="mt-2 text-xs">
                    <strong>Possible causes:</strong> Unoptimized ECC library, wrong curve selection, or Java crypto provider issues.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Results */}
        {(results.length > 0 || isRunning) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <TestResult 
              test={results.find(r => r.algorithm === (useRsaHybrid ? 'RSA+AES' : 'RSA')) || { algorithm: useRsaHybrid ? 'RSA+AES' : 'RSA' }}
              isRunning={isRunning && (currentTest === 'RSA' || currentTest === 'RSA+AES')}
            />
            <TestResult 
              test={results.find(r => r.algorithm === 'ECC') || { algorithm: 'ECC' }}
              isRunning={isRunning && currentTest === 'ECC'}
            />
          </div>
        )}

        {/* Comparison Chart */}
        <ComparisonChart results={results} />

        {/* Test History */}
        {testHistory.length > 0 && (
          <div className="dark-card rounded-lg shadow-sm border border-gray-600 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Recent Tests</h3>
            <div className="space-y-3">
              {testHistory.map((session, index) => (
                <div key={index} className="border border-gray-600 rounded-lg p-4 bg-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-300">
                      Test {index + 1} - {session.dataLength} characters
                    </span>
                    <span className="text-xs text-gray-500">
                      {session.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {session.results.map((result) => (
                      <div key={result.algorithm} className="flex justify-between">
                        <span>{result.algorithm}:</span>
                        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                          {result.success ? `${(result.totalTime).toFixed(2)}ms` : 'Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

      </div>
    
  );
};

export default CryptoComparison;
