import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, Sparkles, Loader2, Download, Trash2, Edit3, Eye, Building2, CheckCircle2, Plus, Minus } from "lucide-react";
import { generateTailoredResume } from "../services/geminiService";
import { exportResumeAsDocx, GeneratedResume } from "../lib/docxExport";
import { getCookie, setCookie } from "../lib/cookieUtils";
import * as pdfjs from "pdfjs-dist";
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const COMPANIES = ["Google","Microsoft","Amazon","Meta","Apple","Netflix","Flipkart","Razorpay","Swiggy","Zomato","Infosys","TCS","Wipro","Goldman Sachs","JP Morgan","Adobe","Salesforce","Atlassian","Oracle","Deloitte"];
const empty = (): GeneratedResume => ({name:"",email:"",phone:"",linkedin:"",github:"",location:"",summary:"",skills:[],experience:[],education:[],projects:[],achievements:[],certifications:[],companyInsight:""});

export default function ResumeBuilder() {
  const [phase, setPhase] = useState<"input"|"edit">(() => {
    const savedPhase = getCookie("pz_rb_phase");
    return (savedPhase === "edit" || savedPhase === "input") ? savedPhase : "input";
  });
  const [originalResume, setOriginalResume] = useState("");
  const [company, setCompany] = useState(() => getCookie("pz_rb_company"));
  const [role, setRole] = useState(() => getCookie("pz_rb_role"));
  const [jobDesc, setJobDesc] = useState("");
  const [resume, setResume] = useState<GeneratedResume>(() => {
    try {
      const saved = localStorage.getItem("pz_rb_generated_resume");
      return saved ? JSON.parse(saved) : empty();
    } catch {
      return empty();
    }
  });
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [view, setView] = useState<"edit"|"preview">("edit");
  const [fileName, setFileName] = useState(() => getCookie("pz_rb_filename") || "");
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCookie("pz_rb_company", company);
  }, [company]);

  useEffect(() => {
    setCookie("pz_rb_role", role);
  }, [role]);

  useEffect(() => {
    setCookie("pz_rb_phase", phase);
  }, [phase]);

  useEffect(() => {
    if (phase === "edit") {
      localStorage.setItem("pz_rb_generated_resume", JSON.stringify(resume));
    }
  }, [resume, phase]);

  useEffect(() => {
    setCookie("pz_rb_filename", fileName);
  }, [fileName]);

  const handleRegenerate = () => {
    setPhase("input");
    setCookie("pz_rb_phase", "input");
    localStorage.removeItem("pz_rb_generated_resume");
    setFileName("");
    setOriginalResume("");
    setResume(empty());
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

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
    const f = e.target.files?.[0];
    if (!f) return;
    setExtracting(true); setFileName(f.name);
    try {
      if (f.type === "application/pdf") setOriginalResume(await extractPDF(f));
      else { const r = new FileReader(); r.onload = ev => setOriginalResume(ev.target?.result as string); r.readAsText(f); }
    } finally { setExtracting(false); }
  };

  const generate = async () => {
    if (!originalResume.trim() || !company.trim() || !role.trim()) return;
    setLoading(true);
    try {
      const raw = await generateTailoredResume(originalResume, company, role, jobDesc);
      setResume(JSON.parse(raw.trim()));
      
      // Store globally recognized preparation target
      setCookie("pz_target_company", company);
      setCookie("pz_target_role", role);
      
      setPhase("edit");
    } catch { showToast("Generation failed. Please retry."); }
    finally { setLoading(false); }
  };

  const doExport = async () => {
    setExporting(true);
    try {
      const fname = `${resume.name || "resume"}-${company}.docx`.replace(/\s+/g, "-").toLowerCase();
      await exportResumeAsDocx(resume, fname);
      showToast("Resume downloaded as DOCX!");
    } finally { setExporting(false); }
  };

  const upd = (k: keyof GeneratedResume, v: any) => setResume(r => ({ ...r, [k]: v }));
  const cls = "w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all";

  const SH = ({ label, onAdd }: { label: string; onAdd?: () => void }) => (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">{label}</h3>
      {onAdd && <button onClick={onAdd} className="p-1 hover:text-primary transition-colors text-on-surface-variant"><Plus size={14} /></button>}
    </div>
  );

  const Preview = () => (
    <div className="bg-white text-gray-900 p-8 rounded-2xl text-xs leading-relaxed font-sans shadow-2xl min-h-96">
      <div className="border-b-2 border-blue-700 pb-3 mb-4">
        <h1 className="text-xl font-black">{resume.name || "Your Name"}</h1>
        <p className="text-gray-500 text-[10px] mt-1">{[resume.email,resume.phone,resume.location,resume.linkedin,resume.github].filter(Boolean).join(" · ")}</p>
      </div>
      {resume.summary && <><p className="font-black uppercase text-[9px] tracking-widest text-blue-700 mb-1">Summary</p><p className="text-gray-700 mb-3 text-[11px]">{resume.summary}</p></>}
      {resume.skills.length > 0 && <div className="mb-3"><p className="font-black uppercase text-[9px] tracking-widest text-blue-700 mb-1 border-b border-gray-100 pb-1">Skills</p>{resume.skills.map((s, i) => <p key={i} className="mb-0.5 text-[11px]"><span className="font-bold">{s.category}:</span> {s.items.join(", ")}</p>)}</div>}
      {resume.experience.length > 0 && <div className="mb-3"><p className="font-black uppercase text-[9px] tracking-widest text-blue-700 mb-1 border-b border-gray-100 pb-1">Experience</p>{resume.experience.map((ex, i) => <div key={i} className="mb-2"><div className="flex justify-between text-[11px]"><span className="font-bold">{ex.role}</span><span className="text-gray-500">{ex.duration}</span></div><p className="text-gray-500 text-[10px] mb-0.5">{ex.company}{ex.location ? " · " + ex.location : ""}</p>{ex.bullets.map((b, j) => <p key={j} className="ml-2 text-gray-700 text-[11px]">• {b}</p>)}</div>)}</div>}
      {resume.projects.length > 0 && <div className="mb-3"><p className="font-black uppercase text-[9px] tracking-widest text-blue-700 mb-1 border-b border-gray-100 pb-1">Projects</p>{resume.projects.map((p, i) => <div key={i} className="mb-1.5"><span className="font-bold text-[11px]">{p.name}</span><span className="text-gray-500 text-[10px]"> | {p.tech}</span>{p.bullets.map((b, j) => <p key={j} className="ml-2 text-gray-700 text-[11px]">• {b}</p>)}</div>)}</div>}
      {resume.education.length > 0 && <div className="mb-3"><p className="font-black uppercase text-[9px] tracking-widest text-blue-700 mb-1 border-b border-gray-100 pb-1">Education</p>{resume.education.map((ed, i) => <p key={i} className="text-[11px] mb-0.5"><span className="font-bold">{ed.institution}</span> — {ed.degree} | {ed.year}{ed.cgpa ? " · CGPA: " + ed.cgpa : ""}</p>)}</div>}
      {resume.achievements.length > 0 && <div className="mb-2"><p className="font-black uppercase text-[9px] tracking-widest text-blue-700 mb-1 border-b border-gray-100 pb-1">Achievements</p>{resume.achievements.map((a, i) => <p key={i} className="ml-2 text-[11px]">• {a}</p>)}</div>}
      {resume.certifications.length > 0 && <div><p className="font-black uppercase text-[9px] tracking-widest text-blue-700 mb-1 border-b border-gray-100 pb-1">Certifications</p>{resume.certifications.map((c, i) => <p key={i} className="ml-2 text-[11px]">• {c}</p>)}</div>}
    </div>
  );

  const Editor = () => (
    <div className="space-y-5">
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
        <SH label="Contact Info" />
        <div className="space-y-2">{(["name","email","phone","linkedin","github","location"] as const).map(k => <input key={k} value={resume[k] as string} onChange={e => upd(k, e.target.value)} placeholder={k.charAt(0).toUpperCase() + k.slice(1)} className={cls} />)}</div>
      </div>
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
        <SH label="Summary" />
        <textarea value={resume.summary} onChange={e => upd("summary", e.target.value)} rows={4} className={cls + " resize-none"} />
      </div>
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
        <SH label="Skills" onAdd={() => upd("skills", [...resume.skills, { category: "", items: [] }])} />
        <div className="space-y-3">{resume.skills.map((sg, i) => <div key={i} className="space-y-1.5"><input value={sg.category} onChange={e => { const s = [...resume.skills]; s[i] = { ...s[i], category: e.target.value }; upd("skills", s); }} placeholder="Category" className={cls} /><input value={sg.items.join(", ")} onChange={e => { const s = [...resume.skills]; s[i] = { ...s[i], items: e.target.value.split(",").map(x => x.trim()) }; upd("skills", s); }} placeholder="Comma-separated skills" className={cls} /><button onClick={() => upd("skills", resume.skills.filter((_, j) => j !== i))} className="text-error/60 hover:text-error text-[10px] flex items-center gap-1"><Minus size={10} />Remove group</button></div>)}</div>
      </div>
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
        <SH label="Experience" onAdd={() => upd("experience", [...resume.experience, { company: "", role: "", duration: "", location: "", bullets: [""] }])} />
        <div className="space-y-4">{resume.experience.map((ex, i) => <div key={i} className="border border-outline-variant/20 rounded-xl p-4 space-y-2">{(["role","company","duration","location"] as const).map(k => <input key={k} value={ex[k]} onChange={e => { const a = [...resume.experience]; a[i] = { ...a[i], [k]: e.target.value }; upd("experience", a); }} placeholder={k.charAt(0).toUpperCase() + k.slice(1)} className={cls} />)}<div className="space-y-1.5">{ex.bullets.map((b, j) => <div key={j} className="flex gap-2"><input value={b} onChange={e => { const a = [...resume.experience]; a[i].bullets[j] = e.target.value; upd("experience", a); }} placeholder="Bullet point" className={cls} /><button onClick={() => { const a = [...resume.experience]; a[i].bullets = ex.bullets.filter((_, bk) => bk !== j); upd("experience", a); }} className="text-error/60 hover:text-error"><Minus size={12} /></button></div>)}<button onClick={() => { const a = [...resume.experience]; a[i].bullets.push(""); upd("experience", a); }} className="text-primary/60 hover:text-primary text-[10px] flex items-center gap-1"><Plus size={10} />Add bullet</button></div><button onClick={() => upd("experience", resume.experience.filter((_, j) => j !== i))} className="text-error/60 hover:text-error text-[10px] flex items-center gap-1"><Minus size={10} />Remove role</button></div>)}</div>
      </div>
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
        <SH label="Projects" onAdd={() => upd("projects", [...resume.projects, { name: "", tech: "", description: "", bullets: [], link: "" }])} />
        <div className="space-y-4">{resume.projects.map((p, i) => <div key={i} className="border border-outline-variant/20 rounded-xl p-4 space-y-2">{(["name","tech","description","link"] as const).map(k => <input key={k} value={(p as any)[k] || ""} onChange={e => { const a = [...resume.projects]; (a[i] as any)[k] = e.target.value; upd("projects", a); }} placeholder={k.charAt(0).toUpperCase() + k.slice(1)} className={cls} />)}<div className="space-y-1.5">{p.bullets.map((b, j) => <div key={j} className="flex gap-2"><input value={b} onChange={e => { const a = [...resume.projects]; a[i].bullets[j] = e.target.value; upd("projects", a); }} placeholder="Bullet" className={cls} /><button onClick={() => { const a = [...resume.projects]; a[i].bullets = p.bullets.filter((_, bk) => bk !== j); upd("projects", a); }} className="text-error/60 hover:text-error"><Minus size={12} /></button></div>)}<button onClick={() => { const a = [...resume.projects]; a[i].bullets.push(""); upd("projects", a); }} className="text-primary/60 hover:text-primary text-[10px] flex items-center gap-1"><Plus size={10} />Add bullet</button></div><button onClick={() => upd("projects", resume.projects.filter((_, j) => j !== i))} className="text-error/60 hover:text-error text-[10px] flex items-center gap-1"><Minus size={10} />Remove project</button></div>)}</div>
      </div>
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
        <SH label="Education" onAdd={() => upd("education", [...resume.education, { institution: "", degree: "", year: "", cgpa: "" }])} />
        <div className="space-y-3">{resume.education.map((ed, i) => <div key={i} className="border border-outline-variant/20 rounded-xl p-4 space-y-2">{(["institution","degree","year","cgpa"] as const).map(k => <input key={k} value={(ed as any)[k] || ""} onChange={e => { const a = [...resume.education]; (a[i] as any)[k] = e.target.value; upd("education", a); }} placeholder={k.charAt(0).toUpperCase() + k.slice(1)} className={cls} />)}<button onClick={() => upd("education", resume.education.filter((_, j) => j !== i))} className="text-error/60 hover:text-error text-[10px] flex items-center gap-1"><Minus size={10} />Remove</button></div>)}</div>
      </div>
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
        <SH label="Achievements" onAdd={() => upd("achievements", [...resume.achievements, ""])} />
        <div className="space-y-2">{resume.achievements.map((a, i) => <div key={i} className="flex gap-2"><input value={a} onChange={e => { const arr = [...resume.achievements]; arr[i] = e.target.value; upd("achievements", arr); }} className={cls} /><button onClick={() => upd("achievements", resume.achievements.filter((_, j) => j !== i))} className="text-error/60 hover:text-error"><Minus size={14} /></button></div>)}</div>
      </div>
      <div className="bg-surface-container rounded-2xl border border-outline-variant/30 p-5">
        <SH label="Certifications" onAdd={() => upd("certifications", [...resume.certifications, ""])} />
        <div className="space-y-2">{resume.certifications.map((c, i) => <div key={i} className="flex gap-2"><input value={c} onChange={e => { const arr = [...resume.certifications]; arr[i] = e.target.value; upd("certifications", arr); }} className={cls} /><button onClick={() => upd("certifications", resume.certifications.filter((_, j) => j !== i))} className="text-error/60 hover:text-error"><Minus size={14} /></button></div>)}</div>
      </div>
    </div>
  );

  if (phase === "input") return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="space-y-1">
        <h2 className="text-3xl font-black text-on-surface tracking-tight">Resume Generator</h2>
        <p className="text-on-surface-variant text-sm">Upload your resume, pick a company — get an AI-tailored DOCX in seconds.</p>
      </header>
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Step 1 — Your Existing Resume</span>
          {!fileName ? (
            <div onClick={() => fileRef.current?.click()} className="group bg-surface-container/50 border-2 border-dashed border-outline-variant/50 rounded-3xl p-10 flex flex-col items-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
              {extracting ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <Upload className="w-8 h-8 text-on-surface-variant group-hover:text-primary transition-colors" />}
              <div className="text-center"><p className="font-bold text-on-surface">{extracting ? "Extracting text..." : "Click to upload PDF or text file"}</p><p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">or paste your resume below</p></div>
              <input type="file" ref={fileRef} onChange={handleFile} hidden accept=".pdf,.txt" />
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-surface-container-high border border-primary/20 rounded-2xl p-4">
              <FileText className="text-primary w-5 h-5" />
              <span className="flex-1 text-sm font-bold truncate">{fileName}</span>
              <button onClick={() => { setFileName(""); setOriginalResume(""); }} className="text-error/60 hover:text-error"><Trash2 size={16} /></button>
            </div>
          )}
          <textarea value={originalResume} onChange={e => setOriginalResume(e.target.value)} placeholder="Or paste your resume text here..." className="w-full h-40 bg-surface-container/30 border border-outline-variant/30 rounded-2xl px-4 py-3 text-sm font-mono outline-none focus:border-primary transition-all resize-none" />
        </div>
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Step 2 — Target Details</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Target Company" className="w-full bg-surface-container border border-outline-variant/30 rounded-xl pl-12 pr-4 py-4 text-sm outline-none focus:border-primary transition-all" />
            </div>
            <input value={role} onChange={e => setRole(e.target.value)} placeholder="Target Role" className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-4 text-sm outline-none focus:border-primary transition-all" />
          </div>
          <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Job description (optional — paste for deeper tailoring)" className="w-full h-24 bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none transition-all" />
        </div>
        <button onClick={generate} disabled={loading || !originalResume.trim() || !company.trim() || !role.trim()} className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Generating tailored resume...</> : <><Sparkles className="w-5 h-5" />Generate Resume for {company || "Company"}</>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-on-surface">Resume for <span className="text-primary">{company}</span></h2>
          <p className="text-on-surface-variant text-sm">{role} · AI-tailored and ready to edit</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleRegenerate} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface border border-outline-variant rounded-xl transition-all">← Regenerate</button>
          <div className="flex bg-surface-container rounded-xl border border-outline-variant/30 p-1 gap-1">
            <button onClick={() => setView("edit")} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${view === "edit" ? "bg-primary text-white" : "text-on-surface-variant"}`}><Edit3 size={12} />Edit</button>
            <button onClick={() => setView("preview")} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${view === "preview" ? "bg-primary text-white" : "text-on-surface-variant"}`}><Eye size={12} />Preview</button>
          </div>
          <button onClick={doExport} disabled={exporting} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download DOCX
          </button>
        </div>
      </div>
      {resume.companyInsight && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-on-surface-variant leading-relaxed"><span className="font-bold text-primary">AI Insight: </span>{resume.companyInsight}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className={view === "preview" ? "hidden lg:block" : ""}><Editor /></div>
        <div className={view === "edit" ? "hidden lg:block" : ""}><div className="sticky top-6 overflow-y-auto max-h-[calc(100vh-180px)]"><Preview /></div></div>
      </div>
      <AnimatePresence>
        {toast && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 right-6 bg-surface-container-high border border-primary/30 text-on-surface px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm z-50"><CheckCircle2 className="w-5 h-5 text-primary" />{toast}</motion.div>}
      </AnimatePresence>
    </div>
  );
}
