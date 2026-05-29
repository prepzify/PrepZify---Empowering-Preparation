export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'General' | 'Resume' | 'Practice' | 'Interviews' | 'Features & Support';
}

export const FAQS: FAQItem[] = [
  {
    id: 1,
    question: "What is PrepZify?",
    answer: "PrepZify is an AI-powered placement readiness platform that helps students prepare smarter for placements through resume analysis, AI mock interviews, coding and aptitude practice, skill-gap detection, guided study paths, and progress tracking.",
    category: "General"
  },
  {
    id: 2,
    question: "What is the Resume Check feature?",
    answer: "Resume Check analyzes your resume for ATS compatibility, skills, formatting, projects, and missing sections, then provides personalized improvement suggestions and a placement readiness score.",
    category: "Resume"
  },
  {
    id: 3,
    question: "What is the Resume Builder feature?",
    answer: "Resume Builder helps students create editable, ATS-friendly resumes tailored to specific companies, roles, and placement requirements using AI-powered recommendations.",
    category: "Resume"
  },
  {
    id: 4,
    question: "What is the Practice Arena?",
    answer: "Practice Arena is PrepZify’s coding practice section where students can solve coding problems based on specific topics, difficulty levels, and company-wise preparation to strengthen their problem-solving skills for placements.",
    category: "Practice"
  },
  {
    id: 5,
    question: "What is the Expert Network feature?",
    answer: "Expert Network allows students to book live mock interviews and connect with industry professionals for personalized feedback, interview guidance, and role-specific preparation support.",
    category: "Features & Support"
  },
  {
    id: 6,
    question: "Does PrepZify provide AI mock interviews?",
    answer: "Yes. PrepZify offers AI-powered mock interviews with dynamic questions, communication analysis, and personalized feedback to help students improve confidence and interview performance.",
    category: "Interviews"
  },
  {
    id: 7,
    question: "Can PrepZify help beginners?",
    answer: "Absolutely. PrepZify is designed for beginners as well as final-year students by providing guided preparation paths and step-by-step recommendations.",
    category: "General"
  },
  {
    id: 8,
    question: "Can I generate resumes for different companies or roles?",
    answer: "Yes. PrepZify can generate editable AI-powered resumes customized according to company requirements, job descriptions, and target roles.",
    category: "Resume"
  },
  {
    id: 9,
    question: "What kind of interview questions does the AI ask?",
    answer: "The AI asks technical and resume-based interview questions tailored to your skills, projects, target role, and preparation level to simulate real placement interview experiences.",
    category: "Interviews"
  },
  {
    id: 10,
    question: "What insights does the PrepZify dashboard provide?",
    answer: "The PrepZify dashboard helps students monitor their placement readiness, track preparation streaks, view ATS performance, and analyze career progress in one place.",
    category: "Features & Support"
  },
  {
    id: 11,
    question: "Do I need coding experience to use PrepZify?",
    answer: "No. PrepZify supports students from beginner level onwards and provides guided learning paths for gradual improvement.",
    category: "Practice"
  },
  {
    id: 12,
    question: "What is the Campus Planner feature?",
    answer: "Campus Planner helps students prepare for upcoming placement drives by generating a personalized roadmap based on the selected company, role, timeline, and resume. Students can choose their target company and role, enter the number of days left before the drive, and upload their resume for skill-based personalization and preparation suggestions.",
    category: "Features & Support"
  },
  {
    id: 13,
    question: "Is my resume and personal data secure?",
    answer: "Yes. PrepZify securely stores user resumes, reports, and preparation data while prioritizing privacy and security.",
    category: "General"
  },
  {
    id: 14,
    question: "How can I get support if I face issues on PrepZify?",
    answer: "PrepZify provides multiple support options including documentation, Discord and Telegram communities, and a dedicated support ticket system for technical, interview, or account-related issues.",
    category: "Features & Support"
  },
  {
    id: 15,
    question: "Can I retake mock interviews multiple times?",
    answer: "Yes. The number of AI mock interviews depends on your PrepZify plan — from 1 interview per week in the Free Plan to 100 mock interviews in the Elite Plan.",
    category: "Interviews"
  },
  {
    id: 16,
    question: "Who should use PrepZify?",
    answer: "PrepZify is ideal for engineering students, placement aspirants, freshers, and anyone preparing for internships or campus recruitment.",
    category: "General"
  },
  {
    id: 17,
    question: "How can PrepZify help me get placement-ready?",
    answer: "PrepZify helps you improve your resume, practice coding and aptitude questions, attend AI mock interviews, identify weak areas, receive personalized preparation roadmaps, get recommended courses, and track your overall placement readiness — all in one platform.",
    category: "General"
  },
  {
    id: 18,
    question: "What are Study Paths in PrepZify?",
    answer: "Study Paths provide personalized learning roadmaps with curated courses, resources, and topic-wise preparation plans based on your resume analysis, target role, skill level, and placement goals.",
    category: "Practice"
  },
  {
    id: 19,
    question: "What is the Quick Prep feature?",
    answer: "Quick Prep provides MCQ-based coding and aptitude assessments to help students practice important placement questions in a fast and structured way.",
    category: "Practice"
  }
];
