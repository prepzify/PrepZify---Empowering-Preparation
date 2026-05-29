import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { FAQS } from '../data/faqs';

export default function FAQSection() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const featuredFaqs = FAQS.slice(0, 4);

  const toggleFaq = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="w-full space-y-10 py-10" id="faq-section">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">PrepZify Support</span>
        </div>
        <h3 className="text-3xl font-black text-on-surface tracking-tight uppercase leading-none">
          Frequently Asked Questions
        </h3>
        <p className="text-sm text-on-surface-variant max-w-xl mx-auto font-medium">
          Have questions about placement prep? We've got quick answers to get you started.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {featuredFaqs.map((faq) => {
          const isOpen = expandedId === faq.id;
          return (
            <motion.div
              key={faq.id}
              layout
              className={`bg-surface-container/60 hover:bg-surface-container-high/80 border rounded-3xl cursor-pointer select-none transition-colors duration-300 relative overflow-hidden group custom-glow ${
                isOpen ? 'border-primary/50' : 'border-outline-variant/60'
              }`}
              onClick={() => toggleFaq(faq.id)}
            >
              <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                <h4 className="font-bold text-on-surface text-sm md:text-base leading-tight group-hover:text-primary transition-colors">
                  {faq.question}
                </h4>
                <div className={`w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center border border-outline transition-transform duration-300 ${
                  isOpen ? 'rotate-180 border-primary/30 text-primary' : 'text-on-surface-variant'
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <div className="px-6 pb-6 md:px-8 md:pb-8 border-t border-outline-variant/40 pt-4">
                      <p className="text-sm text-on-surface-variant leading-relaxed font-medium">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <Link
          to="/faq"
          className="inline-flex items-center gap-3 bg-primary text-on-primary hover:brightness-110 active:scale-95 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all custom-glow shadow-xl shadow-primary/20"
        >
          Explore All 19 FAQs
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
