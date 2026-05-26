import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchIndex, SearchItem } from '../lib/searchIndex';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim().length > 0) {
      const filtered = searchIndex.filter(item => 
        item.title.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase()) ||
        item.keywords.some(k => k.toLowerCase().includes(value.toLowerCase())) ||
        item.category.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setResults(filtered);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        handleNavigate(results[selectedIndex].path);
      } else if (results.length > 0) {
        handleNavigate(results[0].path);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative group">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-on-surface-variant">
          <Search className="w-4 h-4" />
        </span>
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search features, tools..." 
          className="bg-surface-container-low border border-outline-variant rounded-full pl-10 pr-10 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full transition-all"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div 
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface shadow-2xl rounded-2xl border border-outline-variant overflow-hidden z-[100]"
          >
            <div className="p-2">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Quick Results
              </div>
              {results.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-colors ${
                    selectedIndex === index ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant border border-outline-variant">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-on-surface-variant truncate mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm opacity-50">arrow_forward</span>
                </button>
              ))}
            </div>
            
            <div className="bg-surface-container-low p-3 border-t border-outline-variant flex justify-between items-center bg-opacity-50">
              <span className="text-[10px] text-on-surface-variant">
                Tip: Press <kbd className="font-sans px-1 py-0.5 rounded border border-outline-variant bg-surface text-[9px]">Enter</kbd> to select
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
