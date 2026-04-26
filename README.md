# 🔐 CipherVault — Secure Password Manager

![Security](https://img.shields.io/badge/Security-AES--256-purple)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

A full-stack, production-grade password manager built with military-grade AES-256 encryption, JWT authentication, and a cybersecurity-themed UI.

---

## 🛡️ Security Features

| Feature | Implementation |
|---|---|
| Password Encryption | AES-256-CBC with random IV per entry |
| Master Password | bcrypt hashed with salt rounds 12 |
| Authentication | JWT tokens with 1 day expiry |
| Brute Force Protection | Rate limiting — 10 attempts per 15 mins |
| HTTP Security Headers | Helmet.js — 11 security headers |
| Input Validation | express-validator on all endpoints |
| CORS Protection | Whitelisted origins only |
| Request Logging | Morgan audit trail |
| Auto Session Lock | 15 minute auto-logout |
| Zero Knowledge | Plaintext passwords never stored |

---

## 🚀 Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js + Express
- MongoDB Atlas + Mongoose
- bcryptjs
- JSON Web Tokens (JWT)
- Helmet.js
- express-rate-limit
- express-validator
- Morgan

### Security
- AES-256-CBC encryption
- bcrypt password hashing
- JWT session management
- Rate limiting & brute force protection

---

## 📁 Project Structure

```
ciphervault/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── passwordController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── validators.js
│   ├── models/
│   │   ├── User.js
│   │   └── Password.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── passwordRoutes.js
│   ├── utils/
│   │   └── encryption.js
│   ├── .env.example
│   └── server.js
│
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Vault.jsx
        ├── services/
        │   └── api.js
        ├── App.jsx
        └── main.jsx
```

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/Deepakseenu/ciphervault.git
cd ciphervault
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/passwordmanager
JWT_SECRET=your_super_secret_jwt_key
ENCRYPTION_KEY=your_32_character_encryption_key
```

Start backend:
```bash
node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
http://localhost:5173

---

## 🔌 API Endpoints

### Auth Routes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Create new account | ❌ |
| POST | /api/auth/login | Login + get JWT token | ❌ |

### Password Routes
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/passwords | Get all passwords (decrypted) | ✅ JWT |
| POST | /api/passwords | Add new password (encrypted) | ✅ JWT |
| PUT | /api/passwords/:id | Update password entry | ✅ JWT |
| DELETE | /api/passwords/:id | Delete password entry | ✅ JWT |

---

## 🔐 How Encryption Works
User enters password → AES-256-CBC encryption → Random IV generated
→ IV + encrypted string stored in MongoDB
→ On retrieval: IV extracted → AES-256 decryption → Plain password returned

**Database breach scenario:**
Even if an attacker gains full database access, they see:
- Master password: `$2b$12$xK9mN2...` (bcrypt hash — irreversible)
- Saved passwords: `a3f8c2:8f3a2c1b...` (AES-256 — unreadable without key)

---

## 👥 Team

| Member | Role |
|---|---|
| Deepak R | Backend Lead — Auth, Encryption, APIs |
| Member 2 | Frontend Lead — UI, Components, Pages |
| Member 3 | Full Stack — DB, Integration, Deployment |

---

## 📈 Roadmap

- [x] User authentication (JWT)
- [x] AES-256 password encryption
- [x] Password vault CRUD
- [x] Security hardening (Helmet, Rate limiting)
- [x] Password strength meter
- [x] Auto session lock
- [ ] Two-factor authentication (2FA)
- [ ] Password breach checker
- [ ] Deploy to production

---

## 📄 License

MIT License — feel free to use this project for learning purposes.

---

> Built with ❤️ as part of internship project — demonstrating real-world security implementation