# CampusConnect: Master Implementation & Fast-Track Execution Plan

**Project:** CampusConnect | **Event:** CodeBlitz 2.0 (HackForge) | **Institution:** Pranveer Singh Institute of Technology (PSIT)  
**Core Domain:** Verified Peer Exchange & Student Collaboration  

---

## 1. Executive Summary & Architectural Overview

CampusConnect is a closed-campus, trust-verified mobile ecosystem uniting:
1. **Campus Marketplace:** Buy/sell/rent idle academic equipment (lab coats, drafting kits, books, notes) with cash or karma tokens.
2. **Peer Skill Exchange:** Discover peer mentors, request 1-on-1 tutoring, code reviews, and project guidance.
3. **Study Group Finder:** Discover and organize study groups matched by subject/module and campus location hotspots.
4. **Zero-Trust Security & Trust Engine:** Institutional domain gating (`@psit.ac.in`), CSPRNG OTP & Ephemeral QR Handshake Verification executed inside atomic transactions, Socket.io sandboxed channels, and Karma token mechanics.

```mermaid
flowchart TD
    subgraph Client["Cross-Platform Mobile Client (React Native / Expo)"]
        UI[App UI: Marketplace / Skills / Study / Handshake]
        Cam[Camera & QR Scanner]
        Map[Mapbox Campus Map]
        SocketClient[Socket.io Client]
    end

    subgraph Auth["Identity & Verification"]
        FA[Firebase Auth]
        BF[Blocking Functions / Domain Regex]
    end

    subgraph Backend["Node.js + Express Backend Engine"]
        MW[Auth Middleware - Firebase Admin SDK]
        API[REST APIs: Users, Marketplace, Skills, Study]
        CryptoEngine[Handshake Engine: CSPRNG OTP / QR JWT]
        SocketServer[Socket.io Server - Sandboxed Rooms]
    end

    subgraph Database["MongoDB Atlas"]
        M0[(Users & Profiles)]
        M1[(Listings & Items)]
        M2[(StudySessions & Hotspots)]
        M3[(Transactions & OTP Hashes)]
    end

    UI -->|1. .edu Auth| FA
    FA -->|2. Custom Claims| MW
    UI -->|3. Bearer Token| MW
    MW --> API
    API --> CryptoEngine
    API --> Database
    SocketClient <-->|4. Auth Handshake + Real-time Events| SocketServer
    SocketServer --> Database
    Map -->|Geolocations| API
```

---

## 2. Project Directory Structure

```
campus-connect/
├── backend/
│   ├── src/
│   │   ├── config/             # MongoDB, Firebase Admin, Environment config
│   │   ├── controllers/        # Auth, User, Marketplace, Skill, Study, Handshake
│   │   ├── middlewares/        # authMiddleware, rateLimiter, socketAuth
│   │   ├── models/             # User, Listing, StudySession, Transaction, Rating
│   │   ├── routes/             # REST Endpoints (/api/v1/...)
│   │   ├── services/           # CryptoService (CSPRNG, SHA-256, timingSafeEqual), KarmaService
│   │   ├── sockets/            # Socket.io handlers (study rooms, exchange handshake)
│   │   ├── utils/              # Response formatters, domain validators
│   │   └── server.js           # Server & Socket initialization
│   ├── tests/                  # API and Unit Tests
│   └── package.json
│
├── mobile/                     # React Native (Expo SDK)
│   ├── assets/                 # Icons, campus maps, splash screens
│   ├── src/
│   │   ├── api/                # Axios client & REST services
│   │   ├── components/         # Shared UI (Cards, QR Viewer, Camera Scanner, MapView)
│   │   ├── context/            # AuthContext, SocketContext, KarmaContext
│   │   ├── navigation/         # Tab & Stack Navigators
│   │   ├── screens/
│   │   │   ├── auth/           # Login, Domain Verification, Skill Onboarding
│   │   │   ├── marketplace/    # Browse, Add Listing, Item Details, Chat & Handshake
│   │   │   ├── skills/         # Find Mentor, Tutoring Requests, Profile View
│   │   │   ├── study/          # Mapbox Campus Hubs, Active Rooms, Group Chat
│   │   │   └── profile/        # Karma, Badges, History, Ratings
│   │   └── utils/              # Helpers & Constants
│   ├── App.js
│   └── package.json
└── README.md
```

---

## 3. Database Schema Design (MongoDB Atlas)

