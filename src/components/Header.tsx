import { auth } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, isSidebarOpen }: HeaderProps) {
  const user = auth.currentUser;
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`fixed top-0 right-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-4 md:px-6 transition-all duration-300 left-0 ${isSidebarOpen ? 'lg:left-64' : 'left-0'}`}>
      <div className="flex items-center gap-4 md:gap-10">
        <button 
          onClick={onMenuClick}
          className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <nav className="hidden md:flex gap-6 font-bold text-[11px] uppercase tracking-widest text-on-surface-variant">
          <Link to="/support" className="hover:text-primary transition-colors">Docs</Link>
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:block">
          <GlobalSearch />
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all active:scale-90"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <Link to="/settings" className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high transition-transform active:scale-95">
          <img 
            src={user?.photoURL || "https://lh3.googleusercontent.com/a/default-user=s96-c"} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </header>
  );
}
