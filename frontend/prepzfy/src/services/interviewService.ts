import { InterviewFeedback } from "../types";

export async function analyzeInterview(transcript: { role: string; chunk: string; timestamp: number }[]): Promise<InterviewFeedback> {
  const conversationString = transcript
    .map(t => `${t.role.toUpperCase()}: ${t.chunk}`)
    .join('\n');

  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "getFeedback",
        payload: { transcript: conversationString }
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.result;
    
    try {
      return JSON.parse(result);
    } catch (e) {
      console.error("Failed to parse Interview Analysis JSON:", result);
      throw new Error("Invalid response format from AI");
    }
  } catch (error) {
    console.error("Interview Analysis Error:", error);
    throw error;
  }
}
