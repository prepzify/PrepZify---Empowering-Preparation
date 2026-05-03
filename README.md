# 🚀 Prepzify

**Prepzify** is an AI-powered placement preparation platform that helps students improve their job readiness through resume analysis, test evaluation, interview simulation, and personalized study planning.

---

## 📌 Problem Statement

Students preparing for placements face major challenges:
- No proper resume evaluation
- Lack of personalized preparation strategy
- No real interview practice
- No clear career guidance

This leads to inefficient preparation and lower success rates.

---

## 🎯 Solution

Prepzify provides a complete AI-driven ecosystem that:
- Analyzes resumes
- Conducts adaptive tests
- Generates study plans
- Simulates interviews
- Recommends companies
- Tracks progress through dashboards

---

## ⚙️ Features

### 1. Resume Analyzer
- Upload resume
- Skill extraction
- Resume scoring & feedback

### 2. Test Analysis System
- Adaptive mock tests
- Performance evaluation
- Skill gap detection

### 3. Resume-Based Test
- Generates questions based on resume skills

### 4. Study Planner
- Personalized roadmap based on test performance

### 5. Interview Simulation
- AI-based mock interview
- Response evaluation

### 6. Company Recommendation
- Suggests companies based on skills and performance

### 7. Chatbot Assistant
- Answers queries
- Provides preparation guidance

### 8. Dashboard
- Visual performance analytics
- Progress tracking

---

## 🏗️ Tech Stack

**Frontend**
- React.js

**Backend**
- Node.js + Express

**Database**
- MongoDB / Firebase

**AI Integration**
- NLP APIs / AI Models

**Visualization**
- Chart.js

**Deployment**
- Webyae / Vercel

---

## 🚦 Getting Started

Quick steps to run the project locally.

Prerequisites:
- Node.js (v18+ recommended)
- npm (or yarn/pnpm)
- MongoDB (local or cloud URI)

Backend (API)

1. Open a terminal and navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The backend runs from [backend/server.js](backend/server.js#L1).

Frontend (Client)

1. Open a second terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The frontend uses Vite and the entry is [frontend/src/main.jsx](frontend/src/main.jsx#L1).

Environment variables (backend)

Create a `.env` file in the `backend` folder with the following (example):

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_generative_ai_key
PORT=5000
```

Notes:
- Uploaded files are served from the `backend/uploads` directory and should be ignored by git (see [backend/.gitignore](backend/.gitignore#L1)).
- Keep any API keys and secrets out of version control.

---

## 📁 Project Structure (quick)

- [backend](backend): Express API, routes, models, services (AI integrations)
- [frontend](frontend): React + Vite client app

---

## 🤝 Contributing

Feel free to open issues or submit pull requests. For major changes, open an issue first to discuss what you would like to change.

---

## 📊 System Architecture

1. Data Layer → Database  
2. AI Layer → Resume + Test + Planner + Chatbot  
3. Logic Layer → Backend APIs  
4. Application Layer → Frontend  
5. Output Layer → Dashboard  

---

## 📅 Project Timeline (2 Weeks)

| Day | Task |
|-----|------|
| Day 1 | Planning + Architecture |
| Day 2 | UI Design + Database Design |
| Day 3 | Frontend Setup |
| Day 4 | Backend APIs Setup |
| Day 5 | Resume AI + Chatbot + Recommendations |
| Day 6 | Test AI + Resume-Based Test |
| Day 7 | Study Planner + Interview Simulation |
| Day 8 | Integration (Frontend + Backend + AI) |
| Day 9 | Dashboard Development |
| Day 10 | Database Integration + Deployment Setup |
| Day 11 | Deployment + Initial Testing |
| Day 12 | Bug Fixing |
| Day 13 | Documentation + Demo Preparation |
| Day 14 | Final Demo |

---

## 🎯 Deliverables

- Working web application  
- Resume analysis system  
- Test evaluation module  
- Study planner  
- Interview simulator  
- Company recommendation system  
- Chatbot  
- Dashboard  
- Deployed link  

---

## ⚠️ Constraints

- Limited development time (2 weeks)
- API limitations
- Data availability
- Team coordination

---

## 📈 Success Criteria

- All modules work without crash  
- AI outputs are meaningful  
- Dashboard shows clear insights  
- Demo runs smoothly  

---

## 🚧 Risks

- Feature overload  
- Backend bottleneck  
- Integration delays  
- Deployment failure  

---

## 👥 Team

- Pod Leader → Abhinav Raj  
- AI Engineers → Aditya Kumar, Anurag Gupta, Himanshu Kumar, Aryan Singh  
- Data Engineer → Gaurav Kumar Jha  
- Backend → Haris Jamil, Gyanshankar Singh  
- Frontend → Md Akib  
- DevOps → Gyanshankar Singh  
- Testing & Demo → Anurag Gupta, Abhinav Raj  
- Documentation → Jakaria Eunus Hussain  

---

## 🚀 Future Scope

- Advanced AI models  
- Real-time interview evaluation  
- Mobile application  
- Large-scale deployment  

---

## 📌 License

This project is for educational and hackathon purposes.

---