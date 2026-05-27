# 🎓 PrepZify — AI-Powered Campus Placement Preparation Platform

> **Supercharge your campus drive preparation.** PrepZify is an elite placement preparation platform combining cutting-edge Google Gemini AI model logic, real-time proctored simulations, customized roadmap builders, and advanced resume intelligence tools into a cohesive and aesthetic application.

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

### 🎙️ 1. Olivia — AI Mock Interviewer
* **High-Fidelity Dialogue**: Fully natural, speech-synthesized interactive conversational mock interviews powered by the `@google/genai` API (`gemini-2.0-flash`).
* **Custom Persona**:Olivia acts as a seasoned technical lead or HR executive, reacting dynamically to the user's responses, offering industry-grade questioning.
* **Integrated STT & TTS**: Real-time browser-based Speech Recognition (Speech-To-Text) and natural Speech Synthesis (Text-To-Speech) with customizable pacing and human-like pitches.
* **Comprehensive Performance Reviews**: In-depth analytical reports with scores for clarity, jargon usage, filler word tracking, custom action tips, and pros & cons.
* **Transcript Exports**: Instantly download complete interaction records as structured `.txt` files for self-review.

### 🛡️ 2. Real-Time Face & Gaze Proctoring
* **Edge-Based Face Landmarks**: Direct client-side AI analysis using **TensorFlow.js** and **MediaPipe FaceMesh** running inside the browser context (zero backend video latency).
* **Multi-Face Detection**: Flags if another person enters the camera field to ensure test integrity.
* **Eye-Tracking & Jitter Heuristics**: Dynamic movement analyzer monitors pupil movement and gaze directions, warning users immediately if they look away from the screen.
* **Orientation Profiles**: Measures head rotational coordinates to detect side-facing postures or screen-switching patterns during the assessment.

### 💻 3. Practice Arena
* **Monaco Coding Environment**: A fully integrated Visual Studio Code-like text editor inside the browser supporting multi-tab panels.
* **Comprehensive Languages**: Practice in **JavaScript**, **Python**, **C++**, and **Java** with custom language syntax highlighting and starter code generators.
* **AI Solutions Compiler**: Non-JS runtimes are fully simulated using high-precision Gemini code execution engines, verifying syntax and functional output.
* **Gemini Automated Test Suites**: Competitive programming assessment engine that runs student code against all edge cases and structural constraints, generating clean outputs or debugging notes.
* **Gamification Core**: Earn XP on successful solutions. Progress through multiple professional ranks (e.g., *Junior Engineer* ➡️ *Senior Architect* ➡️ *Elite Architect*).

### 📄 4. Resume Intelligence & ATS Grading
* **PDF Parser Engine**: High-performance extraction of PDF structures using client-side `pdfjs-dist` pipelines.
* **ATS Compatibility Score**: Automated metrics evaluating grammar, structure, structural hierarchy, and structural searchability.
* **Semantic Gaps Extractor**: Discovers mismatching skills, suggesting critical learning goals and concrete software engineering projects to build.
* **One-Click Word Export**: Instantly export a completely tailored, recruiter-ready `.docx` resume directly to your local file system.
* **Job Matchmaking**: Matches parsed skills against live job recommendations, supplying estimated salary ranges, candidate compatibility fits, and step-by-step applying metrics.

### 🗺️ 5. Personalized Career Roadmaps
* **Phase-Based Milestones**: High-fidelity timeline roadmap detailing what skills to master and in what sequence, tailored to specific engineering branches and roles.
* **Micro-Learning Actions**: Breaks large career goals down into small daily checkpoints.
* **Topic-Based Navigation**: Easily jump from career roadmaps straight to relevant practice questions in the Practice Arena.

---

## 📁 Monorepo Project Structure

