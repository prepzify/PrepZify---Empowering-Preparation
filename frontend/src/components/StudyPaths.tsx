import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { generateStudyPath, StudyPath } from '../services/studyPathService';
import { dbService } from '../services/dbService';
import { getCookie } from '../lib/cookieUtils';
import { scopedStorage } from '../lib/storageUtils';
import { auth } from '../lib/firebase';
import { useSubscription } from '../context/SubscriptionContext';
import { 
  BookOpen, 
  Clock, 
  BarChart, 
  ExternalLink, 
  PlayCircle, 
  FileText, 
  Compass,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Loader2
} from 'lucide-react';

export default function StudyPaths() {
  const [searchParams] = useSearchParams();
  const querySkill = searchParams.get('skill');
  
  const [skill, setSkill] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [path, setPath] = useState<StudyPath | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const [activeTab, setActiveTab] = useState<'roadmaps' | 'courses'>('roadmaps');
  const [courseCategory, setCourseCategory] = useState('All');
  const { isPro, triggerUpgrade } = useSubscription();

  const targetComp = scopedStorage.getItem("pz_target_company");
  const targetRl = scopedStorage.getItem("pz_target_role");
  const [showSuggestion, setShowSuggestion] = useState(() => !!(targetComp && targetRl));

  const EXPERT_COURSES = [
    // Computer Science
    { id: 'cse1', title: 'Data Structures & Algorithms', category: 'Computer Science', provider: 'LeetCode Academy', link: '#', isFree: true, level: 'Beginner' },
    { id: 'cse2', title: 'System Design Interview', category: 'Computer Science', provider: 'DesignGurus', link: '#', isFree: true, level: 'Intermediate' },
    { id: 'cse3', title: 'Advanced Operating Systems', category: 'Computer Science', provider: 'Georgia Tech', link: '#', isFree: true, level: 'Advanced' },
    { id: 'cse4', title: 'Full Stack Web Dev', category: 'Computer Science', provider: 'Udemy', link: '#', isFree: false, level: 'Intermediate' },
    
    // AI & DS
    { id: 'ai1', title: 'Machine Learning Specialization', category: 'AI & Data Science', provider: 'DeepLearning.AI', link: '#', isFree: true, level: 'Intermediate' },
    { id: 'ai2', title: 'Generative AI Fundamentals', category: 'AI & Data Science', provider: 'Google Cloud', link: '#', isFree: true, level: 'Beginner' },
    { id: 'ai3', title: 'Neural Networks & Deep Learning', category: 'AI & Data Science', provider: 'Coursera', link: '#', isFree: true, level: 'Advanced' },
    { id: 'ai4', title: 'AI for Business', category: 'AI & Data Science', provider: 'Wharton Online', link: '#', isFree: false, level: 'Beginner' },

    // ECE
    { id: 'ece1', title: 'Digital Signal Processing', category: 'ECE', provider: 'NPTEL', link: '#', isFree: true, level: 'Beginner' },
    { id: 'ece2', title: 'Embedded Systems', category: 'ECE', provider: 'EdX', link: '#', isFree: true, level: 'Intermediate' },
    { id: 'ece3', title: 'VLSI Design', category: 'ECE', provider: 'Intel Academy', link: '#', isFree: true, level: 'Advanced' },
    { id: 'ece4', title: '5G Communication Systems', category: 'ECE', provider: 'Qualified Experts', link: '#', isFree: false, level: 'Advanced' },

    // Mechanical
    { id: 'mech1', title: 'Thermodynamics', category: 'Mechanical', provider: 'Khan Academy', link: '#', isFree: true, level: 'Beginner' },
    { id: 'mech2', title: 'Fluid Mechanics', category: 'Mechanical', provider: 'MIT OCW', link: '#', isFree: true, level: 'Intermediate' },
    { id: 'mech3', title: 'Control Systems', category: 'Mechanical', provider: 'Stanford Engineering', link: '#', isFree: true, level: 'Advanced' },
    { id: 'mech4', title: 'Robotics Engineering', category: 'Mechanical', provider: 'Boston Dynamics', link: '#', isFree: false, level: 'Advanced' },

    // Civil
    { id: 'civ1', title: 'Structural Analysis', category: 'Civil', provider: 'Civil Simplified', link: '#', isFree: true, level: 'Beginner' },
    { id: 'civ2', title: 'Geotechnical Engineering', category: 'Civil', provider: 'ICE', link: '#', isFree: true, level: 'Intermediate' },
    { id: 'civ3', title: 'Surveying Theory', category: 'Civil', provider: 'Trimble Academy', link: '#', isFree: true, level: 'Advanced' },
    { id: 'civ4', title: 'Sustainable Smart Cities', category: 'Civil', provider: 'Global Academy', link: '#', isFree: false, level: 'Intermediate' },
  ];

  const categories = ['All', ...Array.from(new Set(EXPERT_COURSES.map(c => c.category)))];
  const filteredCourses = courseCategory === 'All' 
    ? EXPERT_COURSES 
    : EXPERT_COURSES.filter(c => c.category === courseCategory);

  // Load from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (user) {
        setIsGenerating(true);
        const paths = await dbService.getStudyPaths(user.uid);
        
        if (paths && paths.length > 0) {
          const currentPath: any = paths[0]; // Get the most recent one
          setPath(currentPath);
          setSkill(currentPath.title || '');
          if (currentPath.completedTasks) {
            setCompletedTasks(new Set(currentPath.completedTasks));
          }
        }
        setIsGenerating(false);
      } else {
        // Fallback to scopedStorage for guest
        setSkill(querySkill || scopedStorage.getItem('bt_study_skill') || '');
        const savedPath = scopedStorage.getItem('bt_study_path');
        if (savedPath) setPath(JSON.parse(savedPath));
        const savedCompleted = scopedStorage.getItem('bt_study_completed');
        if (savedCompleted) setCompletedTasks(new Set(JSON.parse(savedCompleted)));
      }
    };
    loadData();
  }, []);

  // Save to Firebase/localStorage on changes
  useEffect(() => {
    const saveData = async () => {
      const user = auth.currentUser;
      if (user) {
        if (path) {
          await dbService.saveStudyPath(user.uid, {
            ...path,
            completedTasks: Array.from(completedTasks)
          });
        }
      } else {
        scopedStorage.setItem('bt_study_skill', skill);
        if (path) scopedStorage.setItem('bt_study_path', JSON.stringify(path));
        scopedStorage.setItem('bt_study_completed', JSON.stringify(Array.from(completedTasks)));
      }
    };
    
    const timeout = setTimeout(saveData, 2000);
    return () => clearTimeout(timeout);
  }, [path, completedTasks]);

  // Initial generation from query param
  useEffect(() => {
    if (querySkill && querySkill !== path?.title) {
        handleGenerate(querySkill);
    }
  }, [querySkill]);

  const handleGenerate = async (skillToSearch?: string) => {
    const targetSkill = skillToSearch || skill;
    if (!targetSkill.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateStudyPath(targetSkill);
      setPath(result);
      if (skillToSearch) setSkill(skillToSearch);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTask = async (moduleId: number, taskId: number) => {
    const id = `${moduleId}-${taskId}`;
    const newSet = new Set(completedTasks);
    const wasCompleted = newSet.has(id);
    
    if (wasCompleted) newSet.delete(id);
    else {
      newSet.add(id);
      // Increment XP for completion
      const user = auth.currentUser;
      if (user) {
        // Module completion grants 150 XP and 1 solved question
        await dbService.incrementStats(user.uid, 150, 1);
      }
    }
    setCompletedTasks(newSet);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">Learning Hub</h2>
          <p className="text-on-surface-variant max-w-md text-sm md:text-base">Targeted roadmaps and expert-led engineering courses.</p>
        </div>
        <div className="flex gap-2">
           <div className="flex bg-surface-container-high rounded-full p-1 border border-outline-variant/30">
              <button 
                onClick={() => setActiveTab('roadmaps')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'roadmaps' ? 'bg-indigo-500 text-white shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                AI Roadmaps
              </button>
              <button 
                onClick={() => setActiveTab('courses')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'courses' ? 'bg-indigo-500 text-white shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Expert Courses
              </button>
           </div>
        </div>
      </header>

      {activeTab === 'roadmaps' ? (
        <>
          {!path && !isGenerating ? (
        <div className="max-w-3xl mx-auto py-20 text-center space-y-8">
           {showSuggestion && targetComp && targetRl && (
             <div className="max-w-lg mx-auto bg-gradient-to-r from-indigo-500/15 to-purple-500/10 border border-indigo-500/20 rounded-[30px] p-6 relative overflow-hidden group shadow-xl shadow-indigo-500/5 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-[40px]" />
               <div className="relative z-10 space-y-4 text-left">
                 <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                   <Sparkles size={12} className="animate-pulse" /> Recommended Career Target
                 </div>
                 <h4 className="text-lg font-black text-on-surface leading-tight">
                   Aiming for <span className="text-indigo-400">{targetComp}</span> as a <span className="text-indigo-400">{targetRl}</span>?
                 </h4>
                 <p className="text-xs text-on-surface-variant leading-relaxed">
                   Let's generate a customized placement syllabus and step-by-step technical roadmap tailored for {targetComp}'s interview standards.
                 </p>
                 <div className="flex gap-2 pt-2">
                   <button
                     onClick={() => {
                       const skillName = `${targetComp} ${targetRl}`;
                       setSkill(skillName);
                       handleGenerate(skillName);
                       setShowSuggestion(false);
                     }}
                     className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-indigo-500/25"
                   >
                     Generate roadmap
                   </button>
                   <button
                     onClick={() => setShowSuggestion(false)}
                     className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface border border-outline-variant/30 rounded-xl transition-all cursor-pointer"
                   >
                     Try Another Skill
                   </button>
                 </div>
               </div>
             </div>
           )}
           <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto text-indigo-400">
              <Compass size={40} className="animate-pulse" />
           </div>
           <div className="space-y-4">
              <h3 className="text-2xl font-black text-on-surface tracking-tight">What do you want to master today?</h3>
              <p className="text-on-surface-variant text-sm">Enter a skill or technology to generate a custom 4-week roadmap.</p>
           </div>
           <div className="flex gap-3 max-w-lg mx-auto">
              <input 
                 type="text" 
                 value={skill}
                 onChange={(e) => setSkill(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                 placeholder="e.g. System Design, Kubernetes, React Testing..."
                 className="flex-1 bg-surface-container border border-outline-variant/30 rounded-2xl px-6 py-4 text-sm focus:border-indigo-400 outline-none transition-all font-bold"
              />
              <button 
                 onClick={() => handleGenerate()}
                 className="px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20"
              >
                 Generate
              </button>
           </div>
           <div className="flex flex-wrap justify-center gap-2 pt-4">
              {['Data Structures', 'Spring Boot', 'Cloud Computing', 'Machine Learning'].map(s => (
                <button 
                   key={s} 
                   onClick={() => {setSkill(s); handleGenerate(s);}}
                   className="px-4 py-2 bg-surface-container-high rounded-lg text-[10px] font-bold uppercase text-on-surface-variant hover:text-indigo-400 transition-colors"
                >
                   {s}
                </button>
              ))}
           </div>
        </div>
      ) : isGenerating ? (
        <div className="max-w-3xl mx-auto py-32 text-center space-y-6">
           <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-400" />
           <div className="space-y-1">
              <h3 className="text-xl font-black text-on-surface uppercase tracking-[0.2em]">Curating Intelligence</h3>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Scanning industry requirements and documentation...</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* Sidebar: Path Summary */}
           <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="sticky top-10 space-y-6">
                 <div className="bg-[#0f0f12] border border-white/5 rounded-[40px] p-8 md:p-10 relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px]" />
                    
                    <div className="relative z-10 space-y-6">
                       <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                          <Sparkles size={12} /> Personalized Roadmap
                       </div>
                       
                       <h1 className="text-3xl font-black text-white leading-tight tracking-tight">{path?.title}</h1>
                       <p className="text-xs text-white/60 leading-relaxed">{path?.description}</p>
                       
                       <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <Clock size={16} className="text-indigo-400 mb-2" />
                             <span className="text-[10px] font-black text-white/40 uppercase block mb-1">Duration</span>
                             <span className="text-xs font-black text-white">{path?.estimatedTime}</span>
                          </div>
                          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                             <BarChart size={16} className="text-indigo-400 mb-2" />
                             <span className="text-[10px] font-black text-white/40 uppercase block mb-1">Difficulty</span>
                             <span className="text-xs font-black text-white">{path?.difficulty}</span>
                          </div>
                       </div>

                        <button 
                           onClick={() => {
                             setPath(null);
                             const user = auth.currentUser;
                             if (!user) {
                               scopedStorage.removeItem('bt_study_path');
                               scopedStorage.removeItem('bt_study_completed');
                             }
                           }}
                          className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all mt-4"
                       >
                          Try Another Skill
                       </button>
                    </div>
                 </div>

                 <div className="bg-surface-container rounded-3xl p-6 border border-outline-variant/30">
                    <h4 className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest mb-4">Progress Tracker</h4>
                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <span className="text-2xl font-black text-on-surface">{Math.round((completedTasks.size / (path?.modules.length || 1)) * 100)}%</span>
                          <span className="text-[10px] font-black text-on-surface-variant uppercase">{completedTasks.size} / {path?.modules.length ?? 0} Steps</span>
                       </div>
                       <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${(completedTasks.size / (path?.modules.length || 1)) * 100}%` }}
                             className="h-full bg-indigo-500" 
                          />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Main Feed: Modules */}
           <div className="col-span-12 lg:col-span-8 space-y-8">
              {path?.modules.map((module, mIdx) => (
                <div key={mIdx} className="bg-surface-container-low border border-outline-variant/30 rounded-[40px] overflow-hidden group hover:border-indigo-500/30 transition-all">
                   <div className="px-8 md:px-10 py-8 md:py-10 space-y-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div className="space-y-2">
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded uppercase tracking-widest">Module {mIdx + 1}</span>
                               <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">• {module.estimatedHours} hrs</span>
                            </div>
                            <h2 className="text-2xl font-black text-on-surface tracking-tight">{module.title}</h2>
                         </div>
                         <button 
                            onClick={() => toggleTask(mIdx, 0)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${completedTasks.has(`${mIdx}-0`) ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-on-surface text-surface'}`}
                         >
                            {completedTasks.has(`${mIdx}-0`) ? <CheckCircle2 size={14} /> : 'Complete Module'}
                         </button>
                      </div>

                      <p className="text-sm text-on-surface-variant leading-relaxed font-medium opacity-80">{module.description}</p>

                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Curated Resources</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {module.resources.map((res, rIdx) => (
                              <a 
                                 key={rIdx} 
                                 href={res.url} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="flex items-center gap-4 p-4 bg-surface-container-high rounded-2xl border border-outline-variant/20 hover:border-indigo-400 transition-all group/res"
                              >
                                 <div className="p-3 bg-white/5 rounded-xl text-on-surface-variant group-hover/res:text-indigo-400 transition-colors">
                                    {res.type === 'video' ? <PlayCircle size={20} /> : <FileText size={20} />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-on-surface truncate">{res.title}</p>
                                    <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-tighter">{res.type}</p>
                                 </div>
                                 <ExternalLink size={14} className="opacity-0 group-hover/res:opacity-100 transition-all" />
                              </a>
                            ))}
                         </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                         {module.skillsGained.map(skill => (
                           <span key={skill} className="px-3 py-1 bg-surface-container border border-outline-variant/30 rounded-lg text-[9px] font-bold uppercase text-on-surface-variant">
                              {skill}
                           </span>
                         ))}
                      </div>
                   </div>
                </div>
              ))}

              {/* Capstone Project Section */}
              <div className="bg-indigo-600 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
                 
                 <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Capstone Intelligence</span>
                       <h2 className="text-3xl md:text-4xl font-black tracking-tight">{path?.finalProject.title}</h2>
                    </div>

                    <p className="text-sm md:text-base font-medium leading-relaxed opacity-90 max-w-2xl">{path?.finalProject.description}</p>

                    <div className="space-y-4 pt-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">Required Deliverables</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {path?.finalProject.deliverables.map((d, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                               <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                               <span className="text-xs font-bold">{d}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <button className="flex items-center gap-2 px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl">
                       Submit Project for AI Review <ArrowRight size={16} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
        </>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCourseCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${courseCategory === cat ? 'bg-indigo-500 text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {cat}
                </button>
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map(course => (
                <div key={course.id} className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 space-y-4 group hover:border-indigo-500/30 transition-all relative">
                   <div className="flex justify-between items-start">
                      <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                         <PlayCircle size={24} />
                      </div>
                      {!course.isFree && !isPro && (
                        <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider border border-amber-500/20">
                           <Lock size={10} /> Pro Only
                        </div>
                      )}
                      {course.isFree && (
                        <div className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider border border-emerald-500/20">
                           Free access
                        </div>
                      )}
                   </div>

                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{course.category}</p>
                      <h4 className="text-sm font-black text-on-surface group-hover:text-indigo-400 transition-colors line-clamp-2">{course.title}</h4>
                   </div>

                   <div className="flex items-center justify-between text-on-surface-variant">
                      <div className="flex items-center gap-1">
                         <BookOpen size={12} />
                         <span className="text-[10px] font-bold">{course.level}</span>
                      </div>
                      <span className="text-[10px] font-medium opacity-60">Curated from {course.provider}</span>
                   </div>

                   {(!course.isFree && !isPro) ? (
                     <button 
                       onClick={() => triggerUpgrade("Unlock complete access to PrepZify's premium expert-curated courses by upgrading your plan.")}
                       className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-amber-500/20 active:scale-95 transition-all"
                     >
                        Unlock Course
                     </button>
                   ) : (
                     <a 
                        href={course.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full py-3 bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all text-center block"
                     >
                        Enter Classroom <ArrowRight size={12} className="inline ml-1" />
                     </a>
                   )}
                </div>
              ))}
           </div>

           {!isPro && (
             <div className="bg-indigo-600 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 space-y-4">
                   <h3 className="text-2xl font-black tracking-tight">Unlock Expert-Curated Engineering Library</h3>
                   <p className="text-sm font-medium opacity-80 max-w-xl mx-auto">Get full access to premium courses across all engineering branches, with deep-dive technical content curated from world-class institutions.</p>
                   <div className="flex justify-center gap-4 pt-4">
                      <button 
                        onClick={() => triggerUpgrade("Unlock full access to premium engineering courses across all branches and deep-dive syllabus content.")}
                        className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-2xl"
                      >
                         Upgrade to Premium
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
