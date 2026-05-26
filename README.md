# PrepZify — AI-Powered Campus Placement Preparation Platform

> **Ace your campus drive** with AI mock interviews, resume analysis, study roadmaps, and live expert sessions.

---

## 📁 Project Structure

```
Prepzify/
├── backend/            ← Express API server (Node.js + TypeScript)
│   ├── server.ts       ← All API routes (Gemini AI, health check)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/           ← React + Vite app (TypeScript + TailwindCSS)
│   ├── src/            ← All components, services, context, etc.
│   ├── index.html
│   ├── vite.config.ts  ← Dev proxy: /api → http://localhost:3000
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── package.json        ← Root: runs both with one command
```

---

## 🚀 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/gyanshankar1708/Prepzify-Empowering-Prepration.git
cd Prepzify
```

### 2. Install all dependencies

```bash
npm run install:all
```

### 3. Configure environment variables

**Backend** — copy and fill in:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set GEMINI_API_KEY
```

**Frontend** — copy and fill in:
```bash
cp frontend/.env.example frontend/.env
# Default: VITE_API_URL=http://localhost:3000 (works out of the box)
```

### 4. Run in development

```bash
# From the project root — runs backend + frontend concurrently:
npm run dev
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:5173      |
| Backend  | http://localhost:3000      |
| Health   | http://localhost:3000/api/health |

---

## 🔧 Individual Commands

### Backend only

```bash
cd backend
npm run dev      # development (tsx watch — hot reload)
npm run build    # compile to dist/server.cjs
npm run start    # run production build
```

### Frontend only

```bash
cd frontend
npm run dev      # Vite dev server with HMR
npm run build    # production build → frontend/dist/
npm run preview  # preview the production build locally
```

---

## 🏗️ Production Deployment

### Backend
1. Set `NODE_ENV=production` and `FRONTEND_URL=https://your-domain.com` in `backend/.env`
2. Run `npm run build` inside `backend/` → outputs `dist/server.cjs`
3. Deploy `backend/dist/server.cjs` to any Node.js host (Railway, Render, EC2, etc.)

### Frontend
1. Set `VITE_API_URL=https://your-api-domain.com` in `frontend/.env`
2. Run `npm run build` inside `frontend/` → outputs `frontend/dist/`
3. Deploy `frontend/dist/` to any static host (Vercel, Netlify, Firebase Hosting, S3)

---

## 🛠️ Tech Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Frontend  | React 19, TypeScript, Vite, TailwindCSS v4   |
| Backend   | Node.js, Express 4, TypeScript, tsx          |
| AI        | Google Gemini API (`@google/genai`)          |
| Auth & DB | Firebase (Auth + Firestore)                  |
| Charts    | Recharts                                     |
| Animation | Motion (Framer Motion)                       |
| PDF       | jsPDF, pdf.js, html2canvas                   |

---

## 🔑 Environment Variables

### `backend/.env`

| Variable        | Required | Description                              |
|-----------------|----------|------------------------------------------|
| `GEMINI_API_KEY`| ✅       | Google AI Studio API key                 |
| `PORT`          | ❌       | Server port (default: `3000`)            |
| `NODE_ENV`      | ❌       | `development` / `production`             |
| `FRONTEND_URL`  | ❌       | Production frontend URL (for CORS)       |

### `frontend/.env`

| Variable        | Required | Description                              |
|-----------------|----------|------------------------------------------|
| `VITE_API_URL`  | ❌       | Backend URL (default: `http://localhost:3000`) |

---

## 📝 License

MIT © Gyanshankar Singh
