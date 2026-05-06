const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });

/**
 * Helper: Safely parse JSON from AI response
 * Handles markdown code blocks and malformed JSON
 */
const parseAIResponse = (text) => {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('AI JSON parse error:', e.message);
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        console.error('Fallback JSON parse also failed:', e2.message);
        return null;
      }
    }
    return null;
  }
};

/**
 * 1. RESUME ANALYZER
 * Analyzes resume text and returns structured data with score and feedback
 */
const analyzeResume = async (resumeText) => {
  const prompt = `You are an expert resume analyst for tech placement preparation. Analyze the following resume text and provide a detailed assessment.

RESUME TEXT:
${resumeText}

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "extractedSkills": ["skill1", "skill2", "skill3"],
  "education": ["degree/institution detail 1", "degree/institution detail 2"],
  "experience": ["experience detail 1", "experience detail 2"],
  "score": 72,
  "feedback": {
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "improvements": ["improvement 1", "improvement 2", "improvement 3"],
    "summary": "Brief overall assessment of the resume in 2-3 sentences"
  }
}

Rules:
- extractedSkills: List ALL technical skills, programming languages, frameworks, tools mentioned
- education: List degrees, institutions, and relevant academic details
- experience: List work experience, internships, and projects
- score: Rate from 0-100 based on overall resume quality (skills diversity, experience depth, education, formatting clues from text)
- feedback.strengths: What makes this resume strong
- feedback.improvements: Specific actionable improvements
- feedback.summary: Overall 2-3 sentence assessment`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseAIResponse(text);

  if (!parsed) {
    throw new Error('Failed to parse resume analysis from AI');
  }

  return parsed;
};

/**
 * 2. RESUME-BASED QUESTION GENERATOR (AI MODEL 1)
 * Generates MCQs based on skills extracted from resume
 */
const generateResumeBasedQuestions = async (skills, difficulty = 'medium', count = 10) => {
  const prompt = `You are an expert technical interviewer. Generate ${count} multiple-choice questions based on these skills: ${skills.join(', ')}.

Difficulty level: ${difficulty}

Respond ONLY with valid JSON array (no markdown, no explanation):
[
  {
    "question": "What is the purpose of...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation why this is correct",
    "topic": "Topic/Skill being tested",
    "difficulty": "${difficulty}"
  }
]

Rules:
- Generate exactly ${count} questions
- Each question must have exactly 4 options
- correctAnswer must exactly match one of the options
- Cover different skills from the provided list
- Questions should be practical and relevant for placement interviews
- ${difficulty === 'easy' ? 'Focus on basics and fundamentals' : difficulty === 'hard' ? 'Focus on advanced concepts, edge cases, and tricky scenarios' : 'Mix of conceptual and applied questions'}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseAIResponse(text);

  if (!parsed || !Array.isArray(parsed)) {
    throw new Error('Failed to parse questions from AI');
  }

  return parsed;
};

/**
 * 3. COMPANY-BASED QUESTION GENERATOR (AI MODEL 2)
 * Generates company-specific questions based on STS score
 */
const generateCompanyQuestions = async (stsScore, companyName, count = 10) => {
  // Determine difficulty based on STS score
  let difficultyLevel;
  let difficultyDescription;
  if (stsScore < 40) {
    difficultyLevel = 'easy';
    difficultyDescription = 'basic fundamentals and core concepts';
  } else if (stsScore < 70) {
    difficultyLevel = 'medium';
    difficultyDescription = 'intermediate problem-solving and applied concepts';
  } else {
    difficultyLevel = 'hard';
    difficultyDescription = 'advanced company-level problems, system design concepts, and complex algorithms';
  }

  const prompt = `You are a placement preparation expert specializing in ${companyName} interviews.

The student's Skill-Test Score (STS) is ${stsScore}/100, so generate questions at "${difficultyLevel}" level focusing on ${difficultyDescription}.

Generate ${count} MCQ questions that ${companyName} might ask in their placement interviews.

Respond ONLY with valid JSON array (no markdown, no explanation):
[
  {
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this is the correct answer",
    "topic": "Topic area",
    "difficulty": "${difficultyLevel}"
  }
]

Rules:
- Generate exactly ${count} questions
- Make questions relevant to ${companyName}'s known interview patterns
- Each question must have exactly 4 options
- correctAnswer must exactly match one of the options
- Cover DSA, system design, language-specific, and aptitude as appropriate for ${companyName}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseAIResponse(text);

  if (!parsed || !Array.isArray(parsed)) {
    throw new Error('Failed to parse company questions from AI');
  }

  return parsed;
};

