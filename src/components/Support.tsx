import { useState } from 'react';
import { ChevronRight, ShieldCheck, Zap, Info, PlayCircle, BookOpen, UserCheck, MessageSquare } from 'lucide-react';

export default function Support() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulate API call
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 md:mt-10">
            <div 
              onClick={() => setShowDocs(true)}
              className="p-6 bg-surface-container border border-outline-variant rounded-xl hover:border-primary/40 transition-colors cursor-pointer group"
            >
                <span className="material-symbols-outlined text-primary mb-3 text-3xl group-hover:scale-110 transition-transform">book</span>
                <h4 className="font-bold text-sm">Documentation</h4>
                <p className="text-xs text-on-surface-variant mt-1">Full guide on our AI assessment logic.</p>
            </div>
            <a 
              href="#" 
              className="p-6 bg-surface-container border border-outline-variant rounded-xl hover:border-primary/40 transition-colors cursor-pointer group block"
            >
                <span className="material-symbols-outlined text-primary mb-3 text-3xl group-hover:scale-110 transition-transform">forum</span>
                <h4 className="font-bold text-sm">Community</h4>
                <p className="text-xs text-on-surface-variant mt-1">Join the elite architect Discord space.</p>
            </a>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-surface-container border border-outline-variant rounded-2xl p-6 md:p-8 custom-glow">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="h-16 w-16 bg-emerald-400/10 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Ticket Created</h3>
              <p className="text-sm text-on-surface-variant">We've received your request and will respond within 12 hours.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-6 text-primary text-[10px] font-bold uppercase tracking-widest hover:underline"
              >
                Create another ticket
              </button>
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
    </div>
  );
}
