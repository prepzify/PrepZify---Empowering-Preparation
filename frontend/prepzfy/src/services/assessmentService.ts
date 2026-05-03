import { Question } from "../types";
import { generateAssessmentQuestions } from "./gemini";

export async function generateQuestions(
  topic: string, 
  difficulty: 'Easy' | 'Medium' | 'Hard', 
  type: 'MCQ' | 'Coding',
  count: number = 3,
  avoidQuestions: string[] = []
): Promise<Question[]> {
  try {
    const rawQuestions = await generateAssessmentQuestions(topic, difficulty, type, count, avoidQuestions);
    
    return rawQuestions.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substring(2, 11)
    }));
  } catch (error) {
    console.error("Question Generation Error:", error);
    throw error;
  }
}