/**
 * 4. STUDY PLAN GENERATOR
 * Creates personalized study roadmap from resume + test data
 */
const generateStudyPlan = async (resumeData, testResults) => {
  const prompt = `You are an expert placement preparation mentor. Create a personalized 4-week study plan.

STUDENT PROFILE:
- Skills: ${resumeData.extractedSkills?.join(', ') || 'Not available'}
- Resume Score: ${resumeData.score || 'Not available'}/100
- Education: ${resumeData.education?.join(', ') || 'Not available'}

TEST PERFORMANCE:
${testResults.length > 0 ? testResults.map(t => `- Test (${t.type}): Score ${t.score}%, Weak Areas: ${t.weakAreas?.join(', ') || 'None identified'}`).join('\n') : '- No test data available yet'}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "overview": "Brief description of the study plan strategy",
  "totalWeeks": 4,
  "focusAreas": ["area1", "area2", "area3"],
  "weeks": [
    {
      "week": 1,
      "title": "Week title",
      "goal": "What to achieve this week",
      "topics": [
        {
          "name": "Topic name",
          "description": "What to study",
          "resources": ["Resource suggestion 1", "Resource suggestion 2"],
          "estimatedHours": 5,
          "priority": "high"
        }
      ],
      "dailyPlan": {
        "monday": "Task for Monday",
        "tuesday": "Task for Tuesday",
        "wednesday": "Task for Wednesday",
        "thursday": "Task for Thursday",
        "friday": "Task for Friday",
        "saturday": "Revision/Practice",
        "sunday": "Rest/Light review"
      }
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Rules:
- Address weak areas identified in test results
- Build on existing skills from the resume
- Be specific with topic names and descriptions
- Include practical coding practice recommendations
- Prioritize topics based on placement relevance`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseAIResponse(text);

  if (!parsed) {
    throw new Error('Failed to parse study plan from AI');
  }

  return parsed;
};

/**
 * 5. INTERVIEW QUESTION GENERATOR
 * Creates interview questions for simulation
 */
const generateInterviewQuestions = async (skills, role = 'Software Engineer') => {
  const prompt = `You are an expert interviewer at a top tech company. Generate 5 interview questions for a ${role} position.

Candidate's skills: ${skills.join(', ')}

Respond ONLY with valid JSON array (no markdown, no explanation):
[
  {
    "id": 1,
    "question": "Interview question text",
    "type": "technical",
    "topic": "Related topic",
    "expectedPoints": ["Key point 1 the answer should cover", "Key point 2", "Key point 3"],
    "difficulty": "medium"
  }
]

Rules:
- Generate exactly 5 questions
- Mix of technical, behavioral, and problem-solving questions
- type should be one of: "technical", "behavioral", "problem-solving"
- expectedPoints should list 3-5 key points a good answer would cover
- Questions should be relevant to the candidate's skills`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseAIResponse(text);

  if (!parsed || !Array.isArray(parsed)) {
    throw new Error('Failed to parse interview questions from AI');
  }

  return parsed;
};

/**
 * 6. INTERVIEW ANSWER EVALUATOR
 * Evaluates user's answer to an interview question
 */
const evaluateInterviewAnswer = async (question, userAnswer, expectedPoints) => {
  const prompt = `You are an expert interviewer evaluating a candidate's answer.

QUESTION: ${question}

EXPECTED KEY POINTS: ${expectedPoints?.join(', ') || 'General knowledge assessment'}

CANDIDATE'S ANSWER: ${userAnswer}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "score": 7,
  "maxScore": 10,
  "feedback": "Detailed feedback on the answer",
  "strengths": ["What was good about the answer"],
  "improvements": ["What could be improved"],
  "sampleAnswer": "A brief ideal answer for reference"
}

Rules:
- Score from 0-10
- Be constructive but honest in feedback
- Highlight both strengths and areas for improvement
- Provide a concise sample answer`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseAIResponse(text);

  if (!parsed) {
    throw new Error('Failed to parse interview evaluation from AI');
  }

  return parsed;
};

/**
 * 7. COMPANY RECOMMENDATION ENGINE
 * Recommends companies based on skills and performance
 */
