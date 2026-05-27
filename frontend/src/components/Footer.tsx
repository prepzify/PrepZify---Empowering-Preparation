import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Target,
  Zap,
  Sparkles,
  ChevronRight,
  X,
  PlayCircle,
  BookOpen,
  UserCheck,
  Compass,
  ArrowRight
} from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
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

  return (
    <footer className="pt-20 pb-8 px-6 md:px-12 border-t border-outline-variant bg-surface-container-low/20 mt-12 w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
        <div className="space-y-6 max-w-xs">
          <div className="flex items-center gap-3">
            <Logo className="w-50" />
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
            Elevating the standard of technical placement preparation through AI-driven intelligence and adaptive skill mastery.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Platform Links</h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant font-medium">
              <li>
                <button
                  onClick={() => setShowWalkthrough(true)}
                  className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  Website Walkthrough
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowGoals(true)}
                  className="hover:text-primary transition-colors cursor-pointer text-left"
                >
                  Company Goals
                </button>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Compliance & Policy</h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant font-medium">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Use</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/refund" className="hover:text-primary transition-colors">Cancellation & Refund</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Community Support</h4>
            <ul className="space-y-2.5 text-sm text-on-surface-variant font-medium">
              <li>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-on-surface flex items-center gap-1.5 group cursor-default">
                  Discord Space
                  <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider scale-90 shrink-0">Soon</span>
                </a>
              </li>
              <li>
                <a href="https://t.me/prepzify" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Telegram Channel
                </a>
              </li>
              <li><Link to="/support" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><a href="mailto:teamprepzify@gmail.com" className="hover:text-primary transition-colors font-bold">teamprepzify@gmail.com</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-outline-variant/30 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant text-center">
        © 2026 PrepZify AI Platform. All Rights Reserved. Fully Compliant with DPDP Act, 2023.
      </div>

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
              className="relative w-full max-w-2xl bg-surface border border-outline shadow-2xl rounded-[3rem] p-8 md:p-10 space-y-6 overflow-hidden"
            >
              <button
                onClick={() => setShowGoals(false)}
                className="absolute top-6 right-6 p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest w-fit">
                  <Target size={10} /> Mission Board
                </div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">Our Platform Goals</h3>
                <p className="text-sm text-on-surface-variant">Prepzify is built to unlock institutional placement opportunities for every aspirant.</p>
              </div>

              <div className="space-y-4 pt-2">
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
              className="relative w-full max-w-xl bg-surface border border-outline shadow-2xl rounded-[3rem] p-8 md:p-10 space-y-6 overflow-hidden"
            >
              <button
                onClick={() => setShowWalkthrough(false)}
                className="absolute top-6 right-6 p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>

              <div className="space-y-1">
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Interactive Tour</div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight">Website Walkthrough</h3>
                <p className="text-xs text-on-surface-variant">Let's walk through the core pillars of Prepzify.</p>
              </div>

              {/* Slider Content */}
              <div className="min-h-[160px] p-6 bg-surface-container-low border border-outline rounded-3xl relative overflow-hidden flex flex-col gap-4">
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
    </footer>
  );
}
