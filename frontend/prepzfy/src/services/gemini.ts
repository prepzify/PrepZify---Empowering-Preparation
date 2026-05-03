import { GoogleGenAI } from "@google/genai";

// Initialize Gemini on the client
// In AI Studio Build, process.env.GEMINI_API_KEY is automatically available in the browser context
const getAi = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("Gemini API key is not available. Please ensure it is set in the AI Studio Settings.");
  }
  return new GoogleGenAI({ apiKey: key });
};

const ai = getAi();
const MODEL_NAME = "gemini-3-flash-preview";

function extractJson(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const firstOpen = text.indexOf('[');
    const firstOpenObj = text.indexOf('{');
    const start = (firstOpen !== -1 && (firstOpenObj === -1 || firstOpen < firstOpenObj)) ? firstOpen : firstOpenObj;

    if (start === -1) throw new Error("No JSON found");

    const lastClose = text.lastIndexOf(']');
    const lastCloseObj = text.lastIndexOf('}');
    let end = Math.max(lastClose, lastCloseObj);

    if (end === -1 || end < start) throw new Error("No JSON found");

    while (end > start) {
      const candidate = text.substring(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch (inner) {
        const nextEndAr = text.lastIndexOf(']', end - 1);
        const nextEndOb = text.lastIndexOf('}', end - 1);
        end = Math.max(nextEndAr, nextEndOb);
        if (end <= start) break;
      }
    }
    throw e;
  }
}

export const getInterviewFeedback = async (transcript: string) => {
  try {
    const prompt = `Analyze this interview transcript and provide a detailed performance report in JSON format.
    Structure: { "score": number, "strengths": string[], "weaknesses": string[], "overallFeedback": string }
    Transcript: ${transcript}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    return extractJson(response.text || "");
  } catch (error) {
    console.error("Gemini Feedback Error:", error);
    return null;
  }
};

export const generateAssessmentQuestions = async (
  topic: string,
  difficulty: string,
  type: string,
  count: number = 3,
  avoidQuestions: string[] = []
) => {
  try {
    const prompt = `You are an expert technical interviewer. Generate a JSON array of ${count} ${difficulty} ${type} questions for the topic: ${topic}.
    ${avoidQuestions?.length > 0 ? `DO NOT repeat these questions: ${avoidQuestions.join(", ")}` : ""}
    
    REQUIRED JSON STRUCTURE:
    For MCQ: { "content": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "...", "type": "MCQ" }
    For Coding: { "content": "...", "difficulty": "${difficulty}", "testCases": [{"input": "...", "output": "..."}], "codeTemplates": { "javascript": "...", "python": "...", "java": "...", "cpp": "..." }, "type": "Coding" }
    
    Return ONLY the JSON array.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", temperature: 0.8 }
    });

    return extractJson(response.text || "[]");
  } catch (error) {
    console.error("AI Generation Error:", error);
    return [];
  }
};

export const getCourseRecommendations = async (skills: string[]) => {
  return [
    { title: "Advanced Data Structures", provider: "PrepZfy", reason: "Focus on Trees and Graphs" },
    { title: "Algorithm Masterclass", provider: "PrepZfy", reason: "Master DP through visualization" },
    { title: "Interview Ready", provider: "YouTube", reason: "Real mock interview experiences" }
  ];
};

export const generateStudyPath = async (userData: any) => {
  try {
    const prompt = `Generate a personalized study path for: ${JSON.stringify(userData)}.
    Structure: { "summary": "...", "items": [{ "topic": "...", "priority": "...", "reason": "...", "resources": [] }], "estimatedTimeToReady": "..." }
    Return JSON only.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    return extractJson(response.text || "");
  } catch (error) {
    console.error("Study Path Error:", error);
    return null;
  }
};

export const executeCode = async (code: string, language: string, testCases?: string) => {
  try {
    const prompt = `Evaluate this ${language} code against these test cases: ${testCases}.
    Code:\n${code}\n
    Respond with a JSON object: { "verdict": "PASSED" | "FAILED", "reason": "...", "output": "..." }`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json" }
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Execution Error:", error);
    return `Error: ${error.message}. Please check your connection.`;
  }
};

export const analyzeResume = async (resumeText: string) => {
  try {
    const prompt = `Analyze this resume and provide feedback in JSON. 
    Structure: { "score": number, "feedback": { "formatting": "...", "keywords": "...", "content": "..." }, "weakAreas": [], "suggestedPractice": [] }
    Resume: ${resumeText}`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });

    return extractJson(response.text || "");
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    return null;
  }
};

export const getGeminiChatResponse = async (messages: any[], userMessage: string) => {
  try {
    const history = (messages || []).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || m.text || "" }]
    }));

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [...history, { role: "user", parts: [{ text: userMessage }] }],
      config: {
        systemInstruction: "You are PrepZfy AI, a Senior Technical Interviewer. Conduct a professional DSA interview. Ask one concise question at a time. Provide hints if the user struggles."
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error: I'm having trouble connecting to Gemini. Please try again later.";
  }
};
