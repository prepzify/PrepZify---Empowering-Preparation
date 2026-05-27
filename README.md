# 🎓 PrepZify — AI-Powered Campus Placement Preparation Platform

> **Supercharge your campus drive preparation.** PrepZify is an elite placement preparation platform combining cutting-edge Google Gemini AI model logic, client-side proctored face/gaze simulations, Monaco coding practice arenas, customized timeline roadmap builders, and advanced resume intelligence tools into a cohesive and aesthetic application.

<p align="center">
  <img src="https://img.shields.io/badge/Vite-6.x-B73BFE?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Google_Gemini-2.0--flash-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Firebase-v12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/TensorFlow.js-1.x-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow" />
</p>

---

## 🌟 Core Features

### 🎙️ 1. Olivia — AI Mock Interviewer & Resume Sync
* **Cohesive Resume-to-Interview Link**: Instantly bridges the **Resume Intelligence** and **Mock Interview** views. Olivia parses candidate details (Name, Tech Stack, target role, and experience) directly from the uploaded/pasted resume.
* **Recruiter-Specific Persona & Guidelines**: Olivia adapts her system prompts dynamically to match the target company's culture and hiring benchmarks (e.g., Googliness at Google, Leadership Principles at Amazon). She structures behavior and technical loops around the candidate's actual resume projects.
* **Premium Setup & Sync Badge**: Includes a glassmorphic `📄 Resume Profile Sync Active` banner displaying linked candidate name and tech stack, prompting users to sync their resume context or enter details manually.
* **High-Fidelity Dialogue**: Speech-synthesized technical and behavioral interviews powered by the `@google/genai` API (`gemini-2.0-flash`).
* **Integrated STT & TTS**: Real-time browser Speech Recognition (Speech-To-Text) and natural Speech Synthesis (Text-To-Speech) with customizable human-like pitches.
* **Analytical Performance Reviews**: In-depth reports grading clarity, filler word tracking, custom action tips, and pros & cons, alongside structured text transcript downloads.

### 🛡️ 2. Real-Time Face & Gaze Proctoring
* **Edge-Based Face Landmarks**: Direct client-side AI analysis using **TensorFlow.js** and **MediaPipe FaceMesh** running inside the browser context (zero video lag).
* **Multi-Face Detection**: Flags if another person enters the camera field to ensure test integrity.
* **Eye-Tracking & Jitter Heuristics**: Dynamic movement analyzer monitors pupil movement and gaze directions, warning users immediately if they look away from the screen.
* **Orientation Profiles**: Measures head rotational coordinates to detect side-facing postures or screen-switching patterns during the assessment.

### 💻 3. Monaco Practice Arena
* **Monaco Coding Environment**: A fully integrated Visual Studio Code-like text editor inside the browser supporting multi-tab panels.
* **Comprehensive Languages**: Practice in **JavaScript**, **Python**, **C++**, and **Java** with custom language syntax highlighting and starter code generators.
* **AI Solutions Compiler**: Non-JS runtimes are fully simulated using high-precision Gemini code execution engines, verifying syntax and functional output.
* **Gemini Automated Test Suites**: Competitive programming assessment engine that runs student code against all edge cases and structural constraints, generating clean outputs or debugging notes.

### 📄 4. Resume Intelligence & ATS Grading
* **PDF Parser Engine**: High-performance extraction of PDF structures using client-side `pdfjs-dist` pipelines.
* **ATS Compatibility Score**: Automated metrics evaluating grammar, structure, structural hierarchy, and structural searchability.
* **Semantic Gaps Extractor**: Discovers mismatching skills, suggesting critical learning goals and concrete software engineering projects to build.
* **One-Click Word Export**: Instantly export a completely tailored, recruiter-ready `.docx` resume directly to your local file system.
* **Job Matchmaking**: Matches parsed skills against live job recommendations, supplying estimated salary ranges, candidate compatibility fits, and step-by-step applying metrics.

### 🗺️ 5. Personalized Career & Campus Timelines
* **Personalized Branch Roadmaps**: Detailed timeline roadmaps outlining what skills to master and in what sequence, tailored to specific engineering branches and roles.
* **Campus Placement Planner**: Timeline-aware placement timeline builder mapping out recruitment phases and daily milestones tailored to specific company patterns (e.g. TCS, Infosys, Wipro, Amazon, Google).
* **Micro-Learning Actions**: Breaks large career goals down into small daily checkpoints.

---

## ⚡ Dynamic Streak, Consistency & Performance Progression

PrepZify incentivizes daily preparation and granular performance tracking through gamified progression systems:

