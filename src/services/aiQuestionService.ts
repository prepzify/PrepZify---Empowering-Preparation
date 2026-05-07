import { generateContent, models } from "./geminiService";
import { Question } from "../types";

export async function generateAIQuestions(
  deptName: string,
  topic: string,
  category: 'coding' | 'aptitude' | 'technical',
  branch: string
): Promise<Question[]> {
  let prompt = '';

  if (category === 'coding') {
    prompt = `Generate exactly 10 coding problems for ${deptName} students on "${topic}". Mix easy (4), medium (4), hard (2).
Return ONLY a valid JSON array, no markdown code blocks:
[{"title":"...","content":"Full problem description","difficulty":"easy|medium|hard","examples":[{"input":"...","output":"..."}],"constraints":["..."],"starterCode":"// starter code"}]`;
  } else if (category === 'aptitude') {
    prompt = `Generate exactly 10 aptitude MCQ questions for ${deptName} students on "${topic}". Mix easy (4), medium (4), hard (2).
Return ONLY a valid JSON array, no markdown code blocks:
[{"title":"...","content":"Full question","difficulty":"easy|medium|hard","options":["A","B","C","D"],"correctIndex":0,"explanation":"Explanation of the solution"}]`;
  } else {
    prompt = `Generate exactly 10 technical MCQ questions for ${deptName} students on "${topic}". Mix easy (4), medium (4), hard (2).
Return ONLY a valid JSON array, no markdown code blocks:
[{"title":"...","content":"Full technical question","difficulty":"easy|medium|hard","options":["A","B","C","D"],"correctIndex":0,"explanation":"Detailed explanation"}]`;
  }

  try {
    const text = await generateContent({
      model: models.lite, // Use lite model for better quota management on simple tasks
      prompt: prompt,
      responseMimeType: "application/json"
    });
    
    // Improved JSON extraction: find the first '[' and last ']'
    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Could not find a valid JSON array in the response");
    }

    const cleanJson = text.substring(startIndex, endIndex + 1);
    const questions = JSON.parse(cleanJson);

    return questions.map((q: any, index: number) => ({
      ...q,
      id: `ai-${branch}-${topic}-${category}-${index}-${Date.now()}`,
      solved: false,
      branch: branch,
      topic: topic,
      category: category
    }));
  } catch (error: any) {
    console.error("Failed to generate questions:", error);
    // Throw a friendlier error message if it's still a quota issue after retries
    if (error?.status === 429 || error?.message?.includes('quota')) {
      throw new Error("AI Generation is temporarily limited due to high demand. Please try again in 1 minute.");
    }
    return [];
  }
}