```
Prepzify/
├── backend/                  ← Express Server Workspace (Node.js + TS)
│   ├── dist/                 ← Production build files
│   ├── server.ts             ← Main API Router & Controller logic
│   ├── tsconfig.json         ← Backend TypeScript compiler settings
│   ├── package.json          ← Server package settings & build pipelines
│   └── .env.example          ← Sandbox environment template
│
├── frontend/                 ← React UI Workspace (Vite + TS + TailwindCSS)
│   ├── src/
│   │   ├── components/       ← UI layouts, Sidebar, Dashboard, overlays, reports
│   │   ├── context/          ← Global Theme & Subscription contexts
│   │   ├── data/             ← Static questions & curriculum database
│   │   ├── lib/              ← Firebase connectors & Docx exporters
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
| **Styling System** | TailwindCSS v4, CSS Variables | Glassmorphic visual states, adaptive grid modules |
| **Animation Core** | Motion (Framer Motion v12) | Elegant 3D page transitions, slide components, micro-interactions |
| **Backend API** | Node.js, Express 4, tsx | API Routing, nodemailing, Razorpay integration, CORS policies |
| **Cognitive AI** | `@google/genai` (`gemini-2.0-flash`) | Core mock dialogue, code reviews, automated grading |
| **Visual proctoring** | TensorFlow.js, MediaPipe FaceMesh | Browser-based landmark analysis, pupillary monitoring |
| **Database & Auth** | Firebase (Auth + Cloud Firestore) | Session storage, user profiles, stats, leaderboards |
| **Interactive Editor**| Monaco Editor (`@monaco-editor/react`) | Rich editor, bracket matches, custom starter templates |
| **Document Handlers** | jsPDF, pdf.js, html2canvas | Client-side resume parsing and audit report conversions |
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
EMAIL_USER=your_support_email@gmail.com
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

## 💳 Pricing Tiers & Subscription Matrix

Integrated directly into user contexts (`SubscriptionContext.tsx`), users can choose from the following tiers using Razorpay checkout flows (or simulating transactions via the **Developer Sandbox**):

| Package Tier | Pricing Value | Duration | Primary Features Included |
| :--- | :--- | :--- | :--- |
| **Free** | ₹0 | Unlimited | 1 AI Video Interview/week, 2 ATS Resume Audits/month, 15 AI Chats, Basic Curricula |
| **Pro** | ₹199 | 30 Days | 5 AI Mock Interviews/week, Unlimited ATS Reviews, Unlimited Coding, 300 AI Chats |
| **Pro+** | ₹499 | 90 Days | 20 Company-Specific Interviews, AI Code Reviews, Priority Support, Smart Analytics |
| **Elite** | ₹1499 | 365 Days | 100 mock interviews, Placement Readiness Score, Long-Term Tracking, Priority Features |

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

### 🎟️ Nodemailer Support tickets
* **`POST /api/support/ticket`**
  * **Description**: Dispatches detailed user feedback/support requests directly to administration email accounts.
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

### 🤖 Gemini AI Pipelines
* **`POST /api/gemini/generate`**
  * **Description**: Base completion wrapper. Accommodates system instructions, image binary payloads (base64), and model presets.
* **`POST /api/gemini/interview`**
  * **Description**: Conversation route that handles message arrays, alternates user/model chat histories, and prompts the technical mock dialogue flow.

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
3. Deploy the compiled files inside `frontend/dist/` directly to static CDN engines (Vercel, Netlify, Firebase Hosting).

### Backend Build
1. Bundle the server files using **esbuild**:
   ```bash
   cd backend
   npm run build
   ```
2. The bundled file outputs to `backend/dist/server.js`.
3. Set your production environmental parameters on your node hosting service (Render, Railway, EC2) and run:
   ```bash
   npm run start
   ```

---

## 📝 License & Contact

This project is licensed under the **MIT License**.

Developed with 💜 by **Gyanshankar Singh** and the PrepZify Open Source Community. For inquiries or business options, submit a support ticket directly through the PrepZify support dashboard.
