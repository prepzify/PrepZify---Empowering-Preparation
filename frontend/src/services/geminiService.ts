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

export async function generateInterviewQuestion(
  history: { role: string; content: string }[], 
  role: string,
  candidateName: string = '',
  techStack: string = '',
  targetCompany: string = '',
  resumeText: string = ''
) {
  let systemInstruction = `You are Olivia, a friendly, professional female technical recruiter and senior engineering interviewer for top tech companies. Your goal is to conduct a high-stakes, realistic but supportive mock interview for engineering student placements. Keep your responses extremely brief, human-sounding, and conversational to reduce latency.

OPERATIONAL GUIDELINES:
1. BE CONVERSATIONAL: Speak exactly like a real human girl would speak in a video call. Use conversational fillers occasionally ("Hmm," "Right," "Wow"). Avoid bullet points, long lists, or complex markdown. 
2. EXTREMELY BRIEF: Keep your responses to 1-3 sentences maximum. The user is waiting on a live call with you.
3. ONE QUESTION AT A TIME: Never ask multiple questions at once. Wait for the user's response.
4. HANDS-FREE FLOW: End every response with a natural handoff back to the student. Examples: "Tell me about your approach?", "What's your take on that?"
5. ACTIVE LISTENING: Start your response by briefly acknowledging the student's previous answer.
6. STEADY PROGRESSION: Follow these stages:
   - Stage 1: Introduction. Ask for their name and branch if not known.
   - Stage 2: Technical/Role-specific. Deep dive.
   - Stage 3: HR & Behavioral.`;

  if (candidateName) {
    systemInstruction += `\n\nCandidate Name: ${candidateName}. Address the candidate by their name naturally during the conversation.`;
  }
  if (targetCompany) {
    systemInstruction += `\n\nTarget Company: ${targetCompany}. Tailor the mock assessment specifically to ${targetCompany}'s technical standards, engineering culture, and values (e.g. Leadership Principles if Amazon, Googliness if Google). Ask questions typically asked at ${targetCompany} for a ${role} role.`;
  } else {
    systemInstruction += `\n\nTarget Position: ${role}. Conduct a high-quality industry-standard software engineering technical interview.`;
  }
  if (techStack) {
    systemInstruction += `\n\nCandidate's Tech Stack & Skills: ${techStack}. Probe their knowledge of these technical topics, languages, and frameworks. Ask architectural scenarios and conceptual questions tailored specifically to this tech stack.`;
  }
  if (resumeText) {
    systemInstruction += `\n\nCandidate's Resume Text:\n${resumeText}\n\nDuring technical and HR/behavioral stages, reference specific projects, work experience, or achievements listed in their resume to make the interview highly interrelated.`;
  }

  systemInstruction += `\n\nReturn your response in structured JSON format with the following keys:
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
- candidateName (string): candidate's full name extracted from the resume (empty string if not found).
- techStack (array of strings): candidate's primary tech stack and key skills extracted from the resume (empty array if not found).
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

export async function generateTailoredResume(
  originalResume: string,
  company: string,
  role: string,
  jobDescription: string = ''
) {
  return generateContent({
    prompt: `You are an elite resume strategist and career coach. Your task is to take the following original resume and completely rewrite and tailor it for a specific company and role.

ORIGINAL RESUME:
${originalResume}

TARGET COMPANY: ${company}
TARGET ROLE: ${role}
JOB DESCRIPTION: ${jobDescription || 'Not provided — use your knowledge of typical requirements for this role at ' + company}

INSTRUCTIONS:
1. Rewrite the professional summary to directly address ${company}'s culture, mission, and values.
2. Reorder and rewrite bullet points in experience to highlight skills most relevant to ${role} at ${company}.
3. Use strong action verbs and quantify achievements where possible (make reasonable inferences if numbers aren't present).
4. Add or emphasize skills that are specifically valued at ${company} (e.g., for Google: scalability, Kubernetes, Python; for fintech: security, compliance, Go).
5. Suggest projects that would impress ${company} specifically.
6. Keep the person's actual experience — do NOT fabricate companies or degrees they haven't worked at/attended.
7. Write an insight explaining WHY this resume is tailored for ${company}.

Return ONLY a valid JSON object with this exact structure:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "linkedin": "string",
  "github": "string",
  "location": "string",
  "summary": "string (3-4 impactful sentences tailored to ${company})",
  "skills": [
    { "category": "string", "items": ["string"] }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "location": "string",
      "bullets": ["string (strong action verb + quantified impact)"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string",
      "cgpa": "string (optional)"
    }
  ],
  "projects": [
    {
      "name": "string",
      "tech": "string",
      "description": "string",
      "bullets": ["string"],
      "link": "string (optional)"
    }
  ],
  "achievements": ["string"],
  "certifications": ["string"],
  "companyInsight": "string (2-3 sentences on why this resume is now ideal for ${company})"
}`,
    responseMimeType: 'application/json',
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

export async function generateCampusPlan(
  company: string,
  daysLeft: number,
  resumeText: string,
  role: string = 'Software Engineer'
) {
  return generateContent({
    prompt: `You are an elite campus placement strategist. Create a hyper-personalised, day-by-day study plan for a student preparing for ${company} campus recruitment in exactly ${daysLeft} days.

STUDENT RESUME / BACKGROUND:
${resumeText || 'No resume provided — assume a typical 3rd/4th year engineering student with basic DSA knowledge.'}

TARGET COMPANY: ${company}
TARGET ROLE: ${role}
DAYS AVAILABLE: ${daysLeft}

COMPANY RECRUITMENT PATTERNS (use this knowledge):
- TCS: NQT (Numerical, Verbal, Reasoning, Programming Logic, Coding). Focus: aptitude then coding.
- Infosys: InfyTQ / SP track. Focus: Coding (Python/Java), OOP, Puzzles.
- Wipro: NLTH (Aptitude, Written Comm, Coding). Focus: Aptitude, Communication, Basic DSA.
- Amazon: Online Assessment (2 coding + work sim). Focus: Medium-Hard DSA, Behavioral.
- Microsoft: Coding + System Design. Focus: DSA LeetCode Medium-Hard, System Design basics.
- Google: Multiple coding + System Design. Focus: Hard DSA, Graphs, DP, System Design.
- Goldman Sachs: Quant aptitude + Coding. Focus: Quantitative aptitude, DSA, Finance basics.
- Deloitte: Verbal + Aptitude + Coding + Case. Focus: Communication, Logical reasoning.
- Accenture: Cognitive + Coding. Focus: Aptitude, Basic coding.
- For unknown companies: balanced plan covering DSA, aptitude, communication, HR.

PLAN REQUIREMENTS:
1. Divide ${daysLeft} days into phases (Foundation → Core Practice → Mock Tests → Final Sprint).
2. Each day: clear focus, specific topics, practice targets, and a practical tip.
3. Identify skill gaps from resume and emphasise those days.
4. Include a "Day 0 checklist" (things to do today before the plan starts).
5. Final 2 days must be: revision + full mock test + HR prep.
6. Be realistic — students have college commitments too.

Return ONLY valid JSON matching this exact structure:
{
  "company": "string",
  "role": "string",
  "daysLeft": number,
  "companyPattern": "string",
  "keyFocusAreas": ["string"],
  "skillGapsDetected": ["string"],
  "phases": [
    { "name": "string", "duration": "string", "goal": "string", "color": "string (blue|green|orange|purple|red)" }
  ],
  "days": [
    {
      "day": number,
      "phase": "string",
      "title": "string",
      "focus": "string",
      "priority": "high | medium | low",
      "tasks": [
        { "type": "theory | practice | mock | revision | hr", "description": "string", "target": "string" }
      ],
      "tip": "string",
      "estimatedHours": number
    }
  ],
  "day0Checklist": ["string"],
  "finalWeekStrategy": "string",
  "motivationalNote": "string"
}`,
    responseMimeType: 'application/json',
    model: models.flash
  });
}
