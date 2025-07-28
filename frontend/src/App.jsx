import React from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import CryptoComparison from './pages/CryptoComparison'

function App() {
  return (
    <ErrorBoundary>
      <CryptoComparison />
    </ErrorBoundary>
  )
}

export default App
