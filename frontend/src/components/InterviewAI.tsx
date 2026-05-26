import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import LiveInterviewOverlay from './LiveInterviewOverlay';
import { 
  Mic, 
  Video, 
  VideoOff, 
  MicOff, 
  MessageSquare, 
  X, 
  Zap,
  LayoutGrid,
  Info,
  Terminal,
  History,
  Send,
  Timer,
  User,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';

interface Message {
  role: 'ai' | 'user';
  content: string;
  feedback?: {
    strengths: string[];
    improvements: string[];
  };
}

type Mode = 'video' | 'audio';

export default function InterviewAI() {
  const navigate = useNavigate();
  const { checkLimit, incrementUsage, triggerUpgrade } = useSubscription();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [mode, setMode] = useState<Mode>('video');
  const [isStarted, setIsStarted] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Software Development Engineer');
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 mins
  const [showTranscript, setShowTranscript] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  const startInterview = async () => {
    const check = checkLimit('interview');
    if (!check.allowed) {
      triggerUpgrade(`You have completed your weekly limit of ${check.limit} free mock interview(s). Upgrade to a premium plan to unlock more assessments!`);
      return;
    }

    try {
      await incrementUsage('interview');
      setIsStarted(true);
    } catch (e) {
      console.error("Failed to track interview usage:", e);
      // fallback so user doesn't get fully blocked if Firebase has a transient error
      setIsStarted(true);
    }
  };

  const endSession = () => {
    setIsStarted(false);
    setMessages([]);
    setCurrentQuestion('');
    setTimeLeft(1800);
    chatSessionRef.current = null;
  };

  const handleSendText = async () => {
    if (!userInput.trim() || !chatSessionRef.current || isTyping) return;
    
    const userText = userInput;
    setUserInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userText });
      const aiText = result.text;
      setMessages(prev => [...prev, { role: 'ai', content: aiText }]);
      setCurrentQuestion(aiText);
    } catch (err) {
      console.error("Chat error:", err);
      setErrorStatus("Failed to get response. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let interval: any;
    if (isStarted) interval = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, [isStarted]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.div 
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[calc(100vh-64px)] overflow-y-auto bg-background items-center justify-center p-4 md:p-6"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl w-full space-y-8 md:space-y-12 py-10"
            >
              <div className="text-center space-y-4">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
                    <Zap className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Pre-Interview Briefing</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black text-on-surface">Configure Your Session</h2>
                 <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                   Set up your environment and select your target role to begin the deep-dive technical assessment.
                 </p>
                 <button 
                   onClick={() => navigate('/interviews/history')}
                   className="flex items-center gap-2 mx-auto mt-4 text-[10px] font-black text-on-surface-variant hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]"
                 >
                   <History className="w-3 h-3" /> View Interview History
                 </button>
              </div>

              <div className="grid gap-8">
                <div className="space-y-4">
                   <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Target Position</label>
                   <input 
                     type="text" 
                     value={selectedRole}
                     onChange={(e) => setSelectedRole(e.target.value)}
                     className="w-full bg-surface-container border border-outline rounded-2xl p-4 text-on-surface font-medium focus:border-primary/40 transition-colors outline-none shadow-sm"
                     placeholder="e.g. Senior Frontend Engineer"
                   />
                </div>

                 <div className="space-y-4">
                   <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">AI Simulation Format</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                     {[
                       { id: 'video', label: 'Video Interview', icon: Video, desc: 'Real-time camera & AI voice analysis' },
                       { id: 'audio', label: 'Audio Only', icon: Mic, desc: 'Voice communication with AI response' },
                     ].map((t) => (
                       <button
                         key={t.id}
                         onClick={() => setMode(t.id as Mode)}
                         className={`flex flex-row sm:flex-col items-center sm:items-start gap-4 p-4 md:p-5 rounded-2xl border transition-all text-left ${
                           mode === t.id 
                             ? 'border-indigo-400 bg-indigo-400/5 text-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.1)]' 
                             : 'border-outline bg-surface-container text-on-surface-variant hover:border-outline-variant'
                         }`}
                       >
                         <t.icon className={`w-5 h-5 shrink-0 ${mode === t.id ? 'text-indigo-400' : ''}`} />
                         <div>
                           <p className={`text-xs font-bold leading-none mb-1 ${mode === t.id ? 'text-on-surface' : ''}`}>{t.label}</p>
                           <p className="text-[10px] opacity-60 font-medium">{t.desc}</p>
                         </div>
                       </button>
                     ))}
                   </div>
                </div>

                <div className="bg-surface-container-highest border border-outline-variant rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <div className="space-y-2 relative z-10 text-center md:text-left">
                     <div className="flex items-center gap-2 text-indigo-400 justify-center md:justify-start">
                        <User className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Premium Service</span>
                     </div>
                     <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Need a Human Expert?</h3>
                     <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-widest leading-relaxed max-w-sm">
                        Connect with industry veterans on WhatsApp or In-Site for a realistic mock interview.
                     </p>
                  </div>
                  <button 
                    onClick={() => navigate('/expert')}
                    className="relative z-10 px-8 py-4 bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                  >
                    Book Expert <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-surface-container border border-outline rounded-2xl p-6 flex items-center justify-center">
                  <button 
                    onClick={startInterview}
                    className="w-full sm:w-auto px-16 py-4 bg-primary text-on-primary font-black uppercase text-[11px] tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                  >
                    Begin AI Assessment
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <LiveInterviewOverlay key="live-overlay" mode={mode} role={selectedRole} onClose={endSession} />
        )}
      </AnimatePresence>
    </>
  );
}
