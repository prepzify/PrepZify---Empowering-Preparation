# 🎯 Prepzify – AI-Based Placement Preparation Platform

An AI-powered placement preparation platform that helps students with resume analysis, skill gap detection, personalized study planning, mock tests, interview simulation, company recommendations, and AI chatbot assistance.

## 🚀 Features

- **Resume Analyzer** – Upload PDF resume, get AI-powered score, skill extraction, and feedback
- **Mock Tests** – AI-generated MCQs based on resume skills or target company
- **AI Coding Tests** – Practice programming challenges with AI evaluation and test cases
- **Study Planner** – Personalized 4-week study roadmap based on your profile
- **Interview Simulation** – Practice with AI-generated questions, get instant feedback
- **Company Recommendations** – Companies matched to your skills and performance
- **AI Chatbot** – Context-aware assistant for placement queries
- **Dashboard** – Visual overview with charts, scores, and progress tracking
- **JWT Authentication** – Secure login/signup system

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Tailwind CSS v4, Recharts, React Router, CodeMirror |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini API |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Upload | Multer + pdf-parse |

## 📋 Prerequisites

- **Node.js** v18+ installed
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas connection string
- **Google Gemini API Key** – Get one at https://aistudio.google.com/apikey

## 🛠️ Setup Instructions

### 1. Clone and enter the project

```bash
git clone <repository_url>
cd Prepzify
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Edit `backend/.env` and set your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/prepzify
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app

Navigate to **http://localhost:5173** in your browser.

## 📁 Project Structure

```
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Route handlers
│   ├── middleware/auth.js     # JWT middleware
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express routes
│   ├── services/aiService.js # Gemini AI integration
│   ├── uploads/              # Uploaded resumes
│   ├── server.js             # Entry point
│   └── .env                  # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth state management
│   │   ├── pages/            # Page components
│   │   ├── services/api.js   # Axios API client
│   │   ├── App.jsx           # Router & layout
│   │   └── index.css         # Tailwind + custom styles
│   └── index.html
│
└── README.md
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| POST | /api/resume/upload | Upload & analyze resume |
| GET | /api/resume/analysis | Get resume analysis |
| POST | /api/test/generate | Generate mock test |
| POST | /api/test/submit | Submit test answers |
| GET | /api/test/results | Get all test results |
| GET | /api/test/result/:id | Get specific result |
| POST | /api/coding-test/generate | Generate coding challenge |
| POST | /api/coding-test/submit | Submit and evaluate code |
| GET | /api/coding-test/history | Get past coding test results |
| POST | /api/study-plan/generate | Generate study plan |
| GET | /api/study-plan | Get study plan |
| POST | /api/interview/questions | Get interview questions |
| POST | /api/interview/evaluate | Evaluate answer |
| POST | /api/chat | AI chatbot |
| GET | /api/dashboard | Dashboard data |

## 🎨 User Flow

1. **Register/Login** → Create account or sign in
2. **Upload Resume** → Get AI analysis with score and feedback
3. **Take Mock Test** → Resume-based or company-specific questions
4. **Practice Coding** → Solve AI-generated programming challenges
5. **View Results** → Score, weak areas, question review
6. **Get Study Plan** → Personalized 4-week roadmap
7. **Practice Interview** → AI-powered mock interview
8. **Check Dashboard** → Track progress with charts

## 📝 License

MIT
