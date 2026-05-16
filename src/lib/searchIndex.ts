export interface SearchItem {
  id: string;
  title: string;
  description: string;
  path: string;
  category: string;
  keywords: string[];
}

export const searchIndex: SearchItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Overview of your placement preparation progress',
    path: '/',
    category: 'Navigation',
    keywords: ['home', 'dashboard', 'progress', 'overview']
  },
  {
    id: 'interview-ai',
    title: 'Interview AI',
    description: 'AI-powered mock interviews and feedback',
    path: '/interview',
    category: 'Practice',
    keywords: ['interview', 'mock', 'ai', 'voice', 'feedback']
  },
  {
    id: 'practice-questions',
    title: 'Coding Practice',
    description: 'Topic-wise coding, aptitude and technical questions',
    path: '/code',
    category: 'Practice',
    keywords: ['coding', 'questions', 'problems', 'aptitude', 'technical']
  },
  {
    id: 'study-paths',
    title: 'Study Paths',
    description: 'Curated learning paths for various job roles',
    path: '/paths',
    category: 'Learning',
    keywords: ['paths', 'roadmap', 'learning', 'curriculum']
  },
  {
    id: 'resume-check',
    title: 'Resume Checker',
    description: 'AI-assisted resume analysis and score',
    path: '/resume',
    category: 'Tools',
    keywords: ['resume', 'cv', 'analysis', 'ats']
  },
  {
    id: 'leaderboards',
    title: 'Leaderboards',
    description: 'Compete with others and track rankings',
    path: '/leaderboards',
    category: 'Social',
    keywords: ['rank', 'leaderboard', 'compete', 'scores']
  },
  {
    id: 'quick-prep',
    title: 'Quick Prep',
    description: '15-minute quick assessment of your readiness',
    path: '/quick-prep',
    category: 'Practice',
    keywords: ['test', 'assessment', 'fast', 'quick']
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Manage your profile and preferences',
    path: '/settings',
    category: 'Account',
    keywords: ['profile', 'account', 'preferences', 'security']
  },
  {
    id: 'support',
    title: 'Documentation & Support',
    description: 'Get help and read guides about the platform',
    path: '/support',
    category: 'Help',
    keywords: ['help', 'docs', 'support', 'faq']
  },
  // Departments / Branches
  {
    id: 'cse-branch',
    title: 'Computer Science (CSE)',
    description: 'Coding practice and interview prep for Computer Science',
    path: '/code?branch=CSE',
    category: 'Department',
    keywords: ['cse', 'computer science', 'it', 'software']
  },
  {
    id: 'ece-branch',
    title: 'Electronics & Comm (ECE)',
    description: 'Focus on VLSI, Embedded systems and signal processing',
    path: '/code?branch=ECE',
    category: 'Department',
    keywords: ['ece', 'electronics', 'hardware', 'vlsi']
  },
  {
    id: 'mechanical-branch',
    title: 'Mechanical Engineering',
    description: 'Practice questions for thermodynamics and machine design',
    path: '/code?branch=MECHANICAL',
    category: 'Department',
    keywords: ['mechanical', 'thermo', 'design', 'engine']
  }
];
