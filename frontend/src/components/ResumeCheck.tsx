import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeResume, extractTextFromImage, generateTailoredResume } from '../services/geminiService';
import { exportResumeAsDocx } from '../lib/docxExport';
import { findJobs, Job } from '../services/jobService';
import { dbService } from '../services/dbService';
import { auth } from '../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useSubscription } from '../context/SubscriptionContext';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  ChevronRight,
  Loader2,
  Trash2,
  Sparkles,
  Search,
  TrendingUp,
  Map,
  Briefcase,
  AlertTriangle,
  Download,
  ArrowRight
} from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// pdfjs worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface AnalysisResult {
  score: number;
  placementProbability: number;
  readinessScore: number;
  keyStrengths: string[];
  skillGaps: { skill: string; impact: "High" | "Medium" | "Low" }[];
  resumeFormatting: { score: number; suggestions: string[] };
  grammarAndCommunication: { score: number; items: string[] };
  industryRoadmap: { timeframe: string; goal: string; tasks: string[] }[];
  summary: string;
  projectRecommendations: string[];
}

export default function ResumeCheck() {
  const { checkLimit, incrementUsage, triggerUpgrade } = useSubscription();
  const [resumeText, setResumeText] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [resumeGenToast, setResumeGenToast] = useState('');
  const [feedback, setFeedback] = useState<AnalysisResult | null>(null);
  const [matchingJobs, setMatchingJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'audit' | 'jobs' | 'roadmap'>('audit');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load from Firebase on mount
  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser;
      if (user) {
        setIsAnalyzing(true);
        const data: any = await dbService.getResumeAnalysis(user.uid);
        if (data) {
          setResumeText(data.resumeText || '');
          setJobTitle(data.jobTitle || '');
          setJobDescription(data.jobDescription || '');
          setFeedback(data.feedback || null);
          setMatchingJobs(data.matchingJobs || []);
          setFileName(data.fileName || '');
        }
        setIsAnalyzing(false);
      } else {
        // Fallback to localStorage for guest
        setResumeText(localStorage.getItem('bt_resume_text') || '');
        setJobTitle(localStorage.getItem('bt_job_title') || '');
        setJobDescription(localStorage.getItem('bt_job_desc') || '');
        setFileName(localStorage.getItem('bt_file_name') || '');
        const savedFeedback = localStorage.getItem('bt_analysis_feedback');
        if (savedFeedback) setFeedback(JSON.parse(savedFeedback));
        const savedJobs = localStorage.getItem('bt_matching_jobs');
        if (savedJobs) setMatchingJobs(JSON.parse(savedJobs));
      }
      setIsInitialLoad(false);
    };
    loadData();
  }, []);

  // Save to Firebase/localStorage on changes
  useEffect(() => {
    if (isInitialLoad) return;

    const saveData = async () => {
      const user = auth.currentUser;
      const data = {
        resumeText,
        jobTitle,
        jobDescription,
        feedback,
        matchingJobs,
        fileName
      };

      if (user) {
        // Only save if there's actual data to avoid blanking out
        if (resumeText || feedback) {
          await dbService.saveResumeAnalysis(user.uid, data);
        }
      } else {
        localStorage.setItem('bt_resume_text', resumeText);
        localStorage.setItem('bt_job_title', jobTitle);
        localStorage.setItem('bt_job_desc', jobDescription);
        localStorage.setItem('bt_file_name', fileName);
        if (feedback) localStorage.setItem('bt_analysis_feedback', JSON.stringify(feedback));
        if (matchingJobs.length > 0) localStorage.setItem('bt_matching_jobs', JSON.stringify(matchingJobs));
      }
    };
    
    // Debounce save
    const timeout = setTimeout(saveData, 2000);
    return () => clearTimeout(timeout);
  }, [resumeText, jobTitle, jobDescription, feedback, matchingJobs, fileName, isInitialLoad]);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGenerateResume = async () => {
    if (!resumeText.trim() || !feedback) return;
    setIsGeneratingResume(true);
    try {
      const raw = await generateTailoredResume(resumeText, 'General', jobTitle || 'Software Engineer', jobDescription);
      const data = JSON.parse(raw.trim());
      const fname = `${data.name || 'resume'}-optimized.docx`.replace(/\s+/g, '-').toLowerCase();
      await exportResumeAsDocx(data, fname);
      setResumeGenToast('Optimized resume downloaded!');
      setTimeout(() => setResumeGenToast(''), 3500);
    } catch (e) {
      console.error('Resume generation error:', e);
      setResumeGenToast('Failed to generate resume. Try again.');
      setTimeout(() => setResumeGenToast(''), 3500);
    } finally {
      setIsGeneratingResume(false);
    }
  };

  const downloadPDF = async () => {
    if (!feedback || !reportRef.current) return;
    
    setIsAnalyzing(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#000000',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`resume-audit-${jobTitle.replace(/\s+/g, '-').toLowerCase() || 'profile'}-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyJob = async (job: Job) => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to track applied jobs.");
      return;
    }

    try {
      await dbService.applyToJob(user.uid, job);
      // Increment XP for job application
      await dbService.incrementStats(user.uid, 50); 
      // Optional: Add a visual feedback or toast
      window.open(job.applyLink, '_blank');
    } catch (error) {
      console.error("Failed to apply for job:", error);
    }
  };

  const extractTextFromPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setFileName(uploadedFile.name);
    setIsExtracting(true);
    let text = '';
    
    try {
      if (uploadedFile.type === 'application/pdf') {
        text = await extractTextFromPDF(uploadedFile);
      } else if (uploadedFile.type.startsWith('image/')) {
        text = await extractTextFromImage(uploadedFile);
      } else {
        alert("Unsupported file type. Please upload a PDF or an Image.");
        setFile(null);
        setIsExtracting(false);
        return;
      }

      setResumeText(text);
      
      // Auto-analyze if job context is already provided
      if (jobTitle.trim() && text.trim()) {
        await handleAnalyze(text);
      }
    } catch (error) {
      console.error("Extraction error:", error);
      alert("Failed to extract text from file. Please try a different file.");
      setFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAnalyze = async (textToUse?: string) => {
    const text = textToUse || resumeText;
    if (!text.trim()) return;

    const check = checkLimit('resume');
    if (!check.allowed) {
      triggerUpgrade(`You have reached your monthly limit of ${check.limit} free resume audit(s). Upgrade to a premium plan to get unlimited ATS analyses!`);
      return;
    }
    
    setIsAnalyzing(true);
    setFeedback(null);
    try {
      const responseText = await analyzeResume(text, jobTitle, jobDescription);
      const result = JSON.parse(responseText.trim());
      setFeedback(result);

      // Increment XP for analysis
      const user = auth.currentUser;
      if (user) {
        await dbService.incrementStats(user.uid, 100);
      }

      // Increment monthly usage count in Firestore
      await incrementUsage('resume');

      // Trigger job search based on extracted skills
      const topSkills = result.keyStrengths.slice(0, 5);
      const jobs = await findJobs(topSkills, jobTitle || 'Software Engineer');
      setMatchingJobs(jobs);
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">Resume Intelligence</h2>
          <p className="text-on-surface-variant max-w-md text-sm md:text-base">Tailor your profile for Elite engineering roles with deep semantic analysis.</p>
        </div>
        <div className="flex gap-2">
           <span className="bg-primary/10 text-primary text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full border border-primary/20 uppercase">Intelligence v4.2</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {!feedback ? (
          <div className="lg:col-span-12 flex flex-col items-center">
            <div className="w-full max-w-3xl space-y-8 lg:space-y-12">
              {/* Step 1: Context */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Step 1: Provide Context</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Desired Job Title (e.g. Senior Backend Engineer)"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-12 pr-4 py-4 text-sm focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Company Category (e.g. Fintech, FAANG)"
                        className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-4 text-sm focus:border-primary outline-none transition-all"
                      />
                    </div>
                 </div>
                 <textarea 
                   placeholder="Job Description (Optional but recommended for deeper tailoring...)"
                   value={jobDescription}
                   onChange={(e) => setJobDescription(e.target.value)}
                   className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-4 text-sm focus:border-primary outline-none transition-all h-24 resize-none"
                 />
              </div>

              {/* Step 2: Resume */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Step 2: Upload or Paste Resume</span>
                    {file && (
                       <button onClick={() => {setFile(null); setResumeText('');}} className="text-error/60 hover:text-error flex items-center gap-1 text-[10px] font-bold uppercase">
                          <Trash2 className="w-3 h-3" /> Clear
                       </button>
                    )}
                 </div>
                 
                 {(!file && !fileName) ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group bg-surface-container/50 border-2 border-dashed border-outline-variant/50 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      <div className="p-4 bg-surface-container-high rounded-full group-hover:scale-110 transition-transform">
                         <Upload className="w-8 h-8 text-on-surface-variant group-hover:text-primary" />
                      </div>
                      <div className="text-center space-y-1">
                         <p className="font-bold text-on-surface">Click to upload PDF or Image</p>
                         <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">or drag and drop here</p>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        hidden 
                        accept=".pdf,image/*"
                      />
                    </div>
                 ) : (
                    <div className="bg-surface-container-high border border-primary/20 rounded-2xl p-6 flex flex-col gap-4">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl">
                             <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className="font-bold text-on-surface truncate">{file?.name || fileName}</p>
                             <p className="text-[10px] text-on-surface-variant uppercase font-mono">
                                {file ? (file.size / 1024).toFixed(1) + ' KB' : 'Stored Document'} • {isExtracting ? 'Extracting Intelligence...' : 'Ready'}
                             </p>
                          </div>
                          {isExtracting ? (
                             <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          ) : (
                             <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          )}
                       </div>
                       {(isAnalyzing || isExtracting) && (
                         <div className="flex items-center gap-2 px-2">
                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                               {isExtracting ? 'Processing Document...' : 'AI analysis in progress...'}
                            </span>
                         </div>
                       )}
                    </div>
                 )}

                 {!file && (
                   <div className="relative">
                      <div className="absolute top-4 left-4 text-[10px] font-bold uppercase text-on-surface-variant/30">Manual Text Mode</div>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="...Alternatively, paste your raw resume text here"
                        className="w-full h-80 bg-surface-container/30 border border-outline-variant/30 rounded-3xl p-10 pt-14 text-sm font-mono leading-relaxed outline-none focus:border-primary/40 transition-all resize-none"
                      />
                   </div>
                 )}

                 <button 
                   onClick={() => handleAnalyze()}
                   disabled={isAnalyzing || isExtracting || !resumeText.trim()}
                   className="w-full py-6 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                   {isAnalyzing ? (
                     <>
                       <Loader2 className="w-5 h-5 animate-spin" />
                       Processing Intelligence...
                     </>
                   ) : (
                     <>
                       <Sparkles className="w-5 h-5" />
                       Generate Technical Audit
                     </>
                   )}
                 </button>
              </div>

              {/* Status/Awaiting Area (Below Button) */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-2 border-dashed border-outline-variant/30 rounded-[40px] flex flex-col items-center justify-center p-12 text-center"
              >
                 <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-on-surface-variant/20" />
                 </div>
                 <h3 className="font-bold text-on-surface text-lg mb-2">Awaiting Intelligence</h3>
                 <p className="text-xs text-on-surface-variant opacity-60">Complete the steps above to see your customized technical audit.</p>
              </motion.div>
            </div>
          </div>
        ) : (
          /* Post-Audit Focused Layout */
          <div className="lg:col-span-12 space-y-8 lg:space-y-12">
            {/* Tabs Navigation */}
            <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/30 pb-4">
              <button 
                onClick={() => setActiveTab('audit')}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-primary text-black' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <div className="flex items-center gap-2">
                   <FileText size={14} /> Technical Audit
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('jobs')}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'jobs' ? 'bg-primary text-black' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <div className="flex items-center gap-2">
                   <Briefcase size={14} /> Recommended Jobs
                   {matchingJobs.length > 0 && <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-md text-[10px]">{matchingJobs.length}</span>}
                </div>
              </button>
              <button 
                onClick={() => setActiveTab('roadmap')}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'roadmap' ? 'bg-primary text-black' : 'text-on-surface-variant hover:bg-surface-container'}`}
              >
                <div className="flex items-center gap-2">
                   <Map size={14} /> Career Roadmap
                </div>
              </button>
            </div>

            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Main Analysis Details */}
              <div className="col-span-12 lg:col-span-8">
                {activeTab === 'audit' && (
                  <div className="bg-surface-container-low border border-outline-variant/30 rounded-3xl overflow-hidden">
                    <div className="bg-surface-container-high px-8 py-4 border-b border-outline-variant/30 flex items-center justify-between">
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Technical Audit Report</span>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-tighter">AI Analysis v5.0 Live</span>
                       </div>
                    </div>
                    
                    <div className="p-4 md:p-8 space-y-8 md:space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/20 flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Industry Readiness</span>
                            <span className="text-3xl font-black text-primary">{feedback.readinessScore}%</span>
                            <div className="w-full h-1 bg-surface-container-highest rounded-full mt-2">
                               <div className="h-full bg-primary rounded-full" style={{ width: `${feedback.readinessScore}%` }} />
                            </div>
                         </div>
                         <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/20 flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Placement Prob.</span>
                            <span className="text-3xl font-black text-emerald-400">{feedback.placementProbability}%</span>
                            <div className="w-full h-1 bg-surface-container-highest rounded-full mt-2">
                               <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${feedback.placementProbability}%` }} />
                            </div>
                         </div>
                         <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/20 flex flex-col gap-1 items-center md:items-start text-center md:text-left">
                            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">ATS Compatibility</span>
                            <span className="text-3xl font-black text-indigo-400">{feedback.resumeFormatting.score}%</span>
                            <div className="w-full h-1 bg-surface-container-highest rounded-full mt-2">
                               <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${feedback.resumeFormatting.score}%` }} />
                            </div>
                         </div>
                      </div>

                      <section className="space-y-4 md:space-y-6">
                         <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#000000] bg-emerald-400/10 py-2 px-4 rounded-full w-fit border border-emerald-400/20">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strong Technical Signals
                         </h4>
                         <div className="flex flex-wrap gap-2 md:gap-3">
                            {feedback.keyStrengths.map((s, i) => (
                              <span key={i} className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-on-surface font-black">{s}</span>
                            ))}
                         </div>
                      </section>
  
                      <section className="space-y-6">
                         <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-error bg-error/10 py-2 px-4 rounded-full w-fit border border-error/20">
                            <AlertTriangle className="w-4 h-4" /> Detected Skill Gaps
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {feedback.skillGaps.map((gap, i) => (
                              <div key={i} className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 flex items-center justify-between group transition-all">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${gap.impact === 'High' ? 'bg-red-500' : gap.impact === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                                    <span className="text-xs font-bold text-on-surface tracking-tight">{gap.skill}</span>
                                 </div>
                                 <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${gap.impact === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-on-surface-variant/10 text-on-surface-variant'}`}>
                                    {gap.impact} Impact
                                 </span>
                                 <button 
                                   onClick={() => navigate(`/paths?skill=${encodeURIComponent(gap.skill)}`)}
                                   className="ml-2 p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-all"
                                   title="Generate Study Path"
                                 >
                                    <ArrowRight size={14} />
                                 </button>
                              </div>
                            ))}
                         </div>
                      </section>

                      <section className="space-y-6">
                         <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 py-2 px-4 rounded-full w-fit border border-primary/20">
                            <Sparkles className="w-4 h-4" /> Recommended Projects to Build
                         </h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {feedback.projectRecommendations.map((r, i) => (
                              <div key={i} className="flex items-center justify-between p-5 bg-surface-container-high rounded-2xl group cursor-pointer hover:border-primary/30 border border-transparent transition-all">
                                 <span className="text-xs text-on-surface font-medium pr-4 leading-relaxed">{r}</span>
                                 <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                              </div>
                            ))}
                         </div>
                      </section>
                    </div>
                  </div>
                )}

                {activeTab === 'jobs' && (
                  <div className="space-y-6">
                    {matchingJobs.length === 0 ? (
                      <div className="p-20 bg-surface-container rounded-3xl text-center flex flex-col items-center gap-4">
                         <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                         <p className="text-sm text-on-surface-variant font-bold uppercase tracking-widest">Scanning local job markets...</p>
                      </div>
                    ) : (
                      matchingJobs.map((job) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={job.id} 
                          className="bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 hover:shadow-2xl transition-all group"
                        >
                          <div className="flex-1 space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                   <h3 className="text-xl font-black text-on-surface tracking-tight group-hover:text-primary transition-colors">{job.title}</h3>
                                   <p className="text-sm font-bold text-on-surface-variant">{job.company} • {job.location}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                   <span className="text-3xl font-black text-emerald-400">{job.matchScore}%</span>
                                   <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Candidate Fit</span>
                                </div>
                             </div>
                             
                             <p className="text-xs text-on-surface-variant leading-relaxed opacity-80">{job.description}</p>
                             
                             <div className="flex flex-wrap gap-2 py-2">
                                {job.missingSkills.length > 0 ? (
                                  job.missingSkills.map(s => (
                                    <span key={s} className="px-2 py-1 bg-red-500/5 text-red-500 text-[10px] font-bold rounded-lg border border-red-500/10">Missing: {s}</span>
                                  ))
                                ) : (
                                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-lg border border-emerald-500/20">Full Skill Match</span>
                                )}
                             </div>

                             <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <p className="text-[10px] font-black uppercase text-primary mb-1">AI Recommendation</p>
                                <p className="text-xs text-on-surface font-medium leading-relaxed italic">"{job.reasoning}"</p>
                             </div>
                          </div>
                          
                          <div className="md:w-48 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-outline-variant/30 pt-6 md:pt-0 md:pl-8">
                             <div className="text-center md:text-left">
                                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest block mb-1">Est. Salary</span>
                                <span className="text-base font-black text-on-surface font-mono">{job.salary || 'Competitive'}</span>
                             </div>
                             <a 
                               href={job.applyLink} 
                               target="_blank" 
                               rel="noreferrer"
                               className="w-full py-4 bg-on-surface text-surface rounded-xl font-black text-xs uppercase tracking-widest text-center hover:bg-primary hover:text-black transition-all flex items-center justify-center gap-2"
                             >
                                Apply Now <ChevronRight size={14} />
                             </a>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'roadmap' && (
                  <div className="space-y-8">
                    {feedback.industryRoadmap.map((step, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={i} 
                        className="relative flex gap-6 md:gap-8 group"
                      >
                        <div className="hidden md:flex flex-col items-center">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black relative z-10 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                              {i + 1}
                           </div>
                           {i < feedback.industryRoadmap.length - 1 && (
                             <div className="w-0.5 h-full bg-outline-variant/30 mt-4" />
                           )}
                        </div>
                        
                        <div className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-3xl p-6 md:p-8 space-y-6 hover:border-indigo-500/30 transition-all">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                              <div className="space-y-1">
                                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{step.timeframe} Target</span>
                                 <h3 className="text-xl font-black text-on-surface tracking-tight">{step.goal}</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-indigo-500/5 text-indigo-500 text-[10px] font-black rounded-lg border border-indigo-500/10 uppercase tracking-widest">Phase {i+1}</span>
                                <button 
                                  onClick={() => navigate(`/paths?skill=${encodeURIComponent(step.goal)}`)}
                                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                                >
                                   Start Phase <ArrowRight size={12} />
                                </button>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {step.tasks.map((task, tidx) => (
                                <div key={tidx} className="flex gap-3 text-xs text-on-surface-variant font-medium leading-relaxed p-4 bg-surface-container rounded-xl border border-outline-variant/20 hover:border-indigo-500/20 transition-all">
                                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                   {task}
                                </div>
                              ))}
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar: Score and Actions */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="sticky top-10 space-y-6">
                   {/* Analysis Quality Breakdown */}
                   <div className="bg-surface-container rounded-[32px] p-8 border border-outline-variant/30 space-y-6">
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Grammar & Impact</span>
                            <span className="text-xs font-bold text-on-surface">{feedback.grammarAndCommunication.score}/100</span>
                         </div>
                         <div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full bg-[#0052d4] rounded-full" style={{ width: `${feedback.grammarAndCommunication.score}%` }} />
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                        {feedback.grammarAndCommunication.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex gap-2 text-[10px] text-on-surface-variant italic leading-relaxed">
                             <div className="w-1 h-1 rounded-full bg-on-surface-variant/30 mt-1.5 shrink-0" />
                             {item}
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* Action Buttons */}
                   <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={() => {
                           setFeedback(null);
                           setFile(null);
                           setFileName('');
                           setResumeText('');
                           setJobTitle('');
                           setJobDescription('');
                           setActiveTab('audit');
                           localStorage.removeItem('bt_resume_text');
                           localStorage.removeItem('bt_job_title');
                           localStorage.removeItem('bt_job_desc');
                           localStorage.removeItem('bt_file_name');
                           localStorage.removeItem('bt_analysis_feedback');
                           localStorage.removeItem('bt_matching_jobs');
                           
                           const user = auth.currentUser;
                           if (user) {
                              dbService.saveResumeAnalysis(user.uid, {
                                resumeText: '',
                                jobTitle: '',
                                jobDescription: '',
                                feedback: null,
                                matchingJobs: []
                              });
                           }
                        }}
                        className="group flex items-center justify-center gap-3 w-full py-5 bg-surface-container-highest border border-outline-variant text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-surface-container transition-all"
                      >
                         <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> Reset & Reupload
                      </button>
                      <button 
                         onClick={downloadPDF}
                         className="flex items-center justify-center gap-3 w-full py-5 bg-surface-container-high border border-outline-variant text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-surface-container transition-all"
                      >
                         <Download className="w-4 h-4" /> Download Report PDF
                      </button>
                      <button
                          onClick={handleGenerateResume}
                          disabled={isGeneratingResume}
                          className="flex items-center justify-center gap-3 w-full py-5 bg-gradient-to-r from-primary to-indigo-500 text-white text-[11px] font-black uppercase tracking-widest rounded-3xl hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
                       >
                          {isGeneratingResume ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Building Resume...</>
                          ) : (
                            <><Sparkles className="w-4 h-4" /> Generate Optimized Resume (.docx)</>
                          )}
                       </button>
                   </div>

                   {/* Match Score Box */}
                   <div className="bg-black border border-white/5 p-8 md:p-10 rounded-[40px] relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors" />
                      
                      <div className="flex flex-col items-center text-center relative z-10 space-y-6">
                         <div className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">
                            <Target size={12} className="text-primary" /> Technical Magnitude
                         </div>
                         
                         <div className="relative flex items-center justify-center">
                            <svg className="w-40 h-40 transform -rotate-90">
                               <circle
                                 cx="80"
                                 cy="80"
                                 r="74"
                                 stroke="currentColor"
                                 strokeWidth="6"
                                 fill="transparent"
                                 className="text-white/5"
                               />
                               <motion.circle
                                 cx="80"
                                 cy="80"
                                 r="74"
                                 stroke="currentColor"
                                 strokeWidth="6"
                                 fill="transparent"
                                 strokeDasharray={465}
                                 initial={{ strokeDashoffset: 465 }}
                                 animate={{ strokeDashoffset: 465 - (465 * feedback.score) / 100 }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                                 className="text-primary"
                               />
                            </svg>
                            <span className="absolute text-6xl font-black text-white tracking-tighter">{feedback.score}<span className="text-primary text-xl">%</span></span>
                         </div>
                         
                         <p className="text-[11px] text-white leading-relaxed opacity-60 font-medium px-4">
                           {feedback.summary}
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
            
            {/* Job Context Chip (Optional footer info) */}
            <div className="flex justify-center pt-8">
              <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Target className="w-4 h-4" />
                 </div>
                 <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-on-surface truncate">Audit Target: {jobTitle || 'General Engineering'}</p>
                    <p className="text-[8px] text-on-surface-variant uppercase font-mono tracking-tighter">FAANG Standard Analysis v5.0</p>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Template for PDF Capture */}
      {feedback && (
         <div className="fixed -left-[4000px] top-0 w-[800px] p-12 space-y-10" ref={reportRef} style={{ background: '#000000', color: '#ffffff', fontFamily: 'sans-serif' }}>
           <div className="flex justify-between items-end border-b border-white/10 pb-8" style={{ borderBottomColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                 <h1 className="text-4xl font-black tracking-tight mb-2 text-white" style={{ color: '#ffffff' }}>{jobTitle || 'Career Audit'}</h1>
                 <p className="font-bold uppercase tracking-widest text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>BTech Placement Readiness Report</p>
              </div>
              <div className="text-right">
                 <div className="text-6xl font-black" style={{ color: '#4f46e5' }}>{feedback.score}<span className="text-xl" style={{ color: '#4f46e5' }}>%</span></div>
                 <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(79,70,229,0.6)' }}>Magnitude</div>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-6">
              <div className="p-8 rounded-[32px] border text-center space-y-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <div className="text-3xl font-black" style={{ color: '#4f46e5' }}>{feedback.readinessScore}%</div>
                 <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Readiness</div>
              </div>
              <div className="p-8 rounded-[32px] border text-center space-y-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <div className="text-3xl font-black" style={{ color: '#10b981' }}>{feedback.placementProbability}%</div>
                 <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Probability</div>
              </div>
              <div className="p-8 rounded-[32px] border text-center space-y-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <div className="text-3xl font-black" style={{ color: '#6366f1' }}>{feedback.resumeFormatting.score}%</div>
                 <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>ATS Opt.</div>
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-[0.2em] border-l-4 pl-4" style={{ color: '#10b981', borderLeftColor: '#10b981' }}>Key Strengths</h3>
              <div className="flex flex-wrap gap-2">
                 {feedback.keyStrengths.map((s, i) => (
                    <span key={i} className="px-4 py-2 border rounded-xl text-xs font-bold text-white" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>{s}</span>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-[0.2em] border-l-4 pl-4" style={{ color: '#ef4444', borderLeftColor: '#ef4444' }}>Critical Skill Gaps</h3>
              <div className="grid grid-cols-2 gap-4">
                 {feedback.skillGaps.map((gap, i) => (
                    <div key={i} className="p-5 rounded-[24px] border flex justify-between items-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                       <span className="text-xs font-bold text-white">{gap.skill}</span>
                       <span className="text-[9px] font-black uppercase px-2 py-1 rounded border" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>{gap.impact}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="space-y-10">
              <h3 className="text-xl font-black uppercase tracking-[0.2em] border-l-4 pl-4" style={{ color: '#6366f1', borderLeftColor: '#6366f1' }}>Strategic Execution Roadmap</h3>
              <div className="space-y-8">
                 {feedback.industryRoadmap.map((step, i) => (
                    <div key={i} className="p-8 rounded-[40px] border relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                       <div className="flex justify-between items-center mb-6">
                          <div>
                             <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#6366f1' }}>{step.timeframe} TARGET</span>
                             <h4 className="font-black text-2xl text-white mt-1">{step.goal}</h4>
                          </div>
                       </div>
                       <div className="grid grid-cols-1 gap-4">
                          {step.tasks.map((t, idx) => (
                             <div key={idx} className="flex gap-3 text-xs p-4 rounded-2xl border" style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#6366f1' }} />
                                {t}
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="pt-12 border-t flex justify-between items-center" style={{ borderTopColor: 'rgba(255,255,255,0.1)' }}>
              <p className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>Generated by BTech Placement AI v5.0 • {new Date().toLocaleDateString()}</p>
              <div className="flex items-center gap-2">
                 <Sparkles size={12} style={{ color: '#4f46e5' }} />
                 <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#4f46e5' }}>Confidential Intel</p>
              </div>
           </div>
         </div>
      )}\n
      {/* Toast notification for resume generation */}
      <AnimatePresence>
        {resumeGenToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 bg-surface-container-high border border-primary/30 text-on-surface px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm z-50"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            {resumeGenToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
