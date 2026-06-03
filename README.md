# YourPay — UPI Payment Simulation (MERN Stack)

A full-stack digital payment simulation app inspired by PhonePe/GPay/Paytm.

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env: set MONGO_URI and JWT_SECRET
```

### 3. Seed Admin Account
```bash
cd backend
node utils/seedAdmin.js
# Admin: admin@yourpay.com / admin123
```

### 4. Run
```bash
# Terminal 1 - Backend (port 5000)
cd backend && npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend && npm start
```

## Project Structure
```
yourpay/
├── backend/
│   ├── controllers/    authController, userController, walletController,
│   │                   paymentController, qrController, adminController
│   ├── middleware/     auth.js (JWT protect, adminOnly)
│   ├── models/         User.js, Transaction.js
│   ├── routes/         auth, user, wallet, payment, qr, admin
│   ├── utils/          seedAdmin.js
│   └── server.js
└── frontend/src/
    ├── components/common/  Layout, Card, Button, Input
    ├── context/            AuthContext
    ├── pages/              Login, Register, Dashboard, SendMoney,
    │                       ReceiveMoney, TransactionHistory,
    │                       Wallet, Profile, SetPin, Admin
    └── utils/              api.js, formatters.js
```

## Features
- JWT auth + bcrypt encryption
- Auto UPI ID generation
- 4-digit UPI PIN (encrypted)
- Send/receive money simulation
- QR code generation
- PDF receipt download
- Transaction history (paginated)
- Admin dashboard with charts
- Dark mode toggle
- Fully responsive

## Disclaimer
Educational project only. No real transactions.
