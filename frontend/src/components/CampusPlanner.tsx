import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2, Calendar, Upload, FileText, Sparkles, Loader2,
  ChevronDown, ChevronUp, CheckCircle2, Clock, Zap, BookOpen,
  Target, Trophy, AlertTriangle, Trash2, TrendingUp, Flag
} from "lucide-react";
import { generateCampusPlan } from "../services/geminiService";
import { getCookie, setCookie } from "../lib/cookieUtils";
import { scopedStorage } from "../lib/storageUtils";
import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const COMPANIES = ["TCS","Infosys","Wipro","Amazon","Microsoft","Google","Meta","Flipkart","Razorpay","Goldman Sachs","JP Morgan","Deloitte","Accenture","Cognizant","HCL","Tech Mahindra","Adobe","Salesforce","Oracle","Paytm","Swiggy","Zomato","HDFC Bank","PhonePe","Meesho"];

const PHASE_COLORS: Record<string, string> = {
  blue:   "bg-blue-500/10 border-blue-500/30 text-blue-400",
  green:  "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  orange: "bg-orange-500/10 border-orange-500/30 text-orange-400",
  purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  red:    "bg-red-500/10 border-red-500/30 text-red-400",
};

const PHASE_DOT: Record<string, string> = {
  blue: "bg-blue-400", green: "bg-emerald-400", orange: "bg-orange-400", purple: "bg-purple-400", red: "bg-red-400",
};

const TASK_ICON: Record<string, any> = {
  theory:   BookOpen,
  practice: Zap,
  mock:     Target,
  revision: TrendingUp,
  hr:       Trophy,
};

const TASK_COLOR: Record<string, string> = {
  theory:   "text-blue-400 bg-blue-500/10",
  practice: "text-yellow-400 bg-yellow-500/10",
  mock:     "text-purple-400 bg-purple-500/10",
  revision: "text-emerald-400 bg-emerald-500/10",
  hr:       "text-pink-400 bg-pink-500/10",
};

