import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import Logo from './Logo';
import { signOut } from '../lib/firebase';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/' },
  { 
    id: 'interview_group', 
    label: 'Interview AI', 
    icon: 'psychology', 
    path: '/interview',
    children: [
      { id: 'interview', label: 'AI Simulation', icon: 'smart_toy', path: '/interview' },
      { id: 'history', label: 'Interview History', icon: 'history', path: '/interviews/history' },
      { id: 'expert', label: 'Expert Network', icon: 'support_agent', path: '/expert' },
    ]
  },
  { id: 'code', label: 'Practice Arena', icon: 'code', path: '/code' },
  { id: 'paths', label: 'Study Paths', icon: 'route', path: '/paths' },
  { id: 'resume', label: 'Resume Check', icon: 'description', path: '/resume' },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['interview_group']);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <aside 
        className={`bg-surface h-screen w-64 fixed left-0 top-0 border-r border-outline-variant flex flex-col py-6 z-50 transition-transform duration-300 transform overflow-x-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-6 mb-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo className="w-12 h-12 group-hover:scale-110 transition-transform" />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tighter leading-none">
                <span className="text-[#0056b3]">Prep</span>
                <span className="text-[#ff9800]">Zify</span>
              </h1>
              <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[#333333] mt-1.5">Empowering Preparation</p>
            </div>
          </Link>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-grow space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
          {menuItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedGroups.includes(item.id);
              const hasActiveChild = item.children.some(child => location.pathname === child.path);
              
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(item.id)}
                    className={`w-full flex items-center gap-4 py-2 px-4 transition-all mx-2 rounded-lg group ${
                      hasActiveChild && !isExpanded
                        ? 'bg-primary/5 text-primary' 
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span 
                      className="material-symbols-outlined shrink-0" 
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-1 ml-6"
                      >
                        {item.children.map((child) => {
                          const isActive = location.pathname === child.path;
                          return (
                            <Link
                              key={child.id}
                              to={child.path}
                              className={`flex items-center gap-3 py-1.5 px-4 transition-all mx-2 rounded-lg text-xs ${
                                isActive 
                                  ? 'bg-primary/10 text-primary font-bold' 
                                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                              }`}
                            >
                              <span 
                                className="material-symbols-outlined shrink-0 text-lg" 
                                style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
                              >
                                {child.icon}
                              </span>
                              <span className="truncate">{child.label}</span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-4 py-2 px-4 transition-all mx-2 rounded-lg ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span 
                  className="material-symbols-outlined shrink-0" 
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 space-y-2 pt-6">

          
          <Link to="/settings" className="flex items-center gap-4 py-2 px-4 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">
            <span className="material-symbols-outlined shrink-0">settings</span>
            <span className="truncate">Settings</span>
          </Link>
          <Link to="/support" className="flex items-center gap-4 py-2 px-4 text-on-surface-variant hover:text-on-surface transition-colors rounded-lg">
            <span className="material-symbols-outlined shrink-0">help_outline</span>
            <span className="truncate">Support</span>
          </Link>

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 py-2 px-4 text-error hover:bg-error/10 transition-colors rounded-lg mt-2"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="truncate font-bold text-xs uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>
    </AnimatePresence>
  );
}
