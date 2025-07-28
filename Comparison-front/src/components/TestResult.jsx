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
    if (isRunning) return 'border-blue-300 bg-blue-100';
    if (test.success) return 'border-green-200 bg-green-50';
    return 'border-red-200 bg-red-50';
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-800">{test.algorithm}</h4>
        {getStatusIcon()}
      </div>
      
      {test.success && (
        <div className="space-y-2 text-sm">
          {!test.excludedKeyGen && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-gray-500" />
              <span>Key Generation: {formatTime(test.keyGenTime)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-500" />
            <span>Encryption: {formatTime(test.encryptTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-gray-500" />
            <span>Decryption: {formatTime(test.decryptTime)}</span>
          </div>
          <div className="border-t pt-2 font-medium">
            Total Time: {formatTime(test.totalTime)}
            {test.excludedKeyGen && (
              <span className="text-xs text-gray-500 ml-2">(excluding key gen)</span>
            )}
          </div>
          {test.keySize && (
            <div className="text-xs text-gray-600 mt-1">
              Key Size: {test.keySize} bits
            </div>
          )}
          {test.excludedKeyGen && (
            <div className="text-xs text-gray-600 mt-1">
              Key Generation: {formatTime(test.keyGenTime)} (excluded from total)
            </div>
          )}
          {test.sessionId && (
            <div className="text-xs text-gray-600 mt-1">
              Session ID: {test.sessionId.substring(0, 8)}...
            </div>
          )}
          {test.encryptedData && (
            <div className="mt-2">
              <p className="text-xs text-gray-600 mb-1">Encrypted Data (first 100 chars):</p>
              <code className="text-xs bg-gray-100 p-1 rounded block break-all">
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
        <div className="text-red-600 text-sm mt-2">
          <p className="font-medium">Error:</p>
          <p className="text-xs">{test.error}</p>
        </div>
      )}
      
      {isRunning && (
        <div className="text-blue-600 text-sm mt-2">
          <p>Running {test.algorithm} encryption test...</p>
        </div>
      )}
    </div>
  );
};

export default TestResult;
