import React from 'react';
import { BarChart3, Trophy, Clock } from 'lucide-react';
import { formatTime } from '../utils/crypto-utils';

const ComparisonChart = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center" style={{ backgroundColor: '#121212', borderColor: '#2a2a2a' }}>
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p style={{ color: '#b0b0b0' }}>Run tests to see performance comparison</p>
      </div>
    );
  }

  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center" style={{ backgroundColor: '#2d1b1b', borderColor: '#5a2c2c' }}>
        <p style={{ color: '#ff8a80' }}>No successful tests to compare</p>
      </div>
    );
  }

  const maxTime = Math.max(...successfulResults.map(r => r.totalTime));
  
  const getWinner = (metric) => {
    const minResult = successfulResults.reduce((min, current) => 
      current[metric] < min[metric] ? current : min
    );
    return minResult.algorithm;
  };

  const getBarWidth = (time) => (time / maxTime) * 100;

  return (
    <div className="border rounded-lg p-6" style={{ backgroundColor: '#121212', borderColor: '#2a2a2a' }}>
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold" style={{ color: '#f0f0f0' }}>Performance Comparison</h3>
      </div>

      {/* Performance Bars */}
      <div className="space-y-4 mb-6">
        {successfulResults.map((result) => (
          <div key={result.algorithm} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium" style={{ color: '#e0e0e0' }}>{result.algorithm}</span>
              <span className="text-sm" style={{ color: '#b0b0b0' }}>{formatTime(result.totalTime)}</span>
            </div>
            <div className="w-full rounded-full h-3" style={{ backgroundColor: '#2a2a2a' }}>
              <div
                className={`h-3 rounded-full ${
                  result.algorithm === 'RSA' || result.algorithm === 'RSA+AES' ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${getBarWidth(result.totalTime)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
          <h4 className="font-medium mb-2" style={{ color: '#e0e0e0' }}>Key Generation</h4>
          {successfulResults.map((result) => (
            <div key={result.algorithm} className="flex justify-between text-sm" style={{ color: '#b0b0b0' }}>
              <span>{result.algorithm}:</span>
              <span>{formatTime(result.keyGenTime)}</span>
            </div>
          ))}
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
          <h4 className="font-medium mb-2" style={{ color: '#e0e0e0' }}>Encryption</h4>
          {successfulResults.map((result) => (
            <div key={result.algorithm} className="flex justify-between text-sm" style={{ color: '#b0b0b0' }}>
              <span>{result.algorithm}:</span>
              <span>{formatTime(result.encryptTime)}</span>
            </div>
          ))}
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
          <h4 className="font-medium mb-2" style={{ color: '#e0e0e0' }}>Decryption</h4>
          {successfulResults.map((result) => (
            <div key={result.algorithm} className="flex justify-between text-sm" style={{ color: '#b0b0b0' }}>
              <span>{result.algorithm}:</span>
              <span>{formatTime(result.decryptTime)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Winners */}
      {successfulResults.length > 1 && (
        <div className="border rounded-lg p-4" style={{ backgroundColor: '#1f1c00', borderColor: '#4a4400' }}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h4 className="font-medium" style={{ color: '#ffeb3b' }}>Performance Winners</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span style={{ color: '#fff176' }}>Overall: </span>
              <span className="font-medium" style={{ color: '#ffffff' }}>{getWinner('totalTime')}</span>
            </div>
            <div>
              <span style={{ color: '#fff176' }}>Key Gen: </span>
              <span className="font-medium" style={{ color: '#ffffff' }}>{getWinner('keyGenTime')}</span>
            </div>
            <div>
              <span style={{ color: '#fff176' }}>Encryption: </span>
              <span className="font-medium" style={{ color: '#ffffff' }}>{getWinner('encryptTime')}</span>
            </div>
            <div>
              <span style={{ color: '#fff176' }}>Decryption: </span>
              <span className="font-medium" style={{ color: '#ffffff' }}>{getWinner('decryptTime')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonChart;
