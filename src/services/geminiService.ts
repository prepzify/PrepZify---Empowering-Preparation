// src/services/geminiService.ts

export const models = {
  flash: "gemini-3-flash-preview",
  pro: "gemini-3-flash-preview", 
  lite: "gemini-3.1-flash-lite"
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
      if (isRateLimit && i < maxRetries) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Gemini rate limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function generateContent(params: {
  model?: string;
  systemInstruction?: string;
  prompt: string;
  responseMimeType?: "text/plain" | "application/json";
}) {
  return withRetry(async () => {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to generate content');
    }

    const data = await response.json();
    return data.text;
  });
}

export async function generateInterviewQuestion(history: { role: string; content: string }[], role: string) {
  const systemInstruction = `You are Olivia, a friendly, professional female technical recruiter and senior engineering interviewer for top tech companies. Your goal is to conduct a high-stakes, realistic but supportive mock interview for engineering student placements. Keep your responses extremely brief, human-sounding, and conversational to reduce latency.

OPERATIONAL GUIDELINES:
1. BE CONVERSATIONAL: Speak exactly like a real human girl would speak in a video call. Use conversational fillers occasionally ("Hmm," "Right," "Wow"). Avoid bullet points, long lists, or complex markdown. 
2. EXTREMELY BRIEF: Keep your responses to 1-3 sentences maximum. The user is waiting on a live call with you.
3. ONE QUESTION AT A TIME: Never ask multiple questions at once. Wait for the user's response.
4. HANDS-FREE FLOW: End every response with a natural handoff back to the student. Examples: "Tell me about your approach?", "What's your take on that?"
5. ACTIVE LISTENING: Start your response by briefly acknowledging the student's previous answer.
6. STEADY PROGRESSION: Follow these stages:
   - Stage 1: Introduction. Ask for their name and branch if not known.
   - Stage 2: Technical/Role-specific. Deep dive.
   - Stage 3: HR & Behavioral.

Return your response in structured JSON format with the following keys:
- feedback: An object containing "strengths" (array of strings) and "improvements" (array of strings) based on the user's PREVIOUS answer. If this is the start, leave these arrays empty.
- nextQuestion: A string containing exactly what you want to say out loud to the candidate.`;

  return withRetry(async () => {
    const response = await fetch('/api/gemini/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history,
        role,
        systemInstruction
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to generate interview question');
    }

    const data = await response.json();
    return data.text;
  });
}

export async function analyzeCode(code: string, language: string) {
  return generateContent({
    prompt: `Analyze the following ${language} code for performance, readability, and potential bugs. 
Provide specific optimization tips and a brief complexity analysis (Time/Space).

Code:
${code}`,
    systemInstruction: "You are a senior staff engineer providing code reviews.",
    model: models.pro
  });
}

export async function analyzeResume(resumeText: string, jobTitle: string = 'General Software Engineer', jobDescription: string = '') {
  return generateContent({
    prompt: `Analyze the following resume in the context of the job title "${jobTitle}" and description: "${jobDescription}".

Provide an EXTREMELY detailed feedback in JSON format. 
Include: 
- score (0-100): overall ATS match score.
- placementProbability (0-100): estimated chance of selection.
- readinessScore (0-100): how ready they are for immediate deployment.
- keyStrengths (array of strings): areas where the candidate excels.
- skillGaps (array of objects with {skill: string, impact: "High" | "Medium" | "Low"}): missing critical technologies.
- resumeFormatting (object with {score: number, suggestions: string[]}): ATS readability check.
- grammarAndCommunication (object with {score: number, items: string[]}): quality of writing.
- industryRoadmap (array of objects with {timeframe: string, goal: string, tasks: string[]}): 3m, 6m, 1y plan.
- summary (string): executive summary.
- projectRecommendations (array of strings): specific projects to build to fill gaps.

Resume:
${resumeText}`,
    responseMimeType: "application/json",
    model: models.flash
  });
}

export async function generateQuestionHint(questionTitle: string, questionContent: string, category: string) {
  return generateContent({
    prompt: `The student is stuck on an assessment question. Provide a subtle, helpful hint that guides them towards the right answer without giving it away directly. 
    
    Question Title: ${questionTitle}
    Category: ${category}
    Question Content: ${questionContent}`,
    systemInstruction: "You are an expert engineering tutor. Your hints are short, insightful, and encourage critical thinking.",
    model: models.flash
  });
}

export async function extractTextFromImage(file: File) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Extract all text from this resume image exactly as it appears. Maintain the formatting if possible. Output only the text content.`,
        model: models.flash,
        image: {
          data: base64,
          mimeType: file.type
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to extract text');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini API Error (extractTextFromImage):", error);
    throw error;
  }
}