### 💡 1. Granular Progress Checkpoints
* **Study Paths (Learning Hub)**: Adds checkboxes for both parent modules and sub-topics (curated video, article, and document resources). Checking resources strikes them out in real-time (`line-through opacity-60`), applies an elegant emerald glow (`border-emerald-500/25 bg-emerald-500/5`), and recalculates overall progression metrics.
* **Campus Placement Planner**: Allows checking off Day (Module) milestones and individual daily tasks (topics/checkpoints). Day 0 checklist is also fully checkable. Visualizes progress dynamically through a dedicated glassmorphic **Plan Progress** card.
* **Stat Reward Points**:
  - Completing a Campus Planner Day rewards the student with **+100 XP** and increments completed sessions.
  - Completing an individual Campus Planner Daily Task rewards the student with **+30 XP**.
  - Completing a Study Path Module rewards the student with **+150 XP** and 1 solved question count.
  - Users progress through professional engineering ranks (e.g., *Junior Engineer* ➡️ *Senior Architect* ➡️ *Elite Architect*).

### 🔥 2. Dynamic Active Streaks & Max Streak Tracking
* **Calendar-Aligned Streak Engine**: Tracks user consistency using a robust date-comparison algorithm. Clears calendar hours/minutes to match exact dates, keeping stats timezone-safe:
  - **Consecutive activity (Yesterday)**: Increments the active `streak` by 1 and updates the high-water `maxStreak` mark.
  - **Broken activity (Before Yesterday)**: Resets active `streak` back to 1.
  - **Active today**: Retains current active streak (avoids redundant writes).
* **Double Dashboard Display**: Displays the user's active streak count (`X Days`) alongside their all-time high `Max Streak: Y days` directly below the count inside the overview panel.
* **Unified Persistence**: Streaks and max streaks are synced dynamically to Firestore (`streak`, `maxStreak`) or stored in guest-scoped local storage (`bt_streak`, `bt_max_streak`, `bt_last_active`) for guests.

---

## 📁 Monorepo Project Structure

```
Prepzify/
├── backend/                  ← Express Server Workspace (Node.js + TS)
│   ├── dist/                 ← Production build files
│   ├── server.ts             ← Main API Router, Nodemailer & SMTP controllers
│   ├── tsconfig.json         ← Backend TypeScript compiler settings
│   ├── package.json          ← Server package settings & build pipelines
│   └── .env.example          ← Sandbox environment template
│
├── frontend/                 ← React UI Workspace (Vite + TS + TailwindCSS)
│   ├── src/
│   │   ├── components/       ← UI layouts, Auth, Leaderboards, Settings, Timelines
│   │   ├── context/          ← Global Theme & Subscription contexts
│   │   ├── data/             ← Static questions & curriculum database
│   │   ├── lib/              ← Firebase connectors, storage utilities, scroll handlers
│   │   ├── services/         ← API connectors (Gemini, DB, Proctor, Job, Payments)
│   │   └── types.ts          ← Shared TS interface models
│   ├── index.html            ← Base HTML entrypoint
│   ├── vite.config.ts        ← Reverse proxy setup (/api → localhost:3000)
│   ├── package.json          ← Frontend UI requirements & scripts
│   ├── tsconfig.json         ← React TypeScript rules
│   └── .env.example          ← UI sandbox variables
│
├── package.json              ← Root config: coordinates monorepo scripts
└── render.yaml               ← Direct cloud deployment configurations
```

---

## 🔧 Technical Stack Reference

| Component / Layer | Technology | Function / Description |
| :--- | :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite | Ultra-fast rendering with Hot Module Replacement (HMR) |
| **Styling System** | CSS, CSS Variables | Glassmorphic visual states, adaptive grid modules |
| **Animation Core** | Motion (Framer Motion v12) | Elegant 3D page transitions, slide components, micro-interactions |
| **Backend API** | Node.js, Express 4, tsx | API Routing, SMTP mailing, Razorpay integration, CORS policies |
| **Cognitive AI** | `@google/genai` (`gemini-2.0-flash`) | Core mock dialogue, code reviews, automated grading |
| **Visual proctoring** | TensorFlow.js, MediaPipe FaceMesh | Browser-based landmark analysis, pupillary monitoring |
| **Database & Auth** | Firebase (Auth + Cloud Firestore) | Session storage, user profiles, stats, leaderboards, progress sync |
| **Interactive Editor**| Monaco Editor (`@monaco-editor/react`) | Rich editor, bracket matches, custom starter templates |
| **Document Handlers** | jsPDF, pdf.js, html2canvas, docx | Client-side resume parsing and audit report conversions |
| **Visual Charts** | Recharts | Multi-axis Radar and polar angle charts mapping skill evolution |
| **Payment Gateway** | Razorpay SDK | Encrypted payment collection with fallbacks |

---

## 🔑 Environment Variables Setup

### Backend Config (`backend/.env`)

