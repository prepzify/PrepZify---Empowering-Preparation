import { auth, db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from './Footer';
import QuickPrepAssessment from './QuickPrepAssessment';
import { scopedStorage } from '../lib/storageUtils';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';
import { 
  Zap, X, Trophy, TrendingUp, CheckCircle, Award, 
  FileText, Briefcase, PlayCircle, BookOpen, 
  Target, BarChart3, Star, Sparkles, Brain,
  ArrowUpRight, Search, LayoutGrid,
  Filter, Info, History as HistoryIcon,
  ShieldCheck
} from 'lucide-react';
import { query, collection, orderBy, getDocs, limit } from 'firebase/firestore';
import { dbService } from '../services/dbService';

export default function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [showQuickPrep, setShowQuickPrep] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [userStats, setUserStats] = useState({
    xp: 0,
    totalSessions: 0,
    solved: 0,
    rank: 'Junior Engineer',
    nextRank: 'Senior Architect',
    progress: 0,
    globalRank: 0,
    totalUsers: 0,
    streak: 1,
    maxStreak: 1
  });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [interviewCount, setInterviewCount] = useState(0);

  const skillData = [
    { subject: 'Algorithms', A: 120, fullMark: 150 },
    { subject: 'Frontend', A: 98, fullMark: 150 },
    { subject: 'Backend', A: 86, fullMark: 150 },
    { subject: 'System Design', A: 70, fullMark: 150 },
    { subject: 'Testing', A: 85, fullMark: 150 },
    { subject: 'Soft Skills', A: 110, fullMark: 150 },
  ];

  useEffect(() => {
    if (!user) {
      // Guest fallback: dynamic streak algorithm using scopedStorage
      const savedStreak = scopedStorage.getItem('bt_streak');
      const savedMaxStreak = scopedStorage.getItem('bt_max_streak');
      const savedLastActive = scopedStorage.getItem('bt_last_active');

      let currentStreak = savedStreak ? Number(savedStreak) : 1;
      let maxStreak = savedMaxStreak ? Number(savedMaxStreak) : 1;
      const now = new Date();

      if (savedLastActive) {
        const lastActiveDate = new Date(savedLastActive);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const compareDate = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());

        if (compareDate.getTime() === yesterday.getTime()) {
          currentStreak += 1;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else if (compareDate.getTime() < yesterday.getTime()) {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
        maxStreak = Math.max(maxStreak, currentStreak);
      }

      // Save updated guest values
      scopedStorage.setItem('bt_streak', String(currentStreak));
      scopedStorage.setItem('bt_max_streak', String(maxStreak));
      scopedStorage.setItem('bt_last_active', now.toISOString());

      setUserStats(prev => ({
        ...prev,
        streak: currentStreak,
        maxStreak: maxStreak
      }));
      return;
    }

    const runStreakCheckAndStats = async () => {
      await dbService.checkAndUpdateStreak(user.uid);
    };
    runStreakCheckAndStats();

    const unsub = dbService.onStatsUpdate(user.uid, async (data: any) => {
      const xp = data.xp || 0;
      let rank = 'Junior Engineer';
      let nextRank = 'Senior Architect';
      let progress = (xp % 1000) / 10;
      
      if (xp > 5000) {
        rank = 'Elite Architect';
        nextRank = 'Diamond Sentinel';
      } else if (xp > 2000) {
        rank = 'Senior Architect';
        nextRank = 'Elite Architect';
      }

      const rankInfo = await dbService.getGlobalRanking(user.uid);

      setUserStats({
        xp,
        totalSessions: data.totalSessions || 0,
        solved: data.questionsSolved || 0,
        rank,
        nextRank,
        progress: xp > 10000 ? 100 : progress,
        globalRank: rankInfo?.rank || 0,
        totalUsers: rankInfo?.total || 0,
        streak: data.streak || 1,
        maxStreak: data.maxStreak || 1
      });
    });

    const loadLeaderboard = async () => {
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(5));
      const snap = await getDocs(q);
      setLeaderboard(snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        name: d.data().displayName || d.data().email?.split('@')[0] || 'Anonymous'
      })));
    };
    loadLeaderboard();

    const loadResume = async () => {
       const data = await dbService.getResumeAnalysis(user.uid);
       setResumeData(data);
    };
    loadResume();

    const loadInterviewCount = async () => {
       const count = await dbService.getInterviewCount(user.uid);
       setInterviewCount(count || 0);
    };
    loadInterviewCount();

    return () => unsub();
  }, [user]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleQuickPrepClick = () => {
    if (isMobile) {
      navigate('/quick-prep');
    } else {
      setShowQuickPrep(true);
    }
  };

  const readinessScore = resumeData?.feedback?.score || 65;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto pb-0 space-y-12"
      id="dashboard-root"
    >
      {/* 1. Hero Overview Section */}
      <section className="relative overflow-hidden bg-surface-container rounded-[3rem] p-10 md:p-14 border border-outline shadow-xl shadow-primary/5 flex flex-col lg:flex-row gap-12 lg:items-stretch" id="hero-overview">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex-1 flex flex-col justify-between gap-8">
           <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight leading-none">
                Welcome back, <span className="text-primary">{user?.displayName?.split(' ')[0] || 'Engineer'}</span>
              </h2>
              <p className="text-on-surface-variant font-medium">Your career pulse is looking strong. You're in the top 15% this week.</p>
           </div>

            <div className="flex flex-wrap gap-4 items-stretch">
              <button 
                onClick={() => navigate('/resume')}
                className="bg-surface-container shadow-sm px-6 py-4 rounded-2xl border border-outline flex items-center gap-4 group hover:border-primary/50 transition-all text-left cursor-pointer min-h-[88px]"
              >
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                    <Target size={24} />
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-tight">Placement Readiness</div>
                    <div className="text-xl font-black text-on-surface">{readinessScore}%</div>
                 </div>
              </button>

              <div className="bg-surface-container shadow-sm px-6 py-4 rounded-2xl border border-outline flex items-center gap-4 group hover:border-emerald-400/50 transition-all min-h-[88px]">
                 <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
                    <Zap size={24} />
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-tight">Active Streak</div>
                    <div className="text-xl font-black text-on-surface">{userStats.streak || 1} Days</div>
                    <div className="text-[10px] text-on-surface-variant font-bold mt-0.5">Max Streak: {userStats.maxStreak || 1} days</div>
                 </div>
              </div>

              <div className="bg-surface-container shadow-sm px-6 py-4 rounded-2xl border border-outline flex items-center gap-4 group hover:border-secondary/50 transition-all min-h-[88px]">
                 <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shrink-0">
                    <Award size={24} />
                 </div>
                 <div>
                    <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-tight">Global Rank</div>
                    <div className="text-xl font-black text-on-surface">#{userStats.globalRank || '--'}</div>
                 </div>
              </div>
           </div>
        </div>

        <div className="relative z-10 w-full lg:w-80 flex flex-col justify-between gap-3">
           <motion.button 
              id="start-interview-btn"
              onClick={() => navigate('/interview')}
              whileHover={{ 
                scale: 1.02,
                rotateX: 2,
                rotateY: -2,
                z: 20
              }}
              whileTap={{ scale: 0.98 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-full bg-primary text-white rounded-[2rem] p-6 flex flex-col items-center gap-2 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:shadow-[0_30px_60px_rgba(79,70,229,0.4)] group h-full justify-center relative overflow-hidden"
           >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                 <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150 animate-pulse group-hover:scale-[2] transition-transform" />
                 <PlayCircle className="w-12 h-12 text-white group-hover:scale-110 transition-transform relative z-10 drop-shadow-lg" />
              </div>
              <div className="text-center relative z-10" style={{ transform: 'translateZ(30px)' }}>
                 <div className="font-black text-xl uppercase tracking-tighter drop-shadow-md">Start AI Interview</div>
                 <div className="text-[10px] opacity-80 font-bold uppercase tracking-widest text-white/90">Technical & Behavioral</div>
              </div>
           </motion.button>
           <div className="grid grid-cols-2 gap-3 items-stretch">
              <button 
                 id="start-quick-prep-btn"
                 onClick={handleQuickPrepClick}
                 className="bg-surface-container-highest border border-outline rounded-2xl p-4 flex items-center gap-3 hover:bg-secondary/5 transition-all group min-h-[88px] text-left"
              >
                 <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shrink-0">
                    <Zap size={16} className="group-hover:animate-pulse" />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Quick Prep</span>
              </button>
              <button 
                 onClick={() => navigate('/resume')}
                 className="bg-surface-container-highest border border-outline rounded-2xl p-4 flex items-center gap-3 hover:bg-primary/5 transition-all group min-h-[88px] text-left"
              >
                 <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                    <Sparkles size={16} />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Career Scan</span>
              </button>
           </div>
        </div>

      </section>

      <div className="grid grid-cols-12 gap-8 lg:gap-12">
         {/* Left Column: 8 Cols */}
         <div className="col-span-12 lg:col-span-8 space-y-12">
            
            {/* 2. AI Career Intelligence Panel */}
            <section className="space-y-6" id="career-intelligence">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 group relative">
                    <Link to="/resume" className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2 hover:text-primary transition-colors">
                       <Brain size={16} className="text-primary" /> Career Intelligence
                    </Link>
                    <div className="relative group/info">
                       <Info size={14} className="text-on-surface-variant/40 cursor-help" />
                       <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-surface-container-highest rounded-lg text-[8px] font-bold text-on-surface uppercase tracking-tight opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-outline">
                          AI-driven analysis of your resume, identifying strengths, weaknesses, and key improvement areas for your career path.
                       </div>
                    </div>
                  </div>
                  <Link to="/resume" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Update Resume</Link>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface-container border border-outline rounded-[2.5rem] p-8 space-y-6 shadow-sm shadow-primary/5" id="ats-performance">
                     <div className="flex items-center justify-between">
                        <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">ATS Performance</div>
                        <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Excellent</span>
                     </div>
                     <div className="flex items-end gap-1">
                        <div className="text-6xl font-black text-on-surface tabular-nums">{resumeData?.feedback?.score || 65}</div>
                        <div className="text-sm font-bold text-on-surface-variant pb-2">/ 100</div>
                     </div>
                     <div className="space-y-3">
                        {(resumeData?.feedback?.strengths || ['Highly searchable keywords', 'Clear structural hierarchy']).slice(0, 2).map((s: string, idx: number) => (
                           <div key={idx} className="flex items-start gap-3 text-xs text-on-surface-variant font-medium">
                              <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                              {s}
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-[#fefefe] border border-outline rounded-[2.5rem] p-8 space-y-6 shadow-sm shadow-primary/5 dark:bg-[#0f0f12]" id="role-matchmaking">
                     <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Role Matchmaking</div>
                     <div className="space-y-1">
                        <div className="text-2xl font-black text-white">{resumeData?.recommendedRole || 'Software Engineer'}</div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest group cursor-pointer hover:translate-x-1 transition-transform">
                           Est. Salary: $85k - $120k <ArrowUpRight size={10} className="inline ml-1" />
                        </p>
                     </div>
                     <div className="pt-4 border-t border-outline">
                        <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Top Missing Skill</div>
                        <div className="flex items-center gap-3">
                           <div className="px-3 py-1 bg-surface-container border border-outline rounded-lg text-[10px] font-black text-on-surface uppercase">
                              {resumeData?.feedback?.missingSkills?.[0] || 'System Design'}
                           </div>
                           <Link to={`/study-paths?skill=${resumeData?.feedback?.missingSkills?.[0] || 'System Design'}`} className="p-2 bg-primary rounded-lg text-white">
                              <BookOpen size={14} />
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>
            </section>

            {/* 3. Smart Job Recommendation Feed */}
            <section className="space-y-6" id="job-recommendations">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 group relative">
                    <Link to="/resume" className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2 hover:text-primary transition-colors">
                       <Briefcase size={16} className="text-primary" /> Recommended for You
                    </Link>
                    <div className="relative group/info">
                       <Info size={14} className="text-on-surface-variant/40 cursor-help" />
                       <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-surface-container-highest rounded-lg text-[8px] font-bold text-on-surface uppercase tracking-tight opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-outline">
                          Personalized job matches based on your skills and resume analysis, with AI insights into why you're a good fit.
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-2 bg-surface-container rounded-lg border border-outline text-on-surface-variant"><Filter size={14} /></button>
                     <button className="p-2 bg-surface-container rounded-lg border border-outline text-on-surface-variant"><Search size={14} /></button>
                  </div>
               </div>

               <div className="space-y-4">
                  {(resumeData?.matchingJobs?.length > 0 ? resumeData.matchingJobs : [
                    { jobTitle: 'Frontend Developer', company: 'Google', location: 'Mountain View, CA', salary: '$120k+', applyLink: '#' },
                    { jobTitle: 'Fullstack Engineer', company: 'Stripe', location: 'Remote', salary: '$140k+', applyLink: '#' },
                  ]).slice(0, 3).map((job: any, idx: number) => (
                    <motion.div 
                       key={idx}
                       whileHover={{ x: 10 }}
                       className="bg-surface-container p-6 rounded-3xl border border-outline hover:border-primary/30 transition-all flex items-center gap-6 shadow-sm"
                    >
                       <div className="w-16 h-16 bg-surface-container-low border border-outline rounded-2xl flex items-center justify-center font-black text-2xl text-on-surface">
                          {job.company?.[0] || 'J'}
                       </div>
                       <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                             <h4 className="font-black text-on-surface truncate">{job.jobTitle}</h4>
                             <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase rounded shrink-0">94% Match</span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest truncate">
                             <span>{job.company}</span>
                             <span>•</span>
                             <span>{job.location || 'Remote'}</span>
                             <span>•</span>
                             <span>{job.salary || '$100k+'}</span>
                          </div>
                       </div>
                       <a 
                          href={job.applyLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-4 bg-surface-container-highest text-on-surface rounded-2xl hover:bg-primary hover:text-white transition-all shrink-0"
                          onClick={() => {
                             if (user) dbService.incrementStats(user.uid, 50);
                          }}
                       >
                          <ArrowUpRight size={20} />
                       </a>
                    </motion.div>
                  ))}
               </div>
            </section>

            {/* 4. AI Interview Center (Condensed Items) */}
            <section className="space-y-6" id="interview-center">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 group relative">
                    <Link to="/interview" className="text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant flex items-center gap-2 hover:text-indigo-400 transition-colors">
                       <PlayCircle size={16} className="text-indigo-400" /> AI Interview Simulation
                    </Link>
                    <div className="relative group/info">
                      <Info size={14} className="text-on-surface-variant/40 cursor-help" />
                      <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-surface-container-highest rounded-lg text-[8px] font-bold text-on-surface uppercase tracking-tight opacity-0 group-hover/info:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl border border-outline-variant">
                         Practice real-world interview scenarios with our AI, covering technical questions, behavioral rounds, and system design.
                      </div>
                    </div>
                  </div>
                  <Link to="/interviews/history" className="text-[10px] font-black text-indigo-400 hover:underline uppercase tracking-widest flex items-center gap-2">
                    <HistoryIcon size={14} /> Full History
                  </Link>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Technical Round', icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                    { label: 'HR Behavioral', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'System Design', icon: LayoutGrid, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Mock Code', icon: FileText, color: 'text-rose-400', bg: 'bg-rose-400/10' },
                  ].map((item, idx) => (
                    <button 
                       key={idx} 
                       onClick={() => navigate('/interview')}
                       className="bg-surface-container p-6 rounded-3xl border border-outline-variant hover:scale-105 active:scale-95 transition-all text-center space-y-3"
                    >
                       <div className={`${item.bg} ${item.color} w-10 h-10 rounded-xl flex items-center justify-center mx-auto`}>
                          <item.icon size={20} />
                       </div>
                       <div className="text-[10px] font-black text-on-surface uppercase tracking-widest">{item.label}</div>
                    </button>
                  ))}
               </div>
            </section>
         </div>

         {/* Right Column: 4 Cols */}
         <div className="col-span-12 lg:col-span-4 space-y-12">
            
            {/* 5. Live Progress Tracking */}
            <section className="bg-surface-container p-8 rounded-[2.5rem] border border-outline-variant space-y-8" id="progress-tracking">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Skill Evolution</h4>
                  <BarChart3 size={16} className="text-indigo-400" />
               </div>
               
               <div className="space-y-6">
                  <div className="h-[200px] w-full min-w-0 min-h-[200px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                           <PolarGrid stroke="#ffffff10" />
                           <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff40', fontSize: 8, fontWeight: 'bold' }} />
                           <Radar
                              name="Skills"
                              dataKey="A"
                              stroke="#6366f1"
                              fill="#6366f1"
                              fillOpacity={0.6}
                           />
                        </RadarChart>
                     </ResponsiveContainer>
                  </div>

                  <div className="flex justify-between items-end">
                     <div>
                        <div className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Rank: {userStats.rank}</div>
                        <div className="text-3xl font-black text-on-surface tabular-nums">{userStats.xp.toLocaleString()} <span className="text-xs text-indigo-400 font-black">XP</span></div>
                     </div>
                     <span className="text-[10px] font-black text-on-surface-variant uppercase">Lv. {Math.floor(userStats.xp / 1000) + 1}</span>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest opacity-60">
                           <span>{userStats.rank}</span>
                           <span>{userStats.nextRank}</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${userStats.progress}%` }}
                              className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                           />
                        </div>
                     </div>
                     <p className="text-[9px] font-bold text-on-surface-variant uppercase text-center">{Math.max(0, 1000 - (userStats.xp % 1000))}XP to Next Level</p>
                  </div>
               </div>

               <div className="pt-6 border-t border-outline-variant/30 grid grid-cols-2 gap-4">
                  <div className="text-center">
                     <div className="text-xl font-black text-on-surface">{userStats.solved}</div>
                     <div className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">Challenges</div>
                  </div>
                  <button 
                    onClick={() => navigate('/interviews/history')}
                    className="text-center border-l border-outline-variant/30 hover:bg-white/5 transition-colors rounded-xl p-1"
                  >
                     <div className="text-xl font-black text-on-surface">{interviewCount}</div>
                     <div className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">Mock Tests</div>
                  </button>
               </div>
            </section>

            {/* 11. Community Leaderboard */}
            <section className="bg-surface-container-low border border-outline rounded-[2.5rem] overflow-hidden shadow-sm shadow-primary/5 dark:bg-[#0b0b0d] dark:border-white/5" id="leaderboard">
               <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Global Rankings</h4>
                  </div>
                  
                  <div className="space-y-3">
                     {leaderboard.map((u, i) => (
                       <div key={u.id} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${u.id === user?.uid ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container hover:bg-surface-container-high border border-outline'}`}>
                          <div className="flex items-center gap-2">
                             <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] ${u.id === user?.uid ? 'bg-white text-primary' : 'bg-primary/20 text-primary'}`}>
                                {i + 1}
                             </div>
                             <div className="min-w-0">
                                <div className="text-[10px] font-black truncate max-w-[80px]">{u.name || 'Anonymous'}</div>
                                <div className={`text-[8px] font-bold uppercase tracking-widest opacity-60`}>Level {Math.floor((u.xp || 0) / 1000) + 1}</div>
                             </div>
                          </div>
                          <div className="text-[10px] font-black tabular-nums">{((u.xp || 0) / 1000).toFixed(1)}k <span className="opacity-60">XP</span></div>
                       </div>
                     ))}
                  </div>
               </div>
            </section>

         </div>
      </div>

      {/* Horizontally longer sections outside the grid */}
      <div className="space-y-12">
        {/* 11. Premium Benefits Section - Full Width */}
        <section className="bg-gradient-to-br from-secondary to-orange-600 rounded-[3rem] p-10 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-secondary/20 w-full" id="premium-benefits">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-8 flex-1 w-full">
              <div className="flex items-center gap-6">
                <div className="p-5 bg-white/20 rounded-[2rem] shadow-xl">
                  <Sparkles size={40} className="text-white" />
                </div>
                <div>
                  <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">Premium Benefits</h3>
                  <p className="text-white/80 font-bold text-sm uppercase tracking-widest mt-3">Elevate your career to the elite tier with dedicated AI guidance</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  { icon: <Zap size={20} />, text: 'Unlimited AI Mock Sessions', desc: 'No daily practice caps' },
                  { icon: <BookOpen size={20} />, text: 'Full Expert Library', desc: '500+ premium resources' },
                  { icon: <ShieldCheck size={20} />, text: 'Deep Behavioral Analytics', desc: 'Smarter feedback patterns' }
                ].map((b, i) => (
                  <div key={i} className="flex flex-col gap-3 p-6 bg-white/10 rounded-[2rem] border border-white/10 shadow-lg backdrop-blur-sm">
                    <div className="text-white/70">{b.icon}</div>
                    <div>
                      <div className="text-base font-black tracking-tight">{b.text}</div>
                      <div className="text-xs font-medium text-white/50 mt-1">{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-auto shrink-0">
              <button 
                onClick={() => navigate('/landing#pricing')}
                className="px-16 py-7 bg-white text-secondary rounded-[2.5rem] font-black text-base uppercase tracking-[0.2em] hover:scale-[1.03] active:scale-[0.98] transition-all shadow-2xl shadow-black/20"
              >
                View All Plans
              </button>
            </div>
          </div>
        </section>

        {/* 9. AI Insights & Trends - Wider Layout */}
        <section className="bg-surface-container border border-primary/20 rounded-[3rem] p-10 md:p-20 space-y-12 shadow-xl shadow-primary/5 w-full" id="ai-insights">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-xl md:text-2xl font-black text-primary uppercase tracking-tighter leading-none">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <Sparkles size={28} />
              </div>
              Live AI Insights & Market Intelligence
            </div>
            <div className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-60">Global Trends Sync: Real-time</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-8 bg-surface-container-low rounded-[2.5rem] border border-outline space-y-4 hover:border-primary/40 transition-colors group">
              <div className="flex items-center gap-3 text-xs font-black text-primary uppercase tracking-widest">
                <TrendingUp size={16} /> Market Alert
              </div>
              <p className="text-sm font-medium leading-relaxed text-on-surface-variant">
                React + TypeScript jobs up <span className="text-emerald-500 font-black">14%</span> this week. Companies like Google and Uber are increasing demand for TS expertise.
              </p>
            </div>
            <div className="p-8 bg-surface-container-low rounded-[2.5rem] border border-outline space-y-4 hover:border-secondary/40 transition-colors group">
              <div className="flex items-center gap-3 text-xs font-black text-secondary uppercase tracking-widest">
                <Brain size={16} /> Performance Persona
              </div>
              <p className="text-sm font-medium leading-relaxed text-on-surface-variant">
                You perform better in technical interviews than HR rounds. Recommendation: Practice <span className="text-secondary font-black">Storytelling</span> using the STAR method.
              </p>
            </div>
            <div className="p-8 bg-surface-container-low rounded-[2.5rem] border border-outline space-y-4 hover:border-amber-500/40 transition-colors group">
              <div className="flex items-center gap-3 text-xs font-black text-amber-500 uppercase tracking-widest">
                <Target size={16} /> Optimized Path
              </div>
              <p className="text-sm font-medium leading-relaxed text-on-surface-variant">
                Your System Design score is currently your bottleneck. <span className="text-amber-500 font-black">20 min</span> of daily focused study on Scalability would yield +15% success.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Prep Modal */}
      <AnimatePresence>
        {showQuickPrep && !isMobile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickPrep(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl bg-surface border border-outline-variant shadow-2xl rounded-[2.5rem] overflow-hidden"
            >
              <div className="absolute top-6 right-6 z-10">
                <button 
                  onClick={() => setShowQuickPrep(false)}
                  className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-on-surface-variant" />
                </button>
              </div>
              <QuickPrepAssessment isModal onClose={() => setShowQuickPrep(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </motion.div>
  );
}
