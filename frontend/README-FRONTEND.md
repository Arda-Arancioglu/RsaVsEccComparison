# Frontend - React Crypto Comparison Interface

Modern React frontend for the RSA vs ECC performance comparison tool, built with Vite, React, and TailwindCSS.

## 🚀 Quick Start

### Prerequisites

- **Node.js 18.0 or higher**
- **npm 9.0 or higher**

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at **http://localhost:5173**

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

- **React 18** - UI Framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library
- **Recharts** - Chart library for performance visualization

## 📁 Project Structure

```
src/
├── components/           # Reusable React components
│   ├── ComparisonChart.jsx      # Performance comparison charts
│   ├── TestResult.jsx           # Individual test result display
│   └── ErrorBoundary.jsx        # Error handling component
├── pages/               # Page components
│   └── CryptoComparison.jsx     # Main application page
├── services/            # API and external services
│   └── api.js                   # Backend API integration
├── utils/               # Utility functions
│   └── crypto-utils.js          # Crypto-related utilities
├── assets/              # Static assets
├── App.jsx              # Main App component
├── main.jsx             # Application entry point
├── App.css              # Global styles
└── index.css            # Base styles and Tailwind imports
```

## 🎯 Features

### Core Functionality

- **Algorithm Selection**: Test RSA only, ECC only, or both
- **Data Size Configuration**: 100, 500, 1000, 2000 characters
- **Key Size Options**:
  - RSA: 1024, 2048, 3072, 4096 bits
  - ECC: 256, 384, 521 bits
- **Batch Testing**: Run multiple tests for statistical analysis
- **Real-time Progress**: Live updates during batch testing

### Performance Metrics

- **Key Generation Time**: Time to create key pairs
- **Encryption Time**: Time to encrypt test data
- **Decryption Time**: Time to decrypt data
- **Total Time**: Combined operation time
- **Success Rate**: Percentage of successful operations

### Data Visualization

- **Performance Charts**: Visual comparison of algorithms
- **Real-time Updates**: Charts update as tests complete
- **Statistical Analysis**: Averages, percentages, trends
- **Historical Data**: Keep track of recent test results

### User Experience

- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages
- **Progress Tracking**: Batch test progress indicators

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:8080/api

# Development settings
VITE_NODE_ENV=development
```

### API Configuration

Edit `src/services/api.js` to modify API settings:

```javascript
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
```

## 📡 API Integration

### API Services

The frontend communicates with the backend through dedicated API services:

#### Text Generation API

```javascript
import { textAPI } from "./services/api.js";

const text = await textAPI.generate(1000);
```

#### RSA API

```javascript
import { rsaAPI } from "./services/api.js";

// Generate keys
const keys = await rsaAPI.generateKeyPair(2048);

// Encrypt data
const encrypted = await rsaAPI.encrypt(sessionId, data);

// Decrypt data
const decrypted = await rsaAPI.decrypt(sessionId, encryptedData);
```

#### ECC API

```javascript
import { eccAPI } from "./services/api.js";

// Similar interface to RSA API
const keys = await eccAPI.generateKeyPair(256);
```

### Error Handling

The API service includes comprehensive error handling:

- Network connectivity issues
- Backend server errors
- Timeout handling
- Invalid response handling

## 🎨 Styling & Theming

### TailwindCSS Configuration

The project uses TailwindCSS for styling with custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom colors for crypto themes
      },
    },
  },
  plugins: [],
};
```

### Component Styling

- **Consistent Design**: Unified color scheme and spacing
- **Interactive Elements**: Hover effects and transitions
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: ARIA labels and keyboard navigation

## 🧪 Testing Strategy

### Manual Testing Checklist

- [ ] All API endpoints respond correctly
- [ ] Batch testing completes successfully
- [ ] Charts render with correct data
- [ ] Error states display appropriately
- [ ] Mobile responsive design works
- [ ] Loading states are visible

### Common Test Scenarios

1. **Single Algorithm Test**: Test RSA or ECC individually
2. **Comparison Test**: Test both algorithms with same data
3. **Batch Testing**: Run multiple iterations
4. **Error Scenarios**: Network failures, invalid data
5. **Edge Cases**: Large data sizes, unusual key sizes

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Vite Dev Server Won't Start

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

#### PostCSS/TailwindCSS Errors

```bash
# Install latest TailwindCSS PostCSS plugin
npm install @tailwindcss/postcss@next
```

#### API Connection Failed

1. Verify backend is running on `http://localhost:8080`
2. Check browser network tab for CORS errors
3. Verify API_BASE_URL in environment variables

#### Charts Not Rendering

```bash
# Reinstall chart dependencies
npm uninstall recharts
npm install recharts@latest
```

#### Build Errors

```bash
# Clean build and retry
npm run build --force
```

### Browser Compatibility

- **Chrome**: ✅ Fully supported
- **Firefox**: ✅ Fully supported
- **Safari**: ✅ Fully supported
- **Edge**: ✅ Fully supported

### Performance Optimization

- **Code Splitting**: Vite automatically splits bundles
- **Tree Shaking**: Unused code is eliminated
- **Asset Optimization**: Images and CSS are optimized
- **Lazy Loading**: Components load on demand

## 🔐 Security Considerations

### Frontend Security

- **No Sensitive Data**: No crypto keys stored in frontend
- **API-Only Operations**: All crypto operations on backend
- **Input Validation**: User input is validated before sending
- **HTTPS**: Use HTTPS in production

### Data Handling

- **Temporary Storage**: Test data cleared after use
- **No Persistence**: No data stored in localStorage
- **Session-Based**: Keys tied to backend sessions

## 🚀 Deployment

### Development Deployment

```bash
npm run dev
```

### Production Deployment

```bash
# Build for production
npm run build

# Serve static files (example with serve)
npm install -g serve
serve -s dist -l 3000
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment-Specific Builds

```bash
# Development build
npm run build:dev

# Production build
npm run build:prod
```

## 📊 Performance Monitoring

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Lighthouse Scores

Target metrics for production:

- **Performance**: >90
- **Accessibility**: >95
- **Best Practices**: >90
- **SEO**: >90

## 🤝 Development Guidelines

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use descriptive component and variable names
- Add comments for complex logic

### Component Structure

```jsx
// Component template
import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  const handleEvent = () => {
    // Event handling
  };

  return <div className="component-styles">{/* Component JSX */}</div>;
};

ComponentName.propTypes = {
  prop1: PropTypes.string.required,
  prop2: PropTypes.number,
};

export default ComponentName;
```

### State Management

- Use React hooks for local state
- Lift state up when needed by multiple components
- Consider Context API for global state (if needed)

## 🔍 Debugging

### Development Tools

- **React Developer Tools**: Browser extension for React debugging
- **Vite HMR**: Hot module replacement for instant updates
- **Console Logging**: Strategic console.log statements
- **Network Tab**: Monitor API calls and responses

### Common Debug Scenarios

```javascript
// Debug API calls
console.log("API Request:", requestData);
console.log("API Response:", responseData);

// Debug component renders
console.log("Component rendered with props:", props);

// Debug state changes
useEffect(() => {
  console.log("State changed:", state);
}, [state]);
```
