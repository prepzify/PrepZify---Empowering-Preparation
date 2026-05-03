import { GoogleGenerativeAI } from "@google/generative-ai";

let ai: GoogleGenerativeAI | null = null;

export const getAiClient = () => {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is missing");
    ai = new GoogleGenerativeAI(key);
  }
  return ai;
};
