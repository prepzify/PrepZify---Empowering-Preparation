import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Video, 
  Mic, 
  Trophy,
  ArrowLeft,
  Download,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  Timestamp 
} from 'firebase/firestore';
import { InterviewSession, InterviewMessage } from '../types';
import FeedbackReport from './FeedbackReport';

export default function InterviewHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'interviews'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('startTime', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InterviewSession[];
      setSessions(docs);
    } catch (err) {
      console.error("Fetch Sessions Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = async (session: InterviewSession) => {
    setSelectedSession(session);
    setLoadingMessages(true);
    try {
      const q = query(
        collection(db, `interviews/${session.id}/messages`),
        orderBy('timestamp', 'asc')
      );
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          role: data.role,
          chunk: data.content,
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toMillis() : Date.now()
        };
      }) as InterviewMessage[];
      setMessages(msgs);
    } catch (err) {
      console.error("Fetch Messages Error:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const formatTimestamp = (ts: any) => {
    if (!ts) return '';
    const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
    return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Retrieving History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <AnimatePresence mode="wait">
        {!selectedSession ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 lg:p-12 max-w-6xl mx-auto space-y-12"
          >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-indigo-400">
                    <History size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Assessment Archives</span>
                 </div>
                 <h1 className="text-4xl font-black text-on-surface uppercase tracking-tight">Interview <span className="text-indigo-400">History</span></h1>
                 <p className="text-on-surface-variant text-xs font-medium">Review your past performances and track your progress over time.</p>
              </div>
              <button 
                onClick={() => navigate('/interview')}
                className="bg-indigo-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all w-fit"
              >
                Start New Session
              </button>
            </header>

            {sessions.length === 0 ? (
              <div className="bg-surface-container rounded-3xl p-20 text-center border border-outline-variant space-y-4">
                 <div className="w-16 h-16 bg-on-surface/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} className="text-on-surface-variant" />
                 </div>
                 <h3 className="text-xl font-bold text-on-surface">No interviews found</h3>
                 <p className="text-on-surface-variant text-sm max-w-xs mx-auto">You haven't completed any AI mock interviews yet. Start your first session now!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sessions.map((session) => (
                  <motion.div
                    whileHover={{ scale: 1.005 }}
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className="group bg-surface-container border border-outline-variant rounded-3xl p-6 cursor-pointer hover:border-indigo-400/40 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${session.mode === 'video' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {session.mode === 'video' ? <Video size={24} /> : <Mic size={24} />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-on-surface uppercase tracking-tight flex items-center gap-2">
                           {session.role}
                           {session.feedback && (
                             <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-indigo-400/20">
                               SCORE: {session.feedback.overallScore}
                             </span>
                           )}
                        </h4>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                          <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatTimestamp(session.startTime)}</span>
                          <span className="flex items-center gap-1.5"><Clock size={12} /> {session.mode} TEST</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-6 lg:p-12 max-w-6xl mx-auto space-y-8"
          >
            <button 
              onClick={() => setSelectedSession(null)}
              className="group flex items-center gap-2 text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft size={16} /> Back to History
            </button>

            <div className="grid lg:grid-cols-[1fr,400px] gap-8">
              <div className="space-y-8">
                <header className="bg-surface-container rounded-3xl p-8 border border-outline-variant flex justify-between items-center bg-gradient-to-br from-surface-container to-surface-container-high shadow-xl shadow-black/5">
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400">
                         {selectedSession.mode === 'video' ? <Video size={16} /> : <Mic size={16} />}
                         <span className="text-[10px] font-black uppercase tracking-widest">{selectedSession.mode} Interview</span>
                      </div>
                      <h2 className="text-3xl font-black text-on-surface uppercase tracking-tighter">Session <span className="text-indigo-400">Detailed Report</span></h2>
                      <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                        <span>{selectedSession.role} Role</span>
                        <span>•</span>
                        <span>{formatTimestamp(selectedSession.startTime)}</span>
                      </div>
                   </div>
                   {selectedSession.feedback && (
                     <div className="text-center bg-background p-4 rounded-2xl border border-outline-variant">
                        <div className="text-3xl font-black text-indigo-500 leading-none">{selectedSession.feedback.overallScore}</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mt-1">Final Score</div>
                     </div>
                   )}
                </header>

                {selectedSession.feedback ? (
                  <FeedbackReport 
                     feedback={selectedSession.feedback} 
                     transcript={messages}
                     onClose={() => setSelectedSession(null)} 
                  />
                ) : (
                  <div className="bg-surface-container rounded-3xl p-12 text-center border border-outline-variant space-y-4">
                     <FileText size={48} className="text-on-surface-variant mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-on-surface">Transcript Only Available</h3>
                     <p className="text-on-surface-variant text-sm">Automated feedback analysis was not completed for this session.</p>
                  </div>
                )}
              </div>

              <aside className="space-y-6">
                <div className="bg-surface-container border border-outline-variant rounded-3xl flex flex-col h-[600px] overflow-hidden shadow-2xl">
                   <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-container-high">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface flex items-center gap-2">
                         <MessageSquare size={14} className="text-indigo-400" /> Full Transcript
                      </h4>
                      <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-1 uppercase tracking-widest">
                         <Download size={14} /> Save TXT
                      </button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-surface-container to-background scrollbar-hide">
                      {loadingMessages ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-on-surface-variant">
                           <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                           <span className="text-[8px] font-black uppercase tracking-[0.2em]">Loading Chat...</span>
                        </div>
                      ) : messages.length > 0 ? (
                        messages.map((msg, i) => (
                           <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`p-4 rounded-2xl text-xs font-medium max-w-[85%] leading-relaxed ${
                                msg.role === 'user' 
                                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20' 
                                  : 'bg-surface-container-highest border border-outline-variant text-on-surface rounded-tl-none'
                              }`}>
                                {msg.chunk}
                              </div>
                              <span className="text-[7px] font-black text-on-surface-variant mt-1.5 uppercase opacity-60 tracking-wider">
                                {msg.role === 'user' ? 'ME' : 'AI'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                        ))
                      ) : (
                        <div className="text-center py-20 text-on-surface-variant italic text-xs">No transcript available for this session.</div>
                      )}
                   </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 space-y-4">
                   <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Trophy size={14} /> PLACEMENT INSIGHT
                   </h5>
                   <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium italic">
                     "This session demonstrates strong technical grounding but suggests more work on behavioral response structures like the STAR method."
                   </p>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