```ini
# ── Gemini AI ─────────────────────────────────────────────────────────────────
# Required. Acquire keys from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ── Server Config ─────────────────────────────────────────────────────────────
PORT=3000
NODE_ENV=development

# ── CORS Production URL ───────────────────────────────────────────────────────
# Enter production frontend domain (e.g. https://prepzify.com)
# Keep blank for local development to allow localhost.
FRONTEND_URL=

# ── Razorpay Payments ─────────────────────────────────────────────────────────
# Obtain credentials from Razorpay Settings Panel > API Keys.
# If these are mock key IDs, PrepZify switches to its interactive Developer Sandbox.
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ── SMTP Email Config (Nodemailer Support Tickets) ───────────────────────────
# Company email destination configured globally: teamprepzify@gmail.com
EMAIL_USER=your_smtp_sender_email@gmail.com
EMAIL_PASS=your_email_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Frontend Config (`frontend/.env`)

```ini
# ── Backend Connection ───────────────────────────────────────────────────────
# In development, the Vite server routes /api/* to this address.
VITE_API_URL=http://localhost:3000

# ── Razorpay Public Keys ──────────────────────────────────────────────────────
# Safe to expose publicly in browser.
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

---

## ⚡ Setup & Launch Guide

Ensure you have **Node.js (v18+)** and **npm** installed on your system.

### 1. Repository Initializing
```bash
git clone https://github.com/gyanshankar1708/PrepZify-Empowering-Prepration.git
cd PrepZify
```

### 2. Workspace Dependencies Installation
```bash
# Installs packages in both backend/ and frontend/ concurrently
npm run install:all
```

### 3. Inject Local Environment Parameters
Follow the [Environment Variables](#-environment-variables-setup) instructions above to populate your `.env` configs.

```bash
# Backend Setup
cp backend/.env.example backend/.env

# Frontend Setup
cp frontend/.env.example frontend/.env
```

### 4. Running Development Servers
```bash
# Starts both frontend (5173) and backend (3000) using a unified logging environment
npm run dev
```

* Frontend Dashboard: [http://localhost:5173](http://localhost:5173)
* Local Express Server: [http://localhost:3000](http://localhost:3000)
* Health Check Diagnostic: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 📡 REST API Reference

The backend Express application acts as an optimized, secure endpoint server.

### 🏥 System Status
* **`GET /api/health`**
  * **Description**: Diagnostic endpoint tracking dependencies, environment states, and timestamps.
  * **Response**: `200 OK`
    ```json
    {
      "status": "ok",
      "env": "development",
      "hasApiKey": true,
      "hasRazorpay": true,
      "timestamp": "2026-05-27T10:10:00.000Z"
    }
    ```

### 🎟️ Nodemailer Support Tickets
* **`POST /api/support/ticket`**
  * **Description**: Dispatches support requests directly to the company administration mailbox: `teamprepzify@gmail.com`.
  * **Payload**:
    ```json
    {
      "subject": "Billing issue",
      "message": "Double charged on subscription.",
      "email": "user@gmail.com"
    }
    ```
  * **Response**: `200 OK` on email sent/simulated.

### 💳 Payments Engine (Razorpay)
* **`GET /api/payments/plans`**
  * **Description**: Retrieves configured product specifications and rates.
* **`POST /api/payments/create-order`**
  * **Payload**: `{ "planId": "pro", "userId": "FirebaseUID123", "email": "user@gmail.com" }`
  * **Response**: Returns unique order ID and currency rates.
* **`POST /api/payments/verify`**
  * **Payload**: Requires `razorpay_order_id`, `razorpay_payment_id`, and cryptographic signature (`razorpay_signature`).
  * **Verification**: Computes a SHA256 HMAC utilizing the private secret and compares with client hashes to prevent payment spoofing.

---

## 🏗️ Production Deployment Build Guide

### Frontend Build
1. Set public API URL inside `frontend/.env`:
   ```ini
   VITE_API_URL=https://api.yourdomain.com
   ```
2. Build the optimized static bundle:
   ```bash
   cd frontend
   npm run build
   ```
3. Deploy compiled files inside `frontend/dist/` directly to static hosting services (Render, Vercel, Netlify, Firebase Hosting).

### Backend Build
1. Bundle server files using **esbuild**:
   ```bash
   cd backend
   npm run build
   ```
2. Bundled file outputs to `backend/dist/server.js`.
3. Set your production environmental parameters on your node hosting service (Render, Railway, EC2) and run:
   ```bash
   npm run start
   ```

---

## 📝 License & Contact

This project is licensed under the **MIT License**.

Developed with 💜 by **Gyanshankar Singh** and the PrepZify Open Source Community. For support, account queries, or corporate options, dispatch a ticket via the dashboard or reach out to **teamprepzify@gmail.com**.