const recommendCompanies = async (skills, testPerformance, profiles = {}) => {
  let profileText = '';
  if (profiles.leetcode || profiles.gfg || profiles.github) {
    profileText = `\nEXTERNAL PROFILES (Consider these as strong positive signals if present):
- LeetCode: ${profiles.leetcode || 'None'}
- GeeksforGeeks: ${profiles.gfg || 'None'}
- GitHub: ${profiles.github || 'None'}`;
  }

  const prompt = `You are a placement advisor. Recommend suitable companies for a student.

STUDENT PROFILE:
- Skills: ${skills.join(', ')}
- Average Test Score: ${testPerformance.averageScore || 'Not available'}%
- Strong Areas: ${testPerformance.strongAreas?.join(', ') || 'Not determined'}
- Weak Areas: ${testPerformance.weakAreas?.join(', ') || 'Not determined'}${profileText}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "recommendations": [
    {
      "company": "Company Name",
      "matchScore": 85,
      "reason": "Why this company is a good fit. Mention their external profiles if relevant (e.g. 'Your strong LeetCode profile makes you a great fit').",
      "rolesMatched": ["Role 1", "Role 2"],
      "skillsMatched": ["Matching skill 1", "Matching skill 2"],
      "preparationTips": ["Tip for preparing for this company"]
    }
  ]
}

Rules:
- Recommend 5-8 companies
- Include a mix of top tech, mid-tier, and startup companies
- matchScore should be 0-100 based on how well the student's profile fits
- If the student has a LeetCode or GFG profile, recommend more product-based or MAANG-level companies that value problem solving.
- Be realistic with recommendations based on the student's level
- Sort by matchScore descending`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseAIResponse(text);

  if (!parsed) {
    throw new Error('Failed to parse company recommendations from AI');
  }

  return parsed;
};

/**
 * 8. CHATBOT
 * Context-aware placement assistant
 */
