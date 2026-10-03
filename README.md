# CampusConnect 🎓🤝

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-green?logo=node.js)](https://nodejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-white?logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-ISC-purple.svg)](LICENSE)

**CampusConnect** is a hyper-local, zero-trust peer-to-peer academic ecosystem engineered for Indian college campuses. It unifies peer mentoring, course syllabus skill matching, academic gear exchange (books, drafters, lab coats, components), and designated campus safe meetup zones under a cryptographically authenticated zero-fraud handshake protocol and a tamper-resistant Campus Karma reputation ledger.

---

## 🚀 Key Features

### 1. Multi-College Institutional Ecosystem
* **College Selection First**: Seamless onboarding allowing students across institutions (PSIT Kanpur, IIT Kanpur, HBTU Kanpur, DTU Delhi, VIT Vellore, and custom institutions) to identify their campus and academic department.
* **Intra- & Inter-Campus Discovery**: Browse peer skills and academic gear filtered by campus or explore cross-campus opportunities.

### 2. Physical Handshake Verification (Zero-Trust)
* **Cryptographic Dual Verification**: Prevents meetup fraud during in-person exchanges.
* **Buyer vs. Seller Modes**: Sellers display dynamic 6-digit OTPs and ephemeral signed QR codes (15-minute TTL); buyers authenticate using discrete 6-box inputs or an interactive simulated camera viewfinder scanner.
* **Constant-Time Verification**: Server-side `crypto.timingSafeEqual` authentication protects against timing attacks.

### 3. Campus Karma Reputation & Audit Ledger
* **Reputation Progression**: Multi-tiered student progression roadmap (**Bronze Scholar** ➔ **Silver Mentor** ➔ **Gold Pioneer** ➔ **Platinum Legend**).
* **Transparent Activity History**: Real-time ledger recording Karma points earned from successful handshakes (+15), mentoring sessions (+10), gear listings (+5), and 5-star peer reviews (+5).
* **Actionable Earning Guide**: In-app guide explaining point systems and quick-launch activities.

### 4. Interactive Spatial Campus Map & Hotspots
* **Campus Radar & Blueprint**: Aerial interactive blueprint for campuses with real-time GPS coordinates.
* **Categorized Hotspots**: Filter between **Safe Handshake Zones** (24/7 guarded, CCTV monitored), **Quiet Study Pods** (power sockets, 500Mbps Wi-Fi), and **Tech/Coding Labs**.
* **Turn-by-Turn Navigation**: Step-by-step walking directions for reaching exchange points and study pods.

### 5. Peer Skill Exchange & Academic Marketplace
* **Syllabus Skill Matching**: Connect with peers by course codes (e.g., DBMS `KCS501`, Operating Systems `KCS401`, Data Structures `KCS301`).
* **Gear Marketplace with Photos & Condition Reports**: List textbooks, lab coats, and engineering drafters with device photo uploads, multi-tier condition tagging, and seller notes.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router with Turbopack), React 19, TypeScript |
| **Styling & Icons** | Tailwind CSS v4, Lucide React Icons |
| **Backend API** | Node.js, Express 5, RESTful architecture |
| **Real-Time Communication** | Socket.io (WebSocket duplex channel for instant handshake synchronization) |
| **Database & Persistence** | Dual-mode architecture: MongoDB / Mongoose with resilient In-Memory fallback store |
| **Security & Cryptography** | Node.js `crypto` (`timingSafeEqual`, SHA-256 HMAC), Helmet, Express Rate Limit |
| **Authentication** | Firebase Admin SDK integration with local token session bypass for mock development |

---

## 📁 Project Structure

