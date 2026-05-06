import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiHome, FiFileText, FiEdit3, FiBookOpen, FiUsers, FiMessageCircle, FiBriefcase, FiLogOut } from 'react-icons/fi';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/resume', label: 'Resume', icon: FiFileText },
  { path: '/test', label: 'Mock Test', icon: FiEdit3 },
  { path: '/study-plan', label: 'Study Plan', icon: FiBookOpen },
  { path: '/interview', label: 'Interview', icon: FiUsers },
  { path: '/companies', label: 'Companies', icon: FiBriefcase },
  { path: '/chat', label: 'AI Chat', icon: FiMessageCircle },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-surface-light border-r border-border z-40">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center justify-center no-underline">
            <img src="/logo.png" alt="PrepZify Logo" className="h-12 object-contain" />
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all duration-200
                  ${isActive
                    ? 'bg-primary/15 text-primary-light border border-primary/20'
                    : 'text-text-secondary hover:bg-surface-lighter/50 hover:text-text-primary border border-transparent'
                  }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-text-muted truncate">{user?.email || ''}</p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-surface-lighter text-text-muted hover:text-danger transition-colors" title="Logout">
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface-light/90 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center no-underline">
          <img src="/logo.png" alt="PrepZify Logo" className="h-8 object-contain" />
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-surface-lighter text-text-primary">
          {mobileOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <nav className="absolute right-0 top-16 w-72 h-[calc(100vh-4rem)] bg-surface-light border-l border-border p-4 space-y-1 overflow-y-auto animate-fade-in">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all
                    ${isActive ? 'bg-primary/15 text-primary-light' : 'text-text-secondary hover:bg-surface-lighter/50'}`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 w-full transition-all">
              <FiLogOut className="w-5 h-5" />
              Logout
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
