import { useState } from 'react';
import { ChevronRight, ShieldCheck, Zap, Info, PlayCircle, BookOpen, UserCheck, MessageSquare, Trophy, Target, X, Compass, Sparkles } from 'lucide-react';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

export default function Support() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [discordToast, setDiscordToast] = useState(false);

  const [showGoals, setShowGoals] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const walkthroughSlides = [
    {
      title: 'AI Roadmaps & Study Paths',
      desc: 'Enter any skill or company target to instantly generate a custom 4-week learning path loaded with curated resources and capstone deliverables.',
      icon: Compass,
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    {
      title: 'Practice Arena',
      desc: 'Hone your software engineering instincts with ranked coding challenges covering data structures, system design, and algorithmic benchmarks.',
      icon: BookOpen,
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'Interview AI Simulation',
      desc: 'Experience full voice-enabled interactive interviews. Our adaptive AI acts as specialized industry practitioners probing your technical and behavioral edge cases.',
      icon: PlayCircle,
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    {
      title: 'Resume Intelligence',
      desc: 'Extract and analyze your profile contextually. Get immediate placement probability scores, formatting suggestions, and semantic keyword tailoring.',
      icon: UserCheck,
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const subject = ticketSubject;
    const message = ticketMessage;
    const email = auth.currentUser?.email || 'anonymous@prepzify.com';

    // Clear form immediately and show success overlay as requested
    setTicketSubject('');
    setTicketMessage('');
    setSubmitted(true);

    try {
      await fetch('/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subject, message, email }),
      });
    } catch (error) {
      console.error('Failed to dispatch support ticket:', error);
    }
    
    // Automatically hide success notification after exactly 10 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 10000);
  };

  if (showDocs) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        <header className="flex justify-between items-center bg-surface-container p-8 rounded-[32px] border border-outline-variant/30">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Platform Guide</h2>
            <p className="text-on-surface-variant text-sm font-medium">Everything you need to know about our ecosystem.</p>
          </div>
          <button 
            onClick={() => setShowDocs(false)}
            className="px-6 py-3 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20"
          >
            Back to Ticket
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Overview */}
          <section className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/20 space-y-6">
            <div className="flex items-center gap-3 text-indigo-400">
              <Zap size={24} />
              <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">System Overview</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
              Our platform is an AI-native interview prep engine designed specifically for engineering students. We bridge the gap between academic theory and industry expectations using real-time feedback loops and adaptive learning roadmaps.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-black">1</div>
                <div className="text-xs font-medium text-on-surface-variant">Step 1: Choose your domain in Study Paths.</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-black">2</div>
                <div className="text-xs font-medium text-on-surface-variant">Step 2: Solve technical challenges in Practice Arena.</div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-black">3</div>
                <div className="text-xs font-medium text-on-surface-variant">Step 3: Simulate real pressure in AI Interviews.</div>
              </div>
            </div>
          </section>

          {/* Section 2: Premium Benefits */}
          <section className="bg-indigo-600 p-8 rounded-3xl text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-3">
              <ShieldCheck size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight">Premium Benefits</h3>
            </div>
            <ul className="space-y-4 relative z-10">
              {[
                "Unlimited AI Mock Sessions",
                "Full Access to Expert Course Library",
                "In-depth Behavioral & Body Language Analysis",
                "Advanced Resume Keywords Optimization",
                "Priority Support (2h Response Time)",
                "Custom Study Path Generation"
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-xs font-bold opacity-90">
                  <div className="h-1.5 w-1.5 bg-white rounded-full shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Feature Breadown */}
        <div className="space-y-6">
           <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-[0.2em] px-2">Feature Breakdown</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Interview AI', icon: <PlayCircle size={18}/>, desc: 'Voice-enabled AI simulations that mimic specialized industry interviewers.' },
                { title: 'Practice Arena', icon: <BookOpen size={18}/>, desc: 'Ranked coding challenges spanning DS, Algos, and System Design.' },
                { title: 'Expert Courses', icon: <Info size={18}/>, desc: 'Curated engineering content from top institutions like MIT and Stanford.' },
                { title: 'Resume IQ', icon: <UserCheck size={18}/>, desc: 'Instant scoring and suggestions to bypass ATS filters effortlessly.' }
              ].map((f, i) => (
                <div key={i} className="bg-surface-container p-6 rounded-2xl border border-outline-variant/30 space-y-3">
                   <div className="text-indigo-400">{f.icon}</div>
                   <h4 className="text-xs font-black text-on-surface uppercase tracking-wider">{f.title}</h4>
                   <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Contact/Support Footer */}
        <footer className="text-center py-10 border-t border-outline-variant/30">
           <p className="text-xs font-bold text-on-surface-variant mb-4">Still have questions? Our technical team is standing by.</p>
           <button 
             onClick={() => setShowDocs(false)}
             className="text-indigo-400 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2 mx-auto"
           >
             <MessageSquare size={14} /> Open Support Ticket
           </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 lg:space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
        <div className="max-w-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Support Center</h2>
          <p className="text-on-surface-variant mt-2 text-sm md:text-base">Get help with your interview sessions, technical path issues, or account billing.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 md:mt-10 max-w-3xl">
            <div 
              onClick={() => setShowDocs(true)}
              className="p-6 bg-surface-container border border-outline-variant rounded-xl hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl -translate-y-6 translate-x-6" />
              <div>
                <span className="material-symbols-outlined text-primary mb-3 text-3xl group-hover:scale-110 transition-transform">book</span>
                <h4 className="font-bold text-sm text-on-surface">Documentation</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Full guide on our AI assessment logic.</p>
              </div>
            </div>

            <div 
              onClick={() => {
                setDiscordToast(true);
                setTimeout(() => setDiscordToast(false), 5000);
              }}
              className="p-6 bg-surface-container border border-outline-variant rounded-xl hover:border-[#5865F2]/40 hover:shadow-xl hover:shadow-[#5865F2]/5 transition-all cursor-pointer group flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#5865F2]/5 rounded-full blur-xl -translate-y-6 translate-x-6" />
              <div>
                <div className="flex justify-between items-start">
                  <svg className="w-8 h-8 text-[#5865F2] mb-3 group-hover:scale-110 transition-transform" viewBox="0 0 127.14 96.36" fill="currentColor">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.8,6.83,77.19,77.19,0,0,0,49.5,0,105.15,105.15,0,0,0,19.06,8.07C-3.41,41.51-1.86,74.36,10.26,96c14.92,10.94,29.39,17.6,43.65,22a81.93,81.93,0,0,0,9.25-15.07,67.6,67.6,0,0,1-14.56-7c1.23-.9,2.42-1.85,3.57-2.84,28.59,13.18,59.6,13.18,87.82,0,1.15,1,2.34,1.94,3.57,2.84a67.75,67.75,0,0,1-14.56,7,81.93,81.93,0,0,0,9.25,15.07c14.26-4.37,28.73-11,43.65-22C129.23,74.36,130.64,41.51,107.7,8.07ZM42.45,65.69C33.82,65.69,26.7,57.85,26.7,48.2s7.12-17.49,15.75-17.49,15.82,7.91,15.75,17.49C58.2,57.85,51.15,65.69,42.45,65.69Zm42.24,0C76,65.69,68.91,57.85,68.91,48.2s7.12-17.49,15.75-17.49,15.82,7.91,15.75,17.49C100.41,57.85,93.36,65.69,84.69,65.69Z" />
                  </svg>
                  <span className="text-[8px] bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">Soon</span>
                </div>
                <h4 className="font-bold text-sm text-on-surface">Discord Server</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Join the elite architect Discord space.</p>
              </div>
            </div>

            <a 
              href="https://t.me/prepzify" 
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-surface-container border border-outline-variant rounded-xl hover:border-[#24A1DE]/40 hover:shadow-xl hover:shadow-[#24A1DE]/5 transition-all cursor-pointer group block flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#24A1DE]/5 rounded-full blur-xl -translate-y-6 translate-x-6" />
              <div>
                <div className="flex justify-between items-start">
                  <svg className="w-8 h-8 text-[#24A1DE] mb-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-1.07 4.28-1.55 6.86-.2.18-.38.22-.52.22-.3 0-.52-.18-.76-.34-.37-.25-.58-.4-.94-.64-.42-.27-.83-.42-1.25-.42-.32 0-.64.06-.94.19-.24.1-.7.29-1.32.55-.47.2-.82.3-.98.3-.26 0-.48-.15-.55-.38-.07-.22-.05-.48.06-.72.07-.15.48-1.63.92-3.18.3-.98.54-1.8.64-2.14.07-.25.18-.46.33-.61.15-.15.35-.23.6-.23h.02c.3 0 .58.12.8.3.2.16.32.4.34.66.02.26-.06.76-.17,1.25-.13.56-.25.99-.25.99s-.04.18.06.27c.1.09.28.03.28.03s.98-.63 1.58-.99c.56-.34.9-.53.94-.53.12 0 .2.08.18.2z"/>
                  </svg>
                  <span className="text-[8px] bg-[#24A1DE]/10 text-[#24A1DE] border border-[#24A1DE]/20 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1 h-1 bg-[#24A1DE] rounded-full animate-pulse" /> Active
                  </span>
                </div>
                <h4 className="font-bold text-sm text-on-surface">Telegram Channel</h4>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Join our active Telegram channel at t.me/prepzify.</p>
              </div>
            </a>
          </div>

          <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mt-10 mb-4 px-1">Legal, Goals & Walkthrough</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
            {/* Terms and Conditions */}
            <Link 
              to="/terms"
              className="p-5 bg-surface-container border border-outline-variant rounded-xl hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between min-h-[140px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-lg -translate-y-4 translate-x-4" />
              <div>
                <span className="material-symbols-outlined text-primary mb-2 text-2xl group-hover:scale-110 transition-transform">gavel</span>
                <h4 className="font-bold text-xs text-on-surface">Terms of Use</h4>
                <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">Platform regulations.</p>
              </div>
            </Link>

            {/* Privacy Policy */}
            <Link 
              to="/privacy"
              className="p-5 bg-surface-container border border-outline-variant rounded-xl hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between min-h-[140px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-lg -translate-y-4 translate-x-4" />
              <div>
                <span className="material-symbols-outlined text-primary mb-2 text-2xl group-hover:scale-110 transition-transform">lock</span>
                <h4 className="font-bold text-xs text-on-surface">Privacy Policy</h4>
                <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">DPDP Act compliant framework.</p>
              </div>
            </Link>

            {/* Refund Policy */}
            <Link 
              to="/refund"
              className="p-5 bg-surface-container border border-outline-variant rounded-xl hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between min-h-[140px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-lg -translate-y-4 translate-x-4" />
              <div>
                <span className="material-symbols-outlined text-primary mb-2 text-2xl group-hover:scale-110 transition-transform">payments</span>
                <h4 className="font-bold text-xs text-on-surface">Refund Policy</h4>
                <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">Cancellation covenants.</p>
              </div>
            </Link>

            {/* Company Goals */}
            <div 
              onClick={() => setShowGoals(true)}
              className="p-5 bg-surface-container border border-outline-variant rounded-xl hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between min-h-[140px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-lg -translate-y-4 translate-x-4" />
              <div>
                <span className="material-symbols-outlined text-primary mb-2 text-2xl group-hover:scale-110 transition-transform">track_changes</span>
                <h4 className="font-bold text-xs text-on-surface">Company Goals</h4>
                <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">Primary mission boards.</p>
              </div>
            </div>

            {/* Website Walkthrough */}
            <div 
              onClick={() => setShowWalkthrough(true)}
              className="p-5 bg-surface-container border border-outline-variant rounded-xl hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between min-h-[140px] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-lg -translate-y-4 translate-x-4" />
              <div>
                <span className="material-symbols-outlined text-primary mb-2 text-2xl group-hover:scale-110 transition-transform">explore</span>
                <h4 className="font-bold text-xs text-on-surface">Walkthrough</h4>
                <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">Interactive platform guide.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-surface-container border border-outline-variant rounded-2xl p-6 md:p-8 custom-glow">
          {submitted ? (
            <div className="text-center py-10 space-y-4 animate-in fade-in duration-300">
              <div className="h-16 w-16 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Ticket Dispatched!</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Your support request has been dispatched to <span className="font-bold text-primary">prepzify@gmail.com</span>. Our technical team will review it and respond within 12 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/30 pb-4">Open Support Ticket</h3>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Subject</label>
                <select 
                  required
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary outline-none appearance-none"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                >
                  <option value="">Select category...</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing & Subscription</option>
                  <option value="feedback">Feature Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Message</label>
                <textarea 
                  required
                  rows={5}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary outline-none resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-primary text-on-primary py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Dispatch Ticket
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="pt-10 lg:pt-20">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-6 text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[
            { q: "Is the AI interview realistic?", a: "Yes, we use advanced RAG over real FAANG interview transcripts to provide realistic behavior and edge-case questions." },
            { q: "Can I use my own code editor?", a: "We provide an integrated IDE, but you can paste code from external editors easily. We support auto-sync for most common formats." },
            { q: "How is the rank calculated?", a: "Rank is a weighted combination of problems solved, interview scores, and consistency (streak)." },
            { q: "Is there a student discount?", a: "Students with a valid .edu email get 50% off the Pro Tier yearly subscription." }
          ].map((faq, i) => (
            <div key={i} className="p-6 border border-outline-variant rounded-xl hover:bg-surface-container-high transition-colors">
              <h4 className="font-bold text-on-surface text-sm">{faq.q}</h4>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {discordToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-surface-container/90 backdrop-blur-md border border-[#5865F2]/30 p-4 rounded-2xl shadow-2xl flex items-start gap-4 custom-glow"
          >
            <div className="h-10 w-10 rounded-xl bg-[#5865F2]/10 flex items-center justify-center text-[#5865F2] shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 127.14 96.36" fill="currentColor">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.8,6.83,77.19,77.19,0,0,0,49.5,0,105.15,105.15,0,0,0,19.06,8.07C-3.41,41.51-1.86,74.36,10.26,96c14.92,10.94,29.39,17.6,43.65,22a81.93,81.93,0,0,0,9.25-15.07,67.6,67.6,0,0,1-14.56-7c1.23-.9,2.42-1.85,3.57-2.84,28.59,13.18,59.6,13.18,87.82,0,1.15,1,2.34,1.94,3.57,2.84a67.75,67.75,0,0,1-14.56,7,81.93,81.93,0,0,0,9.25,15.07c14.26-4.37,28.73-11,43.65-22C129.23,74.36,130.64,41.51,107.7,8.07ZM42.45,65.69C33.82,65.69,26.7,57.85,26.7,48.2s7.12-17.49,15.75-17.49,15.82,7.91,15.75,17.49C58.2,57.85,51.15,65.69,42.45,65.69Zm42.24,0C76,65.69,68.91,57.85,68.91,48.2s7.12-17.49,15.75-17.49,15.82,7.91,15.75,17.49C100.41,57.85,93.36,65.69,84.69,65.69Z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-on-surface">Discord Server Coming Soon!</h5>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                We're setting up the ultimate PrepZify community. Subscribe to our Telegram channel for the launch invite and exclusive member perks!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company Goals Modal */}
      <AnimatePresence>
        {showGoals && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGoals(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-surface border border-outline shadow-2xl rounded-[3rem] p-8 md:p-10 space-y-6 overflow-hidden text-on-surface"
            >
              <button 
                onClick={() => setShowGoals(false)}
                className="absolute top-6 right-6 p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
              
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest w-fit">
                  <Target size={10} /> Mission Board
                </div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">Our Platform Goals</h3>
                <p className="text-sm text-on-surface-variant">Prepzify is built to unlock institutional placement opportunities for every aspirant.</p>
              </div>

              <div className="space-y-4 pt-2 text-left">
                <div className="flex gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 h-fit">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-on-surface">Democratizing Tech Placement</h5>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">Bridging the disparity between Tier-3 institutions and Tier-1 engineering roles by standardizing placement preparedness.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 h-fit">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-on-surface">Algorithmic Career Tailoring</h5>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">Leveraging state-of-the-art LLMs (Gemini Pro) to offer real-time behavioral insights, ATS parsing, and interactive speech simulations.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0 h-fit">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-on-surface">Continuous Learning Habituation</h5>
                    <p className="text-xs text-on-surface-variant leading-relaxed mt-1">Nurturing engineering streaks, global rankings, and structured study roadmaps to build consistency in daily preparation.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Website Walkthrough Modal */}
      <AnimatePresence>
        {showWalkthrough && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWalkthrough(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-surface border border-outline shadow-2xl rounded-[3rem] p-8 md:p-10 space-y-6 overflow-hidden text-on-surface"
            >
              <button 
                onClick={() => setShowWalkthrough(false)}
                className="absolute top-6 right-6 p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>

              <div className="space-y-1 text-left">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Interactive Tour</div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">Website Walkthrough</h3>
                <p className="text-xs text-on-surface-variant">Let's walk through the core pillars of Prepzify.</p>
              </div>

              {/* Slider Content */}
              <div className="min-h-[160px] p-6 bg-surface-container-low border border-outline rounded-3xl relative overflow-hidden flex flex-col gap-4 text-left">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border shrink-0 ${walkthroughSlides[currentSlide].color}`}>
                    {(() => {
                      const IconComp = walkthroughSlides[currentSlide].icon;
                      return <IconComp size={18} />;
                    })()}
                  </div>
                  <h4 className="font-bold text-sm text-on-surface">{walkthroughSlides[currentSlide].title}</h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed flex-1">
                  {walkthroughSlides[currentSlide].desc}
                </p>
              </div>

              {/* Slider Dots */}
              <div className="flex justify-between items-center">
                <div className="flex gap-1.5">
                  {walkthroughSlides.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${currentSlide === i ? 'w-6 bg-primary' : 'w-1.5 bg-on-surface-variant/20'}`}
                    />
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    disabled={currentSlide === 0}
                    onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                    className="px-4 py-2 border border-outline rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 cursor-pointer"
                  >
                    Prev
                  </button>
                  {currentSlide < walkthroughSlides.length - 1 ? (
                    <button 
                      onClick={() => setCurrentSlide(prev => Math.min(walkthroughSlides.length - 1, prev + 1))}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                    >
                      Next
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setShowWalkthrough(false); setCurrentSlide(0); }}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
                    >
                      Got It!
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
