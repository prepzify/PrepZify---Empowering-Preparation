import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, User, Bot, Loader2, Award, RefreshCw, Mic, Video, StopCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getGeminiChatResponse, getInterviewFeedback } from "../../services/gemini";
import LiveInterviewOverlay from "./LiveInterviewOverlay";
import { useAuth } from "../../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function InterviewSession() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI Interviewer. Today we'll be discussing Data Structures and Algorithms. Are you ready to begin?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [isLiveMode, setIsLiveMode] = useState<'audio' | 'video' | null>(null);
  const [initialStream, setInitialStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const assistantMessage = await getGeminiChatResponse(messages, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

      if (assistantMessage.toLowerCase().includes("finish") || assistantMessage.toLowerCase().includes("end of our session")) {
        setIsFinished(true);
        generateFeedback([...messages, { role: 'user', content: userMessage }, { role: 'assistant', content: assistantMessage }]);
      }
    } catch (error) {
      console.error("Interview Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "There was an error connecting to the interviewer. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLive = (mode: 'audio' | 'video') => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser does not support media access.");
      return;
    }
    setPermissionError(null);
    setInitialStream(null);
    setIsLiveMode(mode);
  };

  const generateFeedback = async (transcript: Message[]) => {
    setIsLoading(true);
    try {
      const textTranscript = transcript.map(m => `${m.role}: ${m.content}`).join("\n");
      const data = await getInterviewFeedback(textTranscript);
      if (data) {
        setFeedback(data);
        
        // Save to Firestore
        if (user) {
          const path = 'interviews';
          try {
            await addDoc(collection(db, path), {
              userId: user.uid,
              mode: 'text',
              messages: transcript,
              feedback: data,
              createdAt: serverTimestamp()
            });
          } catch (dbErr) {
            handleFirestoreError(dbErr, OperationType.CREATE, path);
          }
        }
      }
    } catch (error) {
      console.error("Feedback Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (feedback) {
    return (
      <Card className="border-none shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-indigo-600 text-white p-6">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Award size={28} />
            Interview Performance Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="flex flex-col items-center justify-center py-6 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="text-5xl font-black text-indigo-600 mb-2">{feedback.score}%</div>
            <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Overall Score</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-bold text-green-600 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Key Strengths
              </h4>
              <ul className="space-y-2">
                {feedback.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-100">{s}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-amber-600 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                Areas for Improvement
              </h4>
              <ul className="space-y-2">
                {feedback.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600 bg-amber-50 p-3 rounded-lg border border-amber-100">{w}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Detailed Feedback</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{feedback.overallFeedback}</p>
          </div>

          <Button 
            onClick={() => { setFeedback(null); setMessages([{ role: 'assistant', content: "Ready for another round? Let's start!" }]); setIsFinished(false); }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 font-bold gap-2"
          >
            <RefreshCw size={18} />
            Start New Interview
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm flex flex-col h-[600px] bg-white overflow-hidden">
      <CardHeader className="border-b bg-gray-50/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Bot className="text-indigo-600" size={20} />
            AI Interviewer
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isFinished && !feedback && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleStartLive('audio')}
                  className="h-8 gap-2 text-[11px] font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Mic size={14} />
                  AI Voice
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleStartLive('video')}
                  className="h-8 gap-2 text-[11px] font-bold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Video size={14} />
                  AI Video
                </Button>
              </>
            )}
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider animate-pulse">Live Session</Badge>
          </div>
        </div>
      </CardHeader>
      
      {permissionError && (
        <div className="bg-red-50 border-b border-red-100 p-3 flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 text-red-700 text-xs font-medium">
            <StopCircle size={14} />
            {permissionError}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setPermissionError(null)}
            className="h-6 w-6 p-0 text-red-400 hover:text-red-700 hover:bg-red-100"
          >
            ×
          </Button>
        </div>
      )}
      
      {isLiveMode && (
        <LiveInterviewOverlay 
          mode={isLiveMode} 
          initialStream={initialStream}
          onClose={() => {
            setIsLiveMode(null);
            if (initialStream) {
              initialStream.getTracks().forEach(t => t.stop());
              setInitialStream(null);
            }
          }} 
          onTranscriptUpdate={(text) => {
             // Handle transcript synchronization if needed
          }}
        />
      )}      
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100' 
                : 'bg-gray-50 text-gray-700 rounded-tl-none border border-gray-100'
              }`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && !feedback && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="h-8 w-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 rounded-tl-none">
                <Loader2 size={16} className="animate-spin text-indigo-600" />
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t bg-gray-50/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isFinished ? "Interview finished. Generating report..." : "Type your response..."}
            disabled={isLoading || isFinished}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || isFinished || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-4 h-10"
          >
            <Send size={18} />
          </Button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          Tip: Be detailed in your answers. Type "finish" to end the interview.
        </p>
      </div>
    </Card>
  );
}