```mermaid
erDiagram
    USER ||--o{ LISTING : creates
    USER ||--o{ STUDY_SESSION : hosts_or_joins
    USER ||--o{ TRANSACTION : participates
    USER ||--o{ RATING : gives_or_receives

    USER {
        ObjectId _id PK
        string firebaseUid UK
        string email
        string fullName
        string collegeId
        string department
        number academicYear
        number karmaScore
        boolean isVerified
        string[] skillsOffered
        string[] skillsNeeded
        date createdAt
    }

    LISTING {
        ObjectId _id PK
        ObjectId sellerId FK
        string title
        string description
        string itemType "gear | notes | kit"
        number price
        string pricingModel "cash | karma | rent"
        string status "available | reserved | completed"
        string[] images
        date createdAt
    }

    STUDY_SESSION {
        ObjectId _id PK
        string subjectCode
        string topic
        ObjectId creatorId FK
        ObjectId[] attendeeList FK
        object locationCoordinates
        string campusZone "Library Pod A | Lab 3 | Cafeteria Hub"
        string status "active | closed"
        date scheduledTime
    }

    TRANSACTION {
        ObjectId _id PK
        ObjectId listingId FK
        ObjectId buyerId FK
        ObjectId sellerId FK
        string otpHash
        number failedAttempts
        string status "pending | verified | completed | expired"
        date expiresAt "TTL Index (15 min)"
        date completedAt
    }

    RATING {
        ObjectId _id PK
        ObjectId transactionId FK
        ObjectId reviewerId FK
        ObjectId revieweeId FK
        number stars
        string feedback
        number karmaAwarded
    }
```

---

## 4. Phased Implementation Roadmap (Optimized for Minimum Required Time)

To deliver a production-ready, fully functional MVP in minimal turnaround time, the execution is structured into **5 distinct phases**:

```mermaid
flowchart LR
    P0["Phase 0: Scaffold & Core Engine<br/>(Hours 0-2)"] --> P1["Phase 1: Zero-Trust Auth & User Profiles<br/>(Hours 2-4)"]
    P1 --> P2["Phase 2: Marketplace & Handshake Verification<br/>(Hours 4-7)"]
    P2 --> P3["Phase 3: Real-Time Skills & Study Groups<br/>(Hours 7-10)"]
    P3 --> P4["Phase 4: Mapbox, Polishing & Demo Ready<br/>(Hours 10-12)"]
```

### ⏱️ Detailed Phase Breakdown

| Phase | Milestone / Focus | Key Deliverables | Fast-Track Velocity Enabler |
| :--- | :--- | :--- | :--- |
| **Phase 0** | **Environment & Architecture Scaffolding** | • Unified repository setup (`backend/` Node.js + `mobile/` React Native/Expo)<br>• Mongoose schema definitions & connection pool<br>• Socket.io server skeleton & Base UI theme | Pre-configured boilerplate structure and mock harness for non-blocking local dev. |
| **Phase 1** | **Institutional Auth & Trust Engine Core** | • `.edu` / `@psit.ac.in` domain regex validator<br>• Firebase token validation middleware<br>• Profile creation (skills offered/needed, karma balance) | Mock auth bypass switch for local testing + live Firebase Auth verification. |
| **Phase 2** | **Marketplace & Cryptographic Handshake** | • Listing CRUD + category filtering (gear/notes)<br>• CSPRNG 6-digit OTP generation + SHA-256 hash storage<br>• Ephemeral QR code generation (JWT payload)<br>• `crypto.timingSafeEqual` & atomic MongoDB transaction commit for karma payout | Isolate CryptoService with automated unit tests for instant validation. |
| **Phase 3** | **Peer Skills, Study Groups & WebSockets** | • Peer skill discovery & request queue<br>• Study group creation by subject code / campus zone<br>• Socket.io room sandboxing & live messaging channels<br>• Rate limiter (30 msgs/min per socket client) | Reusable chat UI component shared between 1-on-1 peer exchange and study group rooms. |
| **Phase 4** | **Mapbox Integration, Ratings & Demo Flow** | • Mapbox campus hotspot overlays (Library, Labs, Safe Exchange Zones)<br>• Peer rating submission & karma leaderboards<br>• End-to-end user journey test (`Auth -> Discover -> Match/Chat -> Handshake`) | Pre-seed PSIT campus coordinates and sample listings for instantaneous live demo. |

---

## 5. Security & Threat Mitigation Directives

| Threat Vector | Mitigation Strategy | Implementation Mechanism |
| :--- | :--- | :--- |
| **Public Domain Spoofing** | Reject non-institutional domains | Regex check `@psit.ac.in` / `.edu` in Firebase trigger & API middleware |
| **Brute-Force OTP** | Rate limiting on verification | Max 5 failed attempts per transaction; 15-minute lockout |
| **Timing Attacks** | Constant-time string comparison | `crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))` |
| **Replay Attacks** | Immediate OTP/QR invalidation | Invalidate token and hash upon first successful transaction |
| **Chat Spam & DoS** | Socket.io packet throttling | Rate limiter capped at 30 messages/minute per client socket |
| **Double-Spending / Inconsistent State** | Atomic ledger updates | `session.withTransaction()` commit updating transaction state & awarding karma |

---

## 6. Execution Plan & Next Steps

1. **Step 1:** Initialize the project root with `backend/` (Node.js/Express) and `mobile/` (React Native Expo).
2. **Step 2:** Implement Backend Database Models, Crypto Handshake Engine, and Domain Validation Middleware.
3. **Step 3:** Implement Core REST APIs (Marketplace, Study Sessions, Skills, Handshake) with test coverage.
4. **Step 4:** Integrate Socket.io server with authentication and sandboxing.
5. **Step 5:** Build Mobile UI Screens (Auth, Marketplace, Study Groups, QR Scanner/Generator, Mapbox view).
6. **Step 6:** Execute full integration test and prepare demo dataset.
