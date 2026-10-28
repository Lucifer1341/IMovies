# IMovies — Movie Ticket Booking Made Simple

A cinematic, full-stack movie discovery and ticket reservation web application designed and built from scratch with an **Obsidian Red** visual theme, concurrency-safe seat reservation, simulated payment processing, and cryptographically verified digital admission passes.

---

## 1. System Architecture

```
PROJECT ULTRA PRO MAX/
├── client/                     # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/         # Modular layout, movie cards, promo banners
│   │   ├── context/            # Authentication & session state management
│   │   ├── pages/              # 8 Full Application Screens
│   │   ├── services/           # Axios API Client with interceptors
│   │   ├── App.jsx             # React Router Declarative Routes
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Cinematic Obsidian Theme Tokens & Styles
│   ├── tailwind.config.js      # Custom theme palette & glow shadows
│   └── vite.config.js          # Proxy routes & dev server configuration
│
└── server/                     # Node.js + Express + Mongoose + Socket.IO API
    ├── src/
    │   ├── config/             # Database connection, env loader, in-memory fallback
    │   ├── controllers/        # Auth, movies, shows, holds, bookings, tickets, admin
    │   ├── middleware/         # JWT verification, admin guard, error handler
    │   ├── models/             # Mongoose schemas (User, Movie, Cinema, Show, etc.)
    │   ├── routes/             # RESTful API route declarations
    │   ├── utils/              # Database seed script & admin bootstrapper
    │   └── index.js            # Express & Socket.IO server entry point
    └── tests/                  # Vitest + Supertest integration test suite
```

---

## 2. Key Features

- **Cinematic Obsidian UI System**: Custom-crafted dark theme (`#0a0e18`) with cinema-red accent (`#e50914`), amber highlights, restrained glows, and curved screen geometry.
- **Movie Discovery & Search**: Filter by genre, search by query, browse *Now Showing* and *Coming Soon* titles.
- **Cinema & Showtime Scheduling**: Multi-auditorium scheduling (Standard, 4K, IMAX) across Bengaluru multiplexes.
- **Interactive Cinema Seat Map**: Authoritative seat selection with Standard, VIP, Accessible, and Student Saver tiers.
- **Concurrency-Safe Seat Holds**: 5-minute atomic reservation holds with live countdown timers to prevent overselling.
- **Student Saver Pass**: Verified campus discounts (20% off code `STUDENT20` and ₹149 tickets).
- **Simulated Payment Engine**: Safe, demo-payment flow calculating authoritative server-side totals without charging real funds.
- **Digital Tickets with QR Verification**: Perforated cinema pass styling, QR verification tokens, print/share features.
- **Administrative Operations Console**: Real-time revenue analytics, movie catalog management, and user privilege controls.
- **Dual-Storage Resilience**: Works with live MongoDB or falls back gracefully to the built-in in-memory catalog store.

---

## 3. Quick Start & Local Execution

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- MongoDB (Optional: app automatically uses memory datastore if MongoDB is not running locally)

### Step 1: Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### Step 2: Seed Sample Catalog & Admin
```bash
cd server
npm run seed
```

### Step 3: Run the Application
In separate terminal windows:

**Terminal A (Backend API on Port 5000):**
```bash
cd server
npm start
```

**Terminal B (Frontend SPA on Port 5173):**
```bash
cd client
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

## 4. Default Seed Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@imovies.dev` | `Admin@12345!` | Full Console & CRUD |
| **Student** | `student@campus.edu` | `User@12345!` | Verified Student Pass |

---

## 5. Automated Tests

Run the test suite covering authentication, seat holds, concurrency conflict rejection, server-side pricing, promo validation, demo payment, and ticket QR verification:

```bash
cd server
npm test
```

All 16 test suites pass with zero failures.

---

## 6. Production Deployment

### Frontend (Vercel / Netlify)
1. Build output directory: `client/dist`
2. Build command: `npm run build`
3. Environment variables: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend (Render / Railway / DigitalOcean)
1. Root directory: `server`
2. Start command: `node src/index.js`
3. Environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/imovies`
   - `JWT_SECRET=<long-random-string>`
   - `CLIENT_URL=https://your-frontend.vercel.app`
