import React from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import CryptoComparison from './pages/CryptoComparison';
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <CryptoComparison />
    </ErrorBoundary>
  );
}

export default App
