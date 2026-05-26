import { generateContent, models } from './geminiService';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  source: string;
  description: string;
  applyLink: string;
  matchScore: number;
  reasoning: string;
  missingSkills: string[];
}

export async function findJobs(skills: string[], role: string = "Software Engineer"): Promise<Job[]> {
  try {
    // In a real production app, you would use JSearch API or similar here.
    // For this implementation, we use Gemini to 'simulate' a search result 
    // by providing highly relevant current job patterns and realistic mock data
    // tailored to the user's skills.
    
    const response = await generateContent({
      model: models.flash,
      prompt: `Find 5 highly relevant current job openings for a candidate with these skills: ${skills.join(', ')} 
      targeting the role: "${role}".
      
      Return a JSON array of objects with these keys: 
      - id (string)
      - title (string)
      - company (string)
      - location (string)
      - salary (string, e.g. "₹12L - ₹20L")
      - source (string, e.g. "LinkedIn", "Naukri")
      - description (string, short)
      - applyLink (string, a realistic search URL for that company/role)
      - matchScore (number, 0-100)
      - reasoning (string, why this fits)
      - missingSkills (array of strings, what they still need for THIS specific job)
      
      BE REALISTIC. Use real company names like Google, TCS, Infosys, Zomato, Swiggy, Cred, etc.`,
      responseMimeType: "application/json"
    });

    return JSON.parse(response);
  } catch (error) {
    console.error("Job Search Error:", error);
    return [];
  }
}
