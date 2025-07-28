# 🚀 Quick Setup Guide

## Clone and Run in 5 Minutes

### 1. Clone Repository

```bash
git clone https://github.com/Arda-Arancioglu/RsaVsEccComparison.git
cd RsaVsEccComparison
```

### 2. Start Backend (Terminal 1)

```bash
cd Comparison-back

# Windows
.\gradlew bootRun

# macOS/Linux
./gradlew bootRun
```

✅ Backend runs on http://localhost:8080

### 3. Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend runs on http://localhost:5173

### 4. Open Browser

Navigate to **http://localhost:5173** and start testing!

## 🔧 If You Have Issues

### Frontend Won't Start?

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend Won't Start?

```bash
cd Comparison-back
.\gradlew clean build
.\gradlew bootRun
```

### Still Having Issues?

Check the detailed README files:

- [Main README](./README.md)
- [Backend README](./Comparison-back/README-BACKEND.md)
- [Frontend README](./frontend/README-FRONTEND.md)

## 📋 Requirements

- **Java 21+** for backend
- **Node.js 18+** for frontend