const PRIORITY_BADGE: Record<string, string> = {
  high:   "bg-red-500/10 text-red-400 border border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  low:    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};

interface Task { type: string; description: string; target: string; }
interface DayPlan {
  day: number; phase: string; title: string; focus: string;
  priority: string; tasks: Task[]; tip: string; estimatedHours: number;
}
interface Phase { name: string; duration: string; goal: string; color: string; }
interface CampusPlan {
  company: string; role: string; daysLeft: number; companyPattern: string;
  keyFocusAreas: string[]; skillGapsDetected: string[]; phases: Phase[];
  days: DayPlan[]; day0Checklist: string[]; finalWeekStrategy: string; motivationalNote: string;
}

export default function CampusPlanner() {
  const [company, setCompany] = useState(() => scopedStorage.getItem("pz_cp_company") || "");
  const [role, setRole] = useState(() => scopedStorage.getItem("pz_cp_role") || "");
  const [daysLeft, setDaysLeft] = useState(15);
  const [campusDate, setCampusDate] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<CampusPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const targetComp = scopedStorage.getItem("pz_target_company") || "";
  const targetRl = scopedStorage.getItem("pz_target_role") || "";
  const [showSuggestion, setShowSuggestion] = useState(() => !!(targetComp && targetRl));

  useEffect(() => {
    scopedStorage.setItem("pz_cp_company", company);
  }, [company]);

  useEffect(() => {
    scopedStorage.setItem("pz_cp_role", role);
  }, [role]);

  const computeDays = (dateStr: string) => {
    if (!dateStr) return;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
    if (diff > 0) setDaysLeft(diff);
  };

  const extractPDF = async (file: File) => {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    let txt = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const tc = await pg.getTextContent();
      txt += tc.items.map((x: any) => x.str).join(" ") + "\n";
    }
    return txt;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setExtracting(true); setFileName(f.name);
    try {
      if (f.type === "application/pdf") setResumeText(await extractPDF(f));
      else { const r = new FileReader(); r.onload = ev => setResumeText(ev.target?.result as string); r.readAsText(f); }
    } finally { setExtracting(false); }
  };

  const generate = async () => {
    if (!company.trim()) { setError("Please enter the company name."); return; }
    if (daysLeft < 1) { setError("Days must be at least 1."); return; }
    setError(""); setLoading(true);
    try {
      const raw = await generateCampusPlan(company, daysLeft, resumeText, role || "Software Engineer");
      const data: CampusPlan = JSON.parse(raw.trim());
      setPlan(data);
      setActivePhase(null);
      setExpandedDay(1);
    } catch (e) {
      setError("Failed to generate plan. Please retry.");
      console.error(e);
    } finally { setLoading(false); }
  };

  const filteredDays = plan
    ? (activePhase ? plan.days.filter(d => d.phase === activePhase) : plan.days)
    : [];

  const totalHours = plan ? plan.days.reduce((s, d) => s + (d.estimatedHours || 0), 0) : 0;

  if (!plan) return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl"><Flag className="w-6 h-6 text-primary" /></div>
          <div>
            <h2 className="text-3xl font-black text-on-surface tracking-tight">Campus Planner</h2>
            <p className="text-on-surface-variant text-sm">Company-specific, timeline-aware study roadmap from your resume.</p>
          </div>
        </div>
      </header>

      {showSuggestion && targetComp && targetRl && (
        <div className="bg-gradient-to-r from-primary/15 to-indigo-500/10 border border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-lg shadow-primary/5">
          <div className="flex gap-3 items-start">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary mt-0.5 sm:mt-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Resume Match Found</p>
              <p className="text-sm text-on-surface">
                Suggested Target: Prepare for <span className="font-extrabold text-primary">{targetComp}</span> as a <span className="font-extrabold text-primary">{targetRl}</span> based on your latest resume!
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setCompany(targetComp);
                setRole(targetRl);
                setShowSuggestion(false);
              }}
              className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-primary/20 cursor-pointer"
            >
              Use Suggestion
            </button>
            <button
              onClick={() => setShowSuggestion(false)}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface border border-outline-variant rounded-xl transition-all cursor-pointer"
            >
              Target Another Role
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Step 1 — Target Company & Role</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
              <input
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Company (TCS, Amazon, Google...)"
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-primary transition-all"
              />
            </div>
            <input
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="Target Role (Software Engineer)"
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-4 text-sm outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Step 2 — Campus Drive Timeline</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
              <input
                type="date"
                value={campusDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => { setCampusDate(e.target.value); computeDays(e.target.value); }}
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="relative flex items-center gap-3 bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3">
              <Clock className="w-4 h-4 text-on-surface-variant/40 shrink-0" />
              <div className="flex-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant block mb-1">Days Until Drive</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={daysLeft}
                  onChange={e => setDaysLeft(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-transparent text-lg font-black text-on-surface outline-none no-spinners"
                />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${daysLeft <= 7 ? "bg-red-500/10 text-red-400" : daysLeft <= 15 ? "bg-orange-500/10 text-orange-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                {daysLeft <= 7 ? "Critical" : daysLeft <= 15 ? "Tight" : "Good"}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Step 3 — Your Resume (for personalisation)</span>
          {!fileName ? (
            <div onClick={() => fileRef.current?.click()} className="group bg-surface-container/50 border-2 border-dashed border-outline-variant/50 rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
              {extracting ? <Loader2 className="w-7 h-7 text-primary animate-spin" /> : <Upload className="w-7 h-7 text-on-surface-variant group-hover:text-primary transition-colors" />}
              <div className="text-center">
                <p className="font-bold text-on-surface text-sm">{extracting ? "Extracting..." : "Upload PDF or text file"}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Optional — enables skill-gap based personalisation</p>
              </div>
              <input type="file" ref={fileRef} onChange={handleFile} hidden accept=".pdf,.txt" />
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-surface-container-high border border-primary/20 rounded-xl p-3">
              <FileText className="text-primary w-5 h-5 shrink-0" />
              <span className="flex-1 text-sm font-bold truncate">{fileName}</span>
              <button onClick={() => { setFileName(""); setResumeText(""); }} className="text-error/60 hover:text-error"><Trash2 size={15} /></button>
            </div>
          )}
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Or paste your resume text here for a personalised plan..."
            className="w-full h-28 bg-surface-container/30 border border-outline-variant/30 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-error text-sm bg-error/5 border border-error/20 rounded-xl p-3">
            <AlertTriangle size={16} />{error}
          </div>
        )}

        <button
          onClick={generate}
          disabled={loading || !company.trim()}
          className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Generating {daysLeft}-Day Plan for {company || "Company"}...</>
          ) : (
            <><Sparkles className="w-5 h-5" />Generate {daysLeft}-Day Plan for {company || "Company"}</>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-black text-on-surface">{plan.daysLeft}-Day Plan for <span className="text-primary">{plan.company}</span></h2>
          </div>
          <p className="text-on-surface-variant text-sm">{plan.role} · {plan.companyPattern}</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-2">
            <Clock size={14} className="text-on-surface-variant" />
            <span className="text-sm font-bold">{totalHours}h total</span>
          </div>
          <button
            onClick={() => { setPlan(null); setExpandedDay(1); setActivePhase(null); }}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface border border-outline-variant rounded-xl transition-all"
          >
            ← New Plan
          </button>
        </div>
      </div>

      {/* Motivational Note */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-5 flex gap-3 items-start">
        <Trophy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Your Mission</p>
          <p className="text-sm text-on-surface leading-relaxed">{plan.motivationalNote}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Stats + Meta */}
        <div className="lg:col-span-4 space-y-5">
          {/* Day 0 Checklist */}
          <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface">Day 0 — Do Today</h3>
            </div>
            <div className="space-y-2">
              {plan.day0Checklist.map((item, i) => (
                <div key={i} className="flex gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Key Focus Areas */}
          <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface">Key Focus Areas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {plan.keyFocusAreas.map((area, i) => (
                <span key={i} className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-lg">{area}</span>
              ))}
            </div>
          </div>

          {/* Skill Gaps */}
          {plan.skillGapsDetected.length > 0 && (
            <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface">Skill Gaps to Bridge</h3>
              </div>
              <div className="space-y-1.5">
                {plan.skillGapsDetected.map((gap, i) => (
                  <div key={i} className="flex gap-2 text-xs text-on-surface-variant">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    {gap}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phases */}
          <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface mb-4">Phases</h3>
            <div className="space-y-2">
              {plan.phases.map((ph, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhase(activePhase === ph.name ? null : ph.name)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${PHASE_COLORS[ph.color] || PHASE_COLORS.blue} ${activePhase === ph.name ? "ring-1 ring-primary/30" : "hover:brightness-110"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${PHASE_DOT[ph.color] || PHASE_DOT.blue}`} />
                    <span className="font-bold">{ph.name}</span>
                    <span className="ml-auto text-[9px] opacity-70">{ph.duration}</span>
                  </div>
                  <p className="opacity-70 text-[10px]">{ph.goal}</p>
                </button>
              ))}
              {activePhase && (
                <button onClick={() => setActivePhase(null)} className="w-full text-center text-[10px] text-primary hover:underline pt-1">Show all days</button>
              )}
            </div>
          </div>

          {/* Final Week Strategy */}
          {plan.finalWeekStrategy && (
            <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface">Final Sprint Strategy</h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">{plan.finalWeekStrategy}</p>
            </div>
          )}
        </div>

        {/* Right: Day-by-Day Timeline */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">
              {activePhase ? activePhase : "Full Day-by-Day Timeline"}
              <span className="ml-2 text-on-surface-variant font-normal normal-case tracking-normal text-xs">({filteredDays.length} days)</span>
            </h3>
          </div>

          {filteredDays.map((day) => {
            const isExpanded = expandedDay === day.day;
            const phaseObj = plan.phases.find(p => p.name === day.phase);
            const phColor = phaseObj?.color || "blue";

            return (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-surface-container rounded-2xl border transition-all overflow-hidden ${day.priority === "high" ? "border-primary/30" : "border-outline-variant/30"}`}
              >
                {/* Day header */}
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-high transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${PHASE_COLORS[phColor] || PHASE_COLORS.blue}`}>
                    {day.day}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-on-surface text-sm truncate">{day.title}</p>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${PRIORITY_BADGE[day.priority] || PRIORITY_BADGE.medium}`}>
                        {day.priority}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">{day.focus} · ~{day.estimatedHours}h</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-bold text-on-surface-variant hidden sm:block">{day.tasks.length} tasks</span>
                    {isExpanded ? <ChevronUp size={16} className="text-on-surface-variant" /> : <ChevronDown size={16} className="text-on-surface-variant" />}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 space-y-4 border-t border-outline-variant/20 pt-4">
                        {/* Tasks */}
                        <div className="space-y-2">
                          {day.tasks.map((task, j) => {
                            const Icon = TASK_ICON[task.type] || BookOpen;
                            return (
                              <div key={j} className="flex gap-3 p-3 bg-surface-container-high rounded-xl">
                                <div className={`p-1.5 rounded-lg shrink-0 ${TASK_COLOR[task.type] || TASK_COLOR.theory}`}>
                                  <Icon size={13} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-on-surface">{task.description}</p>
                                  <p className="text-[10px] text-on-surface-variant mt-0.5">{task.target}</p>
                                </div>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg shrink-0 ${TASK_COLOR[task.type] || TASK_COLOR.theory}`}>
                                  {task.type}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Tip */}
                        {day.tip && (
                          <div className="flex gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <Sparkles size={13} className="text-primary shrink-0 mt-0.5" />
                            <p className="text-[11px] text-on-surface-variant italic leading-relaxed"><span className="text-primary font-bold not-italic">Tip: </span>{day.tip}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
