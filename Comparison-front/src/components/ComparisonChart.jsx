import React from 'react';
import { BarChart3, Trophy, Clock } from 'lucide-react';
import { formatTime } from '../utils/crypto-utils';

const ComparisonChart = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div className="bg-gray-50 border rounded-lg p-8 text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Run tests to see performance comparison</p>
      </div>
    );
  }

  const successfulResults = results.filter(r => r.success);
  
  if (successfulResults.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600">No successful tests to compare</p>
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
    <div className="bg-white border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Performance Comparison</h3>
      </div>

      {/* Performance Bars */}
      <div className="space-y-4 mb-6">
        {successfulResults.map((result) => (
          <div key={result.algorithm} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{result.algorithm}</span>
              <span className="text-sm text-gray-600">{formatTime(result.totalTime)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  result.algorithm === 'RSA' ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${getBarWidth(result.totalTime)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Key Generation</h4>
          {successfulResults.map((result) => (
            <div key={result.algorithm} className="flex justify-between text-sm">
              <span>{result.algorithm}:</span>
              <span>{formatTime(result.keyGenTime)}</span>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Encryption</h4>
          {successfulResults.map((result) => (
            <div key={result.algorithm} className="flex justify-between text-sm">
              <span>{result.algorithm}:</span>
              <span>{formatTime(result.encryptTime)}</span>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Decryption</h4>
          {successfulResults.map((result) => (
            <div key={result.algorithm} className="flex justify-between text-sm">
              <span>{result.algorithm}:</span>
              <span>{formatTime(result.decryptTime)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Winners */}
      {successfulResults.length > 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">Performance Winners</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-yellow-700">Overall: </span>
              <span className="font-medium">{getWinner('totalTime')}</span>
            </div>
            <div>
              <span className="text-yellow-700">Key Gen: </span>
              <span className="font-medium">{getWinner('keyGenTime')}</span>
            </div>
            <div>
              <span className="text-yellow-700">Encryption: </span>
              <span className="font-medium">{getWinner('encryptTime')}</span>
            </div>
            <div>
              <span className="text-yellow-700">Decryption: </span>
              <span className="font-medium">{getWinner('decryptTime')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonChart;
