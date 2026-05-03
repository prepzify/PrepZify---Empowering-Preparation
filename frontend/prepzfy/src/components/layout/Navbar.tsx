import React from "react";
import { GraduationCap, LayoutDashboard, Code2, MessageSquare, BookOpen, User, FileText, TrendingUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const activePath = location.pathname;

  return (
    <nav className="border-b bg-white/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer h-10" onClick={() => navigate("/")}>
            <img 
              src="/input_file_0.png" 
              alt="PrepZfy Logo" 
              className="h-full w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to text if image fails to load
                (e.target as any).style.display = 'none';
                (e.target as any).nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center">
              <span className="font-black text-2xl tracking-tighter text-[#0f4c81]">Prep</span>
              <span className="font-black text-2xl tracking-tighter text-[#fb923c]">Zfy</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <NavLink 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
              active={activePath === "/"} 
              onClick={() => navigate("/")}
            />
            <NavLink 
              icon={<Code2 size={18} />} 
              label="Coding" 
              active={activePath === "/coding"} 
              onClick={() => navigate("/coding")}
            />
            <NavLink 
              icon={<MessageSquare size={18} />} 
              label="Interviews" 
              active={activePath === "/interview"} 
              onClick={() => navigate("/interview")}
            />
            <NavLink 
              icon={<FileText size={18} />} 
              label="Resume" 
              active={activePath === "/resume"} 
              onClick={() => navigate("/resume")}
            />
            <NavLink 
              icon={<TrendingUp size={18} />} 
              label="Aptitude" 
              active={activePath === "/aptitude"} 
              onClick={() => navigate("/aptitude")}
            />
            <NavLink 
              icon={<BookOpen size={18} />} 
              label="Courses" 
              active={activePath === "/courses"} 
              onClick={() => navigate("/courses")}
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/profile")}
              className={`p-2 rounded-full transition-colors ${activePath === "/profile" ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-100 text-gray-600'}`}
              title="View Profile"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ 
  icon, 
  label, 
  active = false, 
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  onClick: () => void
}) {
  return (
    <button 
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-600 ${active ? 'text-indigo-600' : 'text-gray-500'}`}
    >
      {icon}
      {label}
    </button>
  );
}