const chat = async (message, conversationHistory = []) => {
  const systemContext = `You are Prepzify AI Assistant, a helpful and friendly placement preparation chatbot. You help students with:
- Placement preparation strategies
- Technical concept explanations
- Interview tips and tricks
- Career guidance
- Coding problem approaches
- Resume improvement suggestions

Be concise, helpful, and encouraging. If asked about non-placement topics, gently redirect to placement-related advice.`;

  // Build conversation context
  const historyText = conversationHistory
    .slice(-10) // Keep last 10 messages for context
    .map(msg => `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const prompt = `${systemContext}

${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}Student: ${message}

Respond naturally and helpfully. Keep responses concise (2-4 paragraphs max). Use bullet points for lists. Do not use markdown code blocks unless explaining code.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return text;
};

/**
 * 9. CODING CHALLENGE GENERATOR
 * Generates a coding problem with test cases and starter code
 * Mode: resume-based (uses score + skills) or company-based (uses STS + company patterns)
 */
const generateCodingChallenge = async ({ language, mode, resumeScore, companyName, skills, difficulty }) => {
  // Determine difficulty from resume score if not explicitly set
  let diffLevel = difficulty;
  if (!diffLevel) {
    const score = resumeScore || 50;
    if (score < 40) diffLevel = 'easy';
    else if (score < 70) diffLevel = 'medium';
    else diffLevel = 'hard';
  }

  const languageNames = {
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    python: 'Python',
    javascript: 'JavaScript',
  };
  const langName = languageNames[language] || 'Python';

  let contextBlock = '';
  if (mode === 'company-based' && companyName) {
    contextBlock = `This problem should be similar to what "${companyName}" asks in their coding interviews. Focus on the type of problems ${companyName} is known for (e.g., algorithms, data structures, system-related).`;
  } else if (skills && skills.length > 0) {
    contextBlock = `The student's skills include: ${skills.join(', ')}. Tailor the problem to be relevant to their skill set.`;
  }

  const prompt = `You are an expert coding challenge creator for placement preparation.

Generate a single coding problem for a ${diffLevel} difficulty level in ${langName} (but provide starter codes for multiple languages).

${contextBlock}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "title": "Short descriptive problem title",
  "description": "Detailed problem statement explaining what needs to be solved. Use clear language. Include a real-world context if possible.",
  "inputFormat": "Describe the input format clearly",
  "outputFormat": "Describe the expected output format",
  "constraints": ["Constraint 1 (e.g. 1 <= n <= 10^5)", "Constraint 2"],
  "examples": [
    {
      "input": "Sample input exactly as user would type it",
      "output": "Expected output",
      "explanation": "Brief explanation of why this output is correct"
    },
    {
      "input": "Another sample input",
      "output": "Expected output",
      "explanation": "Brief explanation"
    }
  ],
  "testCases": [
    { "input": "test input 1", "expectedOutput": "expected output 1", "isHidden": false },
    { "input": "test input 2", "expectedOutput": "expected output 2", "isHidden": false },
    { "input": "edge case input", "expectedOutput": "expected output", "isHidden": true }
  ],
  "starterCodes": {
    "python": "Python starter code with proper standard I/O (e.g. using input() or sys.stdin.read())",
    "javascript": "JavaScript starter code (e.g. using process.stdin or readline)",
    "java": "Java starter code with public class Main and public static void main reading from System.in",
    "cpp": "C++ starter code reading from std::cin",
    "c": "C starter code reading via scanf"
  },
  "hints": ["Hint 1 without giving away the solution", "Hint 2"],
  "topics": ["Array", "Sorting"],
  "optimalComplexity": { "time": "O(n log n)", "space": "O(n)" }
}

Rules:
- Generate exactly 3 test cases (2 visible, 1 hidden)
- ALL starter codes MUST be valid syntax for their respective languages and include proper standard I/O boilerplate. They should compile/run as-is but produce no correct output.
- Problem difficulty: ${diffLevel === 'easy' ? 'basic loops, arrays, strings, simple math' : diffLevel === 'hard' ? 'dynamic programming, graphs, advanced algorithms, optimization' : 'sorting, searching, recursion, hash maps, stacks/queues'}
- Make the problem self-contained and solvable within 20-40 minutes`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseAIResponse(text);

  if (!parsed) {
    throw new Error('Failed to parse coding challenge from AI');
  }

  return { ...parsed, language, difficulty: diffLevel };
};

/**
 * 10. CODING SOLUTION EVALUATOR
 * Evaluates user's submitted code against test cases and provides detailed feedback
 */
const evaluateCodingSolution = async (problem, userCode, language, testCases) => {
  const languageNames = {
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    python: 'Python',
    javascript: 'JavaScript',
  };
  const langName = languageNames[language] || 'Python';

  const testCaseStr = testCases.map((tc, i) =>
    `Test Case ${i + 1}: Input: ${tc.input} | Expected Output: ${tc.expectedOutput}`
  ).join('\n');

  const prompt = `You are an expert ${langName} code reviewer and evaluator for placement interviews.

PROBLEM:
Title: ${problem.title}
Description: ${problem.description}
Input Format: ${problem.inputFormat}
Output Format: ${problem.outputFormat}

TEST CASES:
${testCaseStr}

STUDENT'S ${langName} CODE:
\`\`\`${language}
${userCode}
\`\`\`

Analyze the code carefully. Mentally trace through each test case to determine if the code would produce the correct output.

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "score": 75,
  "totalScore": 100,
  "testResults": [
    {
      "testCase": 1,
      "input": "the input",
      "expectedOutput": "expected",
      "actualOutput": "what the code would produce",
      "passed": true,
      "notes": "Brief note about this test case"
    }
  ],
  "feedback": "Detailed overall feedback about the solution (2-3 sentences)",
  "strengths": ["What the student did well"],
  "improvements": ["Specific improvements to make"],
  "complexity": {
    "time": "O(n)",
    "space": "O(1)",
    "analysis": "Brief explanation of why this is the complexity"
  },
  "codeQuality": {
    "readability": 8,
    "efficiency": 7,
    "correctness": 8,
    "edgeCases": 6
  },
  "optimalSolution": "Brief description of the optimal approach if the student's solution is suboptimal",
  "compilationIssues": "Any syntax or compilation issues found, or 'None' if code is syntactically correct"
}

Rules:
- Score based on: test cases passed (60%), code quality (20%), efficiency (20%)
- Be thorough but constructive in feedback
- testResults must have one entry per test case
- codeQuality scores are 1-10
- If code has syntax errors, still evaluate the logical approach and give partial credit`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseAIResponse(text);

  if (!parsed) {
    throw new Error('Failed to parse code evaluation from AI');
  }

  return parsed;
};

module.exports = {
  analyzeResume,
  generateResumeBasedQuestions,
  generateCompanyQuestions,
  generateStudyPlan,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  recommendCompanies,
  chat,
  generateCodingChallenge,
  evaluateCodingSolution,
};
