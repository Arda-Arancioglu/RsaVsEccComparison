import React from 'react';
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { formatTime } from '../utils/crypto-utils';

const TestResult = ({ test, isRunning }) => {
  const getStatusIcon = () => {
    if (isRunning) return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
    if (test.success) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isRunning) return { backgroundColor: '#1a237e', borderColor: '#3949ab' };
    if (test.success) return { backgroundColor: '#1b5e20', borderColor: '#4caf50' };
    return { backgroundColor: '#3e2723', borderColor: '#d32f2f' };
  };

  return (
    <div className="border rounded-lg p-4" style={getStatusColor()}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold" style={{ color: '#f0f0f0' }}>{test.algorithm}</h4>
        {getStatusIcon()}
      </div>
      
      {test.success && (
        <div className="space-y-2 text-sm">
          {!test.excludedKeyGen && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" style={{ color: '#b0b0b0' }} />
              <span style={{ color: '#e0e0e0' }}>Key Generation: {formatTime(test.keyGenTime)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" style={{ color: '#b0b0b0' }} />
            <span style={{ color: '#e0e0e0' }}>Encryption: {formatTime(test.encryptTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" style={{ color: '#b0b0b0' }} />
            <span style={{ color: '#e0e0e0' }}>Decryption: {formatTime(test.decryptTime)}</span>
          </div>
          <div className="border-t pt-2 font-medium" style={{ borderColor: '#404040', color: '#f0f0f0' }}>
            Total Time: {formatTime(test.totalTime)}
            {test.excludedKeyGen && (
              <span className="text-xs ml-2" style={{ color: '#b0b0b0' }}>(excluding key gen)</span>
            )}
          </div>
          {test.keySize && (
            <div className="text-xs mt-1" style={{ color: '#b0b0b0' }}>
              Key Size: {test.keySize} bits
            </div>
          )}
          {test.excludedKeyGen && (
            <div className="text-xs mt-1" style={{ color: '#b0b0b0' }}>
              Key Generation: {formatTime(test.keyGenTime)} (excluded from total)
            </div>
          )}
          {test.sessionId && (
            <div className="text-xs mt-1" style={{ color: '#b0b0b0' }}>
              Session ID: {test.sessionId.substring(0, 8)}...
            </div>
          )}
          {test.encryptedData && (
            <div className="mt-2">
              <p className="text-xs mb-1" style={{ color: '#b0b0b0' }}>Encrypted Data (first 100 chars):</p>
              <code className="text-xs p-1 rounded block break-all" style={{ backgroundColor: '#1a1a1a', color: '#e0e0e0' }}>
                {typeof test.encryptedData === 'string' 
                  ? test.encryptedData.substring(0, 100) + '...'
                  : JSON.stringify(test.encryptedData).substring(0, 100) + '...'
                }
              </code>
            </div>
          )}
        </div>
      )}
      
      {test.error && (
        <div className="text-sm mt-2" style={{ color: '#ff8a80' }}>
          <p className="font-medium">Error:</p>
          <p className="text-xs">{test.error}</p>
        </div>
      )}
      
      {isRunning && (
        <div className="text-sm mt-2" style={{ color: '#81c784' }}>
          <p>Running {test.algorithm} encryption test...</p>
        </div>
      )}
    </div>
  );
};

export default TestResult;