```
Campus_Connect/
├── .github/                       # GitHub workflows and templates (if applicable)
├── public/                        # Static assets, SVG graphics, and icons
├── server/                        # Express backend engine
│   ├── config/                    # Database (MongoDB) and Firebase Admin SDK configurations
│   ├── controllers/               # Route handlers (auth, exchange, marketplace, user, karma)
│   ├── middlewares/               # Token authentication, domain validation, rate limiting
│   ├── models/                    # Mongoose schemas (User, Listing, Transaction, Rating)
│   ├── routes/                    # API endpoints (/auth, /marketplace, /users, /exchange)
│   ├── services/                  # Business logic (cryptoService, dual-mode storeService)
│   ├── sockets/                   # Real-time WebSocket handlers
│   ├── utils/                     # Standardized JSON response utilities
│   └── server.js                  # Express and Socket.io bootstrap entry point
├── src/                           # Next.js frontend application
│   ├── app/                       # App Router pages ((auth), (dashboard), layout, globals.css)
│   │   ├── (auth)/                # Login, register, profile setup
│   │   ├── (dashboard)/           # Dashboard, marketplace, handshake, map, skills, study-groups
│   │   └── page.tsx               # CampusConnect landing page
│   ├── components/                # Reusable UI widgets (Navbar, AuthModal, KarmaModal)
│   ├── context/                   # React Context providers (AuthContext, SocketContext)
│   ├── lib/                       # API clients (Axios), college database, socket manager
│   └── types/                     # Shared TypeScript interfaces
├── tests/                         # Automated end-to-end and API integration tests
│   └── e2e_verification.js        # Automated smoke test suite
├── .env.example                   # Environment configuration template
├── .gitignore                     # Repository exclusions (node_modules, .env, .next)
├── IMPLEMENTATION_PLAN.md         # Phased system implementation roadmap & architecture spec
├── next.config.ts                 # Next.js build configuration
├── nodemon.json                   # Backend server auto-reload configuration
├── package.json                   # Unified dependencies and operational scripts
├── postcss.config.mjs             # PostCSS / Tailwind CSS pipeline configuration
├── README.md                      # Project documentation and developer guide
└── tsconfig.json                  # TypeScript compiler settings
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **npm**: v9.0.0 or higher
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/YatharthaSrivastava/Campus_Connect.git
cd Campus_Connect
```

### 2. Install Dependencies
Install all unified frontend and backend dependencies using the root `package.json`:
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to create your local `.env` and `.env.local` files:
```bash
# Backend environment configuration
cp .env.example .env

# Frontend environment configuration
cp .env.example .env.local
```

---

## 🔐 Environment Variables

The project includes pre-configured fallback values for local development out of the box. Create `.env` in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Optional - falls back to resilient In-Memory Store if omitted)
MONGODB_URI=mongodb://localhost:27017/campus_connect

# Security
JWT_SECRET=your_super_secret_jwt_key_here
ALLOWED_DOMAINS=psit.ac.in,iitk.ac.in,hbtu.ac.in

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# Client-Side API Endpoint (for .env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

> [!NOTE]
> Never commit actual credentials, private keys, or `.env` files to source control. Only commit `.env.example`.

---

## 🏃 Running the Application

You can run both the frontend and backend concurrently or independently from the project root.

### Run Next.js Frontend (Port 3000)
```bash
npm run dev
# or
npm run dev:frontend
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Express Backend (Port 5000)
In a separate terminal:
```bash
npm run dev:backend
# or
npm run dev:server
```
Backend API will be live at [http://localhost:5000](http://localhost:5000) with WebSocket channel active.

### Health Check Endpoint
To verify backend connectivity:
```bash
curl http://localhost:5000/health
```

### Run Automated E2E Verification Tests
To run the automated API and authentication flow test suite:
```bash
npm run test:e2e
```

### Production Build
```bash
npm run build
npm run start
```

---

## 🤝 Contributing & Guidelines
1. Ensure all code conforms to TypeScript and ESLint standards (`npm run lint`).
2. Follow zero-trust physical safety conventions for all exchange features.
3. Test all cryptographic methods against `crypto.timingSafeEqual`.

---

## 📄 License
This project is licensed under the ISC License.

