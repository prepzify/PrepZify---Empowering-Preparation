import { generateContent, models } from './geminiService';

export interface StudyPath {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: {
    title: string;
    description: string;
    resources: { title: string; url: string; type: 'video' | 'article' | 'documentation' | 'book' }[];
    estimatedHours: number;
    skillsGained: string[];
  }[];
  finalProject: {
    title: string;
    description: string;
    deliverables: string[];
  };
}

export async function generateStudyPath(skill: string, level: string = 'Intermediate'): Promise<StudyPath> {
  const prompt = `Generate a comprehensive, high-quality technical study path for the skill: "${skill}" at "${level}" level.
  
  Return a JSON object:
  - id: unique string
  - title: clear title
  - description: overview
  - estimatedTime: e.g. "4 Weeks"
  - difficulty: Beginner | Intermediate | Advanced
  - modules: array of objects { 
      title, 
      description, 
      estimatedHours, 
      skillsGained (array), 
      resources (array of {title, url, type: video|article|documentation|book}) 
    }
    (Include REAL resource links from YouTube, MDN, official docs, etc.)
  - finalProject: { title, description, deliverables (array) }
  
  BE SPECIFIC. For resources, prefer official documentation and high-quality free tutorials.`;

  try {
    const response = await generateContent({
      model: models.flash,
      prompt,
      responseMimeType: "application/json"
    });
    return JSON.parse(response);
  } catch (error) {
    console.error("Study Path Generation Error:", error);
    throw error;
  }
}
