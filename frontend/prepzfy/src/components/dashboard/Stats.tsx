import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Target, Star, Award, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Stats() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [solvedCount, setSolvedCount] = React.useState(0);

  React.useEffect(() => {
    const updateStats = () => {
      const solved = JSON.parse(localStorage.getItem('solved_problems') || '{}');
      setSolvedCount(Object.keys(solved).length);
    };
    updateStats();
    window.addEventListener('storage', updateStats);
    return () => window.removeEventListener('storage', updateStats);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard 
        title="Problems" 
        value={solvedCount.toString()} 
        icon={<CheckCircle2 className="text-green-500" size={18} />} 
        trend={solvedCount > 0 ? `+${solvedCount} solved` : "Start coding now!"} 
        onClick={() => navigate("/coding")}
      />
      <StatCard 
        title="Interviews" 
        value="0" 
        icon={<MessageSquare className="text-blue-500" size={18} />} 
        trend="Practice Speak" 
        onClick={() => navigate("/interview")}
      />
      <StatCard 
        title="Avg. Score" 
        value={`${profile?.stats?.avgScore || 0}%`} 
        icon={<Target className="text-indigo-500" size={18} />} 
        trend="Mock Assessments" 
        onClick={() => navigate("/aptitude")}
      />
      <StatCard 
        title="Points" 
        value={(profile?.stats?.points || 0).toLocaleString()} 
        icon={<Star className="text-amber-500 fill-amber-500" size={18} />} 
        trend={`Rank #${profile?.stats?.globalRank || '?'}`} 
        onClick={() => navigate("/profile")}
      />
      <StatCard 
        title="Badges" 
        value={(profile?.stats?.badgesEarned || 0).toString()} 
        icon={<Award className="text-purple-500" size={18} />} 
        trend="Keep learning!" 
        onClick={() => navigate("/profile")}
      />
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  trend,
  onClick
}: { 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  trend: string,
  onClick?: () => void
}) {
  return (
    <Card 
      onClick={onClick}
      className={`border-none shadow-sm bg-white/50 backdrop-blur-sm ${onClick ? 'cursor-pointer hover:bg-white transition-colors' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-400 mt-1">{trend}</p>
      </CardContent>
    </Card>
  );
}
