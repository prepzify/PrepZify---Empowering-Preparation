<div align="center">

<img width="1200" height="475" alt="Prepzify Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# 🚀 Prepzify — Empowering Preparation

*An AI-powered placement preparation platform that transforms the way students get job-ready.*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Prepzify-4F46E5?style=for-the-badge)](https://prepzify-pf85.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/gyanshankar1708/Prepzify-Empowering-Prepration)
[![JavaScript](https://img.shields.io/badge/JavaScript-95.8%25-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/gyanshankar1708/Prepzify-Empowering-Prepration)
[![License](https://img.shields.io/badge/License-Educational-blue?style=for-the-badge)](#license)

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Timeline](#-project-timeline)
- [Team](#-team)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About the Project

*Prepzify* is a full-stack, AI-driven placement preparation platform built to bridge the gap between students and their dream jobs. It provides an end-to-end ecosystem — from resume evaluation and adaptive mock tests to interview simulation and personalized study planning — all powered by AI.

> 🔗 *Live Application:* [https://prepzify-pf85.onrender.com/](https://prepzify-pf85.onrender.com/)

Whether you're a fresher or a final-year student gearing up for campus placements, Prepzify gives you the tools to prepare smarter, not harder.

---

## 🧩 Problem Statement

Students preparing for placements face significant, often overlooked challenges:

- ❌ No structured resume feedback or scoring
- ❌ Lack of a personalized preparation strategy
- ❌ No realistic interview practice environment
- ❌ Unclear career guidance and company targeting
- ❌ Difficulty identifying skill gaps before interviews

These pain points lead to inefficient preparation cycles and lower placement success rates. Prepzify is built to solve all of this in one place.

---

## ✨ Key Features

### 📄 1. Resume Analyzer
- Upload your resume in PDF format
- AI-powered skill extraction and gap identification
- Detailed scoring with actionable feedback

### 📝 2. Adaptive Test Analysis System
- Topic-wise mock tests that adapt to your level
- Comprehensive performance evaluation report
- Automatic skill gap detection after each test

### 🧠 3. Resume-Based Test Generator
- Dynamically generates interview questions from your resume
- Ensures targeted, personalized test preparation

### 🗓️ 4. AI Study Planner
- Generates a personalized preparation roadmap
- Based on your test scores and target companies

### 🎙️ 5. Interview Simulator
- AI-based mock interview sessions
- Evaluates responses for clarity, accuracy, and confidence

### 🏢 6. Company Recommendation Engine
- Suggests best-fit companies based on your skills and performance
- Helps narrow down job search efficiently

### 🤖 7. Chatbot Assistant
- Answers preparation-related queries instantly
- Provides guidance on topics, resources, and strategy

### 📊 8. Analytics Dashboard
- Visual performance analytics over time
- Track progress across all modules at a glance

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| *Frontend* | React.js, Vite, CSS |
| *Backend* | Node.js, Express.js |
| *Database* | MongoDB / Firebase |
| *AI / NLP* | Google Gemini API, NLP Models |
| *Data Visualization* | Chart.js |
| *Deployment* | Render (Backend + Frontend) |

---

## 🏗️ System Architecture


┌──────────────────────────────────────────────┐
│              Application Layer               │
│         React.js Frontend (Vite)             │
└─────────────────┬────────────────────────────┘
                  │ REST API
┌─────────────────▼────────────────────────────┐
│               Logic Layer                    │
│         Node.js + Express Backend            │
└──────┬──────────────────────────┬────────────┘
       │                          │
┌──────▼──────┐           ┌───────▼───────────┐
│  Data Layer │           │     AI Layer      │
│  MongoDB /  │           │  Resume Analyzer  │
│  Firebase   │           │  Test Engine      │
└─────────────┘           │  Study Planner    │
                          │  Interview Bot    │
                          │  Chatbot          │
                          └───────────────────┘
                                  │
                          ┌───────▼───────────┐
                          │   Output Layer    │
                          │  Analytics Dash   │
                          └───────────────────┘


---

## 📁 Project Structure


Prepzify-Empowering-Prepration/
├── backend/
│   ├── server.js           # Express app entry point
│   ├── routes/             # API route handlers
│   ├── models/             # MongoDB data models
│   ├── services/           # AI & business logic services
│   ├── uploads/            # Uploaded resume files (git-ignored)
│   └── .env                # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx        # React app entry point
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages/routes
│   │   └── assets/         # Static assets
│   └── vite.config.js      # Vite configuration
│
└── README.md


---

## 🚦 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)
- A MongoDB connection URI (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Google Gemini API Key](https://aistudio.google.com/)

---

### 1. Clone the Repository

bash
git clone https://github.com/gyanshankar1708/Prepzify-Empowering-Prepration.git
cd Prepzify-Empowering-Prepration


---

### 2. Setup & Run the Backend

bash
cd backend
npm install
npm run dev


The backend server will start at http://localhost:5000.

---

### 3. Setup & Run the Frontend

Open a *new terminal* in the project root:

bash
cd frontend
npm install
npm run dev


The frontend will start at http://localhost:5173.

---

## 🔐 Environment Variables

Create a .env file inside the backend/ directory and add the following:

env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# AI Integration
GEMINI_API_KEY=your_google_gemini_api_key

# Server
PORT=5000


> ⚠️ *Important:* Never commit your .env file. It is already included in .gitignore.

---

## 📅 Project Timeline

This project was built in a *2-week sprint*:

| Day | Task |
|-----|------|
| Day 1 | Planning + Architecture Design |
| Day 2 | UI Design + Database Schema |
| Day 3 | Frontend Setup (React + Vite) |
| Day 4 | Backend APIs Setup (Express + MongoDB) |
| Day 5 | Resume AI + Chatbot + Company Recommender |
| Day 6 | Adaptive Test Engine + Resume-Based Test |
| Day 7 | Study Planner + Interview Simulator |
| Day 8 | Frontend ↔️ Backend ↔️ AI Integration |
| Day 9 | Dashboard & Analytics Development |
| Day 10 | Database Integration + Deployment Setup |
| Day 11 | Deployment to Render + Initial Testing |
| Day 12 | Bug Fixing & Performance Tuning |
| Day 13 | Documentation + Demo Preparation |
| Day 14 | Final Demo & Submission |

---

## 👥 Team

| Role | Members |
|------|---------|
| *Pod Leader* | Abhinav Raj |
| *AI Engineers* | Aditya Kumar, Anurag Gupta, Himanshu Kumar, Aryan Singh |
| *Data Engineer* | Gaurav Kumar Jha |
| *Backend Developers* | Haris Jamil, Gyanshankar Singh |
| *Frontend Developer* | Md Akib |
| *DevOps* | Gyanshankar Singh |
| *Testing & Demo* | Anurag Gupta, Abhinav Raj |
| *Documentation* | Jakaria Eunus Hussain |

---

## 🔮 Future Scope

- 🤖 Integration of more advanced AI/LLM models for deeper analysis
- 🎥 Real-time video interview evaluation with facial analysis
- 📱 Native mobile application (Android & iOS)
- 🌍 Large-scale deployment with multi-tenant support
- 🔗 Integration with LinkedIn and job portals
- 🏆 Leaderboards and peer comparison features

---

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how you can help:

1. *Fork* the repository
2. *Create* a feature branch: git checkout -b feature/your-feature-name
3. *Commit* your changes: git commit -m 'Add: your feature description'
4. *Push* to the branch: git push origin feature/your-feature-name
5. *Open* a Pull Request

For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project was built for *educational and hackathon purposes*. Feel free to explore, learn from, and build upon it.

---

<div align="center">

*Built with ❤️ by the Prepzify Team*

⭐ If you found this project helpful, please consider giving it a star on [GitHub](https://github.com/gyanshankar1708/Prepzify-Empowering-Prepration)!

</div>