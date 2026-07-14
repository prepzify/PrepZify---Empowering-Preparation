# PrepZify - Technical Interview Questions & Answers

This document contains interview questions specifically tailored to the **PrepZify** project, its architecture, and its technology stack.

## Architecture & System Design

### 1. Can you explain the overall architecture of PrepZify?
**Answer:** PrepZify is built as a monorepo with a decoupled frontend and backend. 
- **Frontend:** Built with React 19, TypeScript, and Vite, it handles the UI, client-side ML (TensorFlow.js/MediaPipe), and state management. 
- **Backend:** A Node.js/Express server that acts as a secure API gateway for Razorpay payments, Nodemailer support tickets, and specific routing.
- **AI Core:** Integrated deeply with the `@google/genai` API (Gemini 2.0 Flash) for mock interviews and code evaluation.
- **Database:** Firebase Authentication and Cloud Firestore manage session data, user profiles, and gamification streaks.

### 2. Why did you choose Vite over Create React App or Next.js?
**Answer:** Vite was chosen for its blazing-fast Hot Module Replacement (HMR) and optimized build times, leveraging native ES modules. Since a significant portion of PrepZify (like MediaPipe proctoring and PDF parsing) is highly client-heavy and doesn't explicitly require Server-Side Rendering (SSR) for SEO, a highly optimized Client-Side Rendered (CSR) app with Vite provided the best developer experience and performance.

## AI & Machine Learning Integrations

### 3. How does Olivia, the AI Mock Interviewer, function under the hood?
**Answer:** Olivia bridges the user's parsed resume data with the Gemini 2.0 Flash model. The system dynamically constructs a prompt containing the candidate's skills, target role, and experience. It uses the real-time Web Speech API for Speech-to-Text (STT) to capture the user's answer, sends it to Gemini for evaluation and follow-up generation, and uses Text-to-Speech (TTS) to vocalize the AI's response in a human-like pitch.

### 4. How does the real-time proctoring system work, and why run it client-side?
**Answer:** The proctoring system uses **TensorFlow.js** and **MediaPipe FaceMesh** to track facial landmarks and pupil movement directly in the browser. 
Running this client-side (Edge AI) is crucial because:
1. **Zero Latency:** It prevents the lag associated with sending video feeds to a server.
2. **Privacy:** The user's video feed never leaves their device, ensuring high security and privacy.
3. **Cost Efficiency:** It offloads the heavy computational cost of computer vision from our servers to the user's device.

## Frontend & Editor Integration

### 5. How did you integrate the coding practice arena into the application?
**Answer:** The practice arena utilizes `@monaco-editor/react`, which brings a rich VS Code-like editing experience to the browser. For code execution, while JS can be evaluated safely in the browser (or via sandboxed Web Workers), non-JS languages (Python, C++, Java) are simulated using the Gemini AI engine, which acts as a virtual compiler to verify syntax, run edge cases, and provide debugging notes.

### 6. How is the Resume Parsing and ATS grading implemented?
**Answer:** The platform uses `pdfjs-dist` to parse uploaded PDF resumes purely on the client side. The extracted text structure is then analyzed by our AI models to calculate an ATS compatibility score, find semantic skill gaps based on target roles, and even export a localized recruiter-ready `.docx` file using docx generators.

## Backend, Database & Gamification

### 7. Why use Firebase Firestore instead of a relational database like PostgreSQL?
**Answer:** Firestore was chosen for its real-time synchronization capabilities and seamless integration with Firebase Auth. Since PrepZify has features like dynamic streaks, progress tracking, and leaderboards that update frequently from the client side, a NoSQL document database like Firestore provides the flexibility and real-time listeners required without having to manage complex WebSockets manually.

### 8. Explain the algorithm behind the dynamic streak tracking system.
**Answer:** The streak engine uses a timezone-safe date-comparison algorithm. It zeroes out the hours and minutes to compare exact calendar dates. 
- If the last active date was **yesterday**, the streak increments by 1.
- If it was **before yesterday**, the streak resets to 1.
- If the user was already active **today**, it simply retains the current streak, preventing redundant database writes.

## Security & Payments

### 9. How do you ensure payment security with Razorpay?
**Answer:** The payment flow follows a secure 3-step process:
1. The client requests the backend to create an order via `/api/payments/create-order`.
2. The Razorpay SDK handles the checkout on the frontend.
3. Once paid, the client sends the `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to the backend's `/api/payments/verify` endpoint. 
The backend securely computes a SHA256 HMAC using the private secret key and verifies the signature to prevent payment spoofing.
