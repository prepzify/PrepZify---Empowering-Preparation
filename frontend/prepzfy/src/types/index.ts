export interface User {
  id: number;
  name: string;
  email: string;
  points: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  userId: number;
  name: string;
  points: number;
  rank: number;
}

export interface StudyPathItem {
  topic: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  resources: { title: string; url: string; type: 'Course' | 'Problem' }[];
}

export interface StudyPlan {
  summary: string;
  items: StudyPathItem[];
  estimatedTimeToReady: string;
}

export interface Topic {
  id: number;
  name: string;
  description: string;
}
// ... existing types ...

export interface Question {
  id: string;
  topicId: string;
  type: 'MCQ' | 'Coding';
  content: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  options?: string[]; // For MCQ
  correctAnswer?: string; // For MCQ
  codeTemplate?: string; // Legacy
  defaultCode?: Record<string, string>; // For Coding: { javascript, java, python, cpp }
  testCases?: { input: string; output: string }[]; // For Coding
  hiddenTestCases?: { input: string; output: string }[]; // For Coding
}

export interface InterviewFeedback {
  technicalAccuracy: number;
  clarity: number;
  conciseness: number;
  communicationSkills: {
    pace: number;
    jargonUsage: number;
    fillerWordCount: number;
    effectiveness: number;
  };
  pros: string[];
  cons: string[];
  actionableTips: string[];
  overallScore: number;
  summary: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  timestamp: string;
  transcript: { role: 'user' | 'model'; chunk: string; timestamp: number }[];
  feedback?: InterviewFeedback;
}

export interface Submission {
  id: string;
  questionId: string;
  status: 'Passed' | 'Failed' | 'Pending';
  score: number;
  feedback: string;
  userAnswer?: string;
  timestamp: string;
}
