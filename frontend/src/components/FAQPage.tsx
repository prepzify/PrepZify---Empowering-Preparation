import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, ArrowLeft, X, Sparkles, AlertCircle, BookOpen } from 'lucide-react';
import { onAuthStateChanged, auth } from '../lib/firebase';
import { FAQS, FAQItem } from '../data/faqs';
import Layout from './Layout';
import Logo from './Logo';
import Footer from './Footer';

type Category = 'All' | 'General' | 'Resume' | 'Practice' | 'Interviews' | 'Features & Support';

export default function FAQPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // FAQ State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(user ? '/' : '/landing');
    }
  };

  const categories: Category[] = ['All', 'General', 'Resume', 'Practice', 'Interviews', 'Features & Support'];

  // Filtering Logic
  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Search term highlighter
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-primary/20 text-primary font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const pageContent = (
    <div className="w-full max-w-5xl mx-auto space-y-10 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-outline-variant/40">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest w-fit">
            <BookOpen size={10} /> FAQ Database
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight uppercase leading-none">
            Help & Knowledge Base
          </h2>
          <p className="text-sm text-on-surface-variant font-medium">
            Explore {FAQS.length} curated placement readiness guidelines and platform features.
          </p>
        </div>

        {/* Dynamic Back button - visible in standalone view or Layout view */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-3 border border-outline hover:border-primary/40 hover:bg-surface-container-high/40 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer w-fit shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Go Back
        </button>
      </div>

      {/* Search and Filters Block */}
      <div className="bg-surface-container p-6 rounded-[2rem] border border-outline-variant space-y-6 shadow-xl shadow-primary/5">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search FAQs by keywords (e.g. ATS, resume, coding practice, mock)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-outline rounded-2xl pl-14 pr-12 py-4.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-surface-container-high rounded-full text-on-surface-variant transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setExpandedId(null);
                }}
                className={`px-4.5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/25 border border-primary'
                    : 'bg-surface border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = expandedId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-surface-container/60 hover:bg-surface-container-high/80 border rounded-3xl cursor-pointer select-none transition-colors duration-300 relative overflow-hidden group custom-glow ${
                    isOpen ? 'border-primary/50' : 'border-outline-variant/60'
                  }`}
                  onClick={() => toggleFaq(faq.id)}
                >
                  <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                    <div className="space-y-2">
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-surface rounded text-primary border border-outline-variant/40 w-fit block">
                        {faq.category}
                      </span>
                      <h4 className="font-bold text-on-surface text-sm md:text-base leading-tight group-hover:text-primary transition-colors">
                        {highlightText(faq.question, searchQuery)}
                      </h4>
                    </div>
                    <div className={`w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center border border-outline transition-transform duration-300 shrink-0 ${
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
                            {highlightText(faq.answer, searchQuery)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 bg-surface-container border border-outline-variant rounded-[3rem] space-y-6 max-w-xl mx-auto"
            >
              <div className="w-16 h-16 bg-error-container/10 text-error rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-on-surface text-lg">No Results Found</h4>
                <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                  We couldn't find any FAQs matching "{searchQuery}" under the category "{selectedCategory}". Try typing other keywords or clearing the filter.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-6 py-3 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Clear Active Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant animate-pulse">Syncing Knowledge...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Layout>{pageContent}</Layout>;
  }

  // Standalone public layout for guest users
  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30 flex flex-col justify-between">
      {/* Navigation */}
      <nav className="h-20 bg-background/80 backdrop-blur-md border-b border-outline-variant px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="w-50" />
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 border border-outline-variant hover:border-primary/40 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer text-on-surface"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 lg:p-16">
        {pageContent}
      </main>

      <Footer />
    </div>
  );
}
