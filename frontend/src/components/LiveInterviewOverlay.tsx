import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Loader2, 
  User, 
  Bot,
  StopCircle,
  MessageSquare,
  Volume2
} from 'lucide-react';
import { generateInterviewQuestion } from '../services/geminiService';
import { analyzeInterview } from '../services/interviewService';
import { proctoring, ProctoringDetection } from '../services/proctoringService';
import FeedbackReport from './FeedbackReport';
import { InterviewFeedback, InterviewMessage } from '../types';
import { AlertTriangle, ShieldCheck, Download, Activity } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface LiveInterviewOverlayProps {
  mode: 'audio' | 'video';
  role: string;
  onClose: () => void;
}

// Internal UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-gray-900 border-gray-800 rounded-3xl overflow-hidden shadow-2xl ${className}`}>{children}</div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = "" 
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'ghost' | 'outline', 
  size?: 'sm' | 'md' | 'lg' | 'icon',
  disabled?: boolean,
  className?: string
}) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    outline: "border border-gray-700 text-gray-300 hover:bg-gray-800",
    ghost: "text-gray-400 hover:text-white hover:bg-gray-800"
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-8 py-3 text-base",
    icon: "p-2"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

export default function LiveInterviewOverlay({ mode, role, onClose }: LiveInterviewOverlayProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCamEnabled, setIsCamEnabled] = useState(mode === 'video');
  const [isModelSpeaking, setIsModelSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<InterviewMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [proctoringData, setProctoringData] = useState<ProctoringDetection | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [interviewSessionId, setInterviewSessionId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const transcriptRef = useRef<InterviewMessage[]>([]);
  const statusRef = useRef({ active: false, speaking: false, connecting: false, micEnabled: true });

  useEffect(() => {
    statusRef.current = { active: isSessionActive, speaking: isModelSpeaking, connecting: isConnecting, micEnabled: isMicEnabled };
  }, [isSessionActive, isModelSpeaking, isConnecting, isMicEnabled]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  useEffect(() => {
    if (proctoringData) {
      const newWarnings = [];
      if (proctoringData.facesCount > 1) newWarnings.push("Multiple people detected!");
      if (proctoringData.facesCount === 0) newWarnings.push("No face detected!");
      if (proctoringData.lookingAway) newWarnings.push("Looking away from screen!");
      if (proctoringData.suspiciousMovement) newWarnings.push("Suspicious movement detected!");
      setWarnings(newWarnings);
    }
  }, [proctoringData]);

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.pitch = 1;
    
    const voices = window.speechSynthesis.getVoices();
    // Try to find a high quality female voice
    const femaleVoice = voices.find(v => 
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft') || v.name.includes('Apple')) && 
      (v.name.includes('Female') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('victoria'))
    ) || voices.find(v => v.name.includes('Female')) || voices[0];
    
    if (femaleVoice) utterance.voice = femaleVoice;

    // Adjust rate and pitch to sound more human-like, slightly faster paced but natural
    utterance.rate = 1.05;
    utterance.pitch = 1.1;

    // Fallback timeout in case onend is buggy
    const fallbackTimeout = setTimeout(() => {
         setIsModelSpeaking(false);
         startListening();
    }, text.length * 100 + 4000); // rough estimate of speaking time

    utterance.onend = () => {
      clearTimeout(fallbackTimeout);
      setIsModelSpeaking(false);
      startListening();
    };
    
    synthesisRef.current = utterance;
    setIsModelSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!statusRef.current.micEnabled || !statusRef.current.active) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported");
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (text) {
        handleUserResponse(text);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Recognition error:", event.error);
      if (statusRef.current.active && !statusRef.current.speaking && !statusRef.current.connecting) {
        setTimeout(() => startListening(), 1000);
      }
    };

    recognition.onend = () => {
      if (statusRef.current.active && !statusRef.current.speaking && !statusRef.current.connecting) {
        setTimeout(() => startListening(), 1000);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) {
      console.warn("Failed to start speech recognition automatically", e);
    }
  };

  const handleUserResponse = async (text: string) => {
    const newMessage: InterviewMessage = { role: 'user', chunk: text, timestamp: Date.now() };
    setTranscript(prev => [...prev, newMessage]);
    
    try {
      setIsConnecting(true); // Re-using connecting state for AI "thinking"
      const resultJson = await generateInterviewQuestion([...transcriptRef.current, newMessage].map(t => ({
        role: t.role === 'model' ? 'ai' : 'user',
        content: t.chunk
      })), role);
      
      let parsedResult = resultJson;
      try {
        parsedResult = resultJson.replace(/```json\n?|```/g, '').trim();
      } catch (e) {}
      
      let aiResponse = "I'm sorry, I didn't catch that. Could you repeat?";
      try {
        const result = JSON.parse(parsedResult);
        if (result && result.nextQuestion) {
           aiResponse = result.nextQuestion;
        } else if (result && result.response) {
           aiResponse = result.response;
        } else if (typeof result === 'string') {
           aiResponse = result;
        }
      } catch (e) {
        console.error("Failed to parse AI response as JSON", parsedResult);
        // Fallback to raw text
        aiResponse = parsedResult.replace(/[{}"_]/g, '');
      }
      
      const aiMessage: InterviewMessage = { role: 'model', chunk: aiResponse, timestamp: Date.now() };
      setTranscript(prev => [...prev, aiMessage]);
      speak(aiResponse);
    } catch (err) {
      console.error("AI response failed:", err);
      setError("AI failed to respond. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEndSession = async () => {
    if (!transcript.length) {
      onClose();
      return;
    }

    try {
      setIsAnalyzing(true);
      stopSession();
      const analysis = await analyzeInterview(transcript);
      setFeedback(analysis);

      const user = auth.currentUser;
      if (user && interviewSessionId) {
        const sessionRef = doc(db, 'interviews', interviewSessionId);
        await updateDoc(sessionRef, {
          status: 'completed',
          endTime: serverTimestamp(),
          feedback: analysis
        });

        const messagesCol = collection(db, `interviews/${interviewSessionId}/messages`);
        for (const msg of transcript) {
          await addDoc(messagesCol, {
            role: msg.role,
            content: msg.chunk,
            timestamp: serverTimestamp()
          });
        }
      }
    } catch (err) {
      console.error("Analysis or Saving failed:", err);
      if (transcript.length > 0 && !feedback) {
         setFeedback({
            overallScore: 0,
            technicalAccuracy: 0,
            clarity: 0,
            conciseness: 0,
            communicationSkills: { pace: 0, jargonUsage: 0, fillerWordCount: 0, effectiveness: 0 },
            pros: [],
            cons: [],
            actionableTips: [],
            summary: "Session completed, but analysis failed."
         });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const user = auth.currentUser;
      if (user) {
        const docRef = await addDoc(collection(db, 'interviews'), {
          userId: user.uid,
          mode,
          role,
          startTime: serverTimestamp(),
          status: 'active'
        });
        setInterviewSessionId(docRef.id);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === 'video' });
      streamRef.current = stream;
      if (videoRef.current && mode === 'video') videoRef.current.srcObject = stream;

      setIsSessionActive(true);
      
      // Kickoff interview
      const startJson = await generateInterviewQuestion([], role);
      let parsedStart = startJson;
      try {
        parsedStart = startJson.replace(/```json\n?|```/g, '').trim();
      } catch (e) {}
      
      let firstQuestion = "Hello, let's begin the interview. Could you state your name and branch?";
      try {
        const startResult = JSON.parse(parsedStart);
        if (startResult && startResult.nextQuestion) firstQuestion = startResult.nextQuestion;
        else if (startResult && startResult.response) firstQuestion = startResult.response;
        else if (typeof startResult === 'string') firstQuestion = startResult;
      } catch (e) {
        console.error("Failed to parse start result:", parsedStart);
      }
      
      setTranscript([{ role: 'model', chunk: firstQuestion, timestamp: Date.now() }]);
      setIsConnecting(false);
      speak(firstQuestion);

      if (mode === 'video') startProctoring();
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "Failed to start interview.");
      setIsConnecting(false);
    }
  };

  const startProctoring = async () => {
    await proctoring.initialize();
    const interval = setInterval(async () => {
      if (videoRef.current && isSessionActive && isCamEnabled) {
        const result = await proctoring.runDetection(videoRef.current);
        setProctoringData(result);
      }
    }, 2000);
    return () => clearInterval(interval);
  };

  const stopSession = () => {
    setIsSessionActive(false);
    window.speechSynthesis?.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const downloadTranscript = () => {
    const text = transcript.map(t => `${t.role.toUpperCase()}: ${t.chunk}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString()}.txt`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] flex flex-col gap-4"
      >
        <Card className="flex flex-col h-full relative border-none md:border md:border-gray-800">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-white font-bold flex items-center gap-2">
                {mode === 'video' ? 'AI Video Interview' : 'AI Voice Interview'}
                <span className="text-xs text-gray-400 font-normal">Active Session</span>
              </h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => (stopSession(), onClose())}>
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden min-h-0">
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden min-h-[40vh] md:min-h-[300px]">
              {mode === 'video' ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className={`w-full h-full object-cover ${!isCamEnabled ? 'hidden' : ''}`}
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {isSessionActive && (
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                          <Activity size={12} className="text-green-500" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Proctoring</span>
                        </div>
                        <AnimatePresence>
                          {warnings.map((w) => (
                            <motion.div 
                              key={w}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="flex items-center gap-2 bg-red-600/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-red-500 shadow-xl"
                            >
                              <AlertTriangle size={14} className="text-white" />
                              <span className="text-xs font-bold text-white">{w}</span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                  {!isCamEnabled && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500 gap-4">
                      <div className="h-20 w-20 rounded-full bg-gray-800 flex items-center justify-center">
                        <User size={40} />
                      </div>
                      <p className="text-sm font-medium">Camera is disabled</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                  <div className="relative">
                    <motion.div 
                      animate={isModelSpeaking ? { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -inset-8 bg-indigo-500/20 rounded-full blur-2xl"
                    />
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl relative z-10">
                      <Bot size={64} className="text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2 text-center px-4">
                    <p className="text-white font-bold text-xl">Olivia - Technical Interviewer</p>
                    <p className="text-indigo-400 text-sm animate-pulse">{isModelSpeaking ? 'Olivia is speaking...' : 'Listening...'}</p>
                  </div>
                </div>
              )}

              {/* Model Thinking/Speaking UI feedback Overlay */}
              {(isModelSpeaking || (isConnecting && isSessionActive)) && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
                  <div className="bg-indigo-600 px-4 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl border border-indigo-400/30">
                    {isConnecting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Olivia Thinking</>
                    ) : (
                      <><Volume2 className="w-4 h-4 animate-bounce" /> Olivia Speaking</>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-8 text-center gap-4 z-40">
                  <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center">
                    <X size={24} className="text-white" />
                  </div>
                  <p className="text-red-200 font-medium">{error}</p>
                  <Button onClick={startSession} variant="outline" className="border-red-500 text-red-100">Try Again</Button>
                </div>
              )}

              {isConnecting && !isSessionActive && !error && (
                <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center gap-4 z-40">
                  <Loader2 size={40} className="animate-spin text-indigo-500" />
                  <p className="text-gray-300 font-medium">Connecting...</p>
                </div>
              )}

              {!isSessionActive && !error && (
                <div className="absolute inset-0 bg-gray-900/95 flex flex-col items-center justify-center gap-6 z-40 p-8 text-center">
                  <div className="h-20 w-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2 mx-auto">
                    {mode === 'video' ? <VideoIcon size={40} className="text-indigo-400" /> : <Mic size={40} className="text-indigo-400" />}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Ready for your interview?</h3>
                    <p className="text-gray-400 max-w-xs mx-auto text-sm">Face Olivia, your AI technical interviewer, for a deep-dive preparation session.</p>
                  </div>
                  <Button onClick={startSession} size="lg" className="h-12 px-10 rounded-full">Start Interview</Button>
                </div>
              )}
            </div>

            <div className="w-full md:w-80 bg-gray-900/50 border-t md:border-t-0 md:border-l border-gray-800 p-4 flex flex-col gap-4 overflow-hidden h-[30vh] md:h-auto">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={12} /> Live Transcript
                  </h4>
                  {transcript.length > 0 && (
                    <button onClick={downloadTranscript} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                      <Download size={10} /> Export
                    </button>
                  )}
               </div>
                <div className="flex-1 overflow-auto space-y-3 custom-scrollbar pr-2">
                   {transcript.length === 0 ? (
                     <div className="text-gray-600 italic text-xs py-4">Waiting for conversation...</div>
                   ) : (
                     transcript.slice(-15).map((t, i) => (
                       <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className={`text-xs p-3 rounded-xl border ${t.role === 'user' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100' : 'bg-gray-800/50 border-gray-700/50 text-gray-300'}`}>
                         <p className="text-[8px] font-bold uppercase opacity-40 mb-1">{t.role === 'user' ? 'You' : 'Olivia'}</p>
                         {t.chunk}
                       </motion.div>
                     ))
                   )}
                </div>
            </div>
          </div>

          <div className="p-4 md:p-6 border-t border-gray-800 bg-gray-900 flex items-center justify-center gap-4 md:gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <Button 
                onClick={() => setIsMicEnabled(!isMicEnabled)}
                variant="outline" size="icon"
                className={`h-12 w-12 md:h-14 md:w-14 rounded-full border-2 ${isMicEnabled ? 'bg-gray-800 border-gray-700 text-white' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                {isMicEnabled ? <Mic size={20} className="md:w-6 md:h-6" /> : <MicOff size={20} className="md:w-6 md:h-6" />}
              </Button>
              <span className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase">{isMicEnabled ? 'Listening' : 'Muted'}</span>
            </div>

            {mode === 'video' && (
              <div className="flex flex-col items-center gap-1.5">
                <Button 
                  onClick={() => setIsCamEnabled(!isCamEnabled)}
                  variant="outline" size="icon"
                  className={`h-12 w-12 md:h-14 md:w-14 rounded-full border-2 ${isCamEnabled ? 'bg-gray-800 border-gray-700 text-white' : 'bg-red-500/20 border-red-500 text-red-500'}`}>
                  {isCamEnabled ? <VideoIcon size={20} className="md:w-6 md:h-6" /> : <VideoOff size={20} className="md:w-6 md:h-6" />}
                </Button>
                <span className="text-[8px] md:text-[9px] text-gray-500 font-bold uppercase">{isCamEnabled ? 'Video On' : 'Video Off'}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-1.5">
              <Button onClick={handleEndSession} disabled={isAnalyzing} className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-xl shadow-red-900/20">
                {isAnalyzing ? <Loader2 size={28} className="animate-spin md:w-8 md:h-8" /> : <StopCircle size={28} className="md:w-8 md:h-8" />}
              </Button>
              <span className="text-[8px] md:text-[9px] text-red-500 font-black uppercase">{isAnalyzing ? 'Analyzing...' : 'End Session'}</span>
            </div>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-0 bg-white z-[60] p-6 lg:p-10">
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex justify-end mb-4">
                    <Button variant="outline" className="rounded-full text-indigo-600 border-indigo-100" onClick={onClose}>
                      <X size={18} className="mr-1" /> Close Report
                    </Button>
                  </div>
                  <FeedbackReport feedback={feedback} transcript={transcript} onClose={onClose} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
