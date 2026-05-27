import { useState, useRef } from 'react';
import { 
  Shield, 
  UserCheck, 
  FileText, 
  Cloud, 
  Lock, 
  Sliders, 
  Clock, 
  BookOpen, 
  Calendar,
  ChevronRight,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('intro');
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = contentRefs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections: Section[] = [
    {
      id: 'intro',
      title: 'Introduction to Data Integrity',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            At <strong>Prepzify</strong>, we operate under the foundational principle that your digital data is an extension of your privacy rights. This Privacy Policy outlines our transparent mechanisms for collecting, storing, securing, and processing personal information.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            This document is structurally aligned with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, the <strong>Information Technology Act, 2000 (Section 43A)</strong>, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
          </p>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3 mt-4">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-primary">Compliance Status:</span> Fully compliant with the Indian DPDP Act 2023. We protect your privacy through isolated data processing.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'consent',
      title: '1. Data Roles & Explicit Consent Framework',
      icon: UserCheck,
      content: (
        <div className="space-y-4">
          <ul className="space-y-3 pl-4 border-l-2 border-primary/20">
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Data Principal Status:</strong> Under the DPDP Act, 2023, you are recognized as the "Data Principal."
            </li>
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">The Lawful Basis for Processing:</strong> Prepzify acts as the primary data processor. We process your data strictly on the lawful basis of your explicit, unambiguous, and revocable consent, granted the moment you complete your profile initialization.
            </li>
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Children's Data Mandate (Users Under 18):</strong> In absolute compliance with Section 9 of the DPDP Act, 2023, Prepzify does not intentionally track or process a child's data without parental baseline awareness. If you are under 18, your registration process implies that your parent or legal guardian has actively consented to our collection of your academic inputs to generate career metrics. We do not engage in behavioral tracking or targeted advertising directed at children.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'categories',
      title: '2. Precise Categories of Information We Collect',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            To deploy our career analytics framework, we capture and manage the following data streams:
          </p>
          
          <div className="space-y-4 mt-2">
            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2">
              <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider">A. Personally Identifiable Information (PII)</h5>
              <ul className="list-disc pl-5 space-y-1 text-xs text-on-surface-variant leading-relaxed">
                <li><strong>Account Metadata:</strong> Your full name, email address, profile photo, and unique user identification tokens generated via Google Firebase Authentication.</li>
                <li><strong>Academic Background:</strong> Your college affiliation, year of study, major/specialization, and core skill listings.</li>
              </ul>
            </div>

            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2">
              <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider">B. User-Generated Operational Content</h5>
              <ul className="list-disc pl-5 space-y-1 text-xs text-on-surface-variant leading-relaxed">
                <li><strong>Career Artifacts:</strong> Text files, PDFs, CV layouts, and cover letters uploaded by you for deep assessment.</li>
                <li><strong>Simulated Metrics:</strong> Written responses, conversational text inputs, and mock interview answering transcripts compiled during interactive practice sessions.</li>
              </ul>
            </div>

            <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2">
              <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider">C. Automated Technical & Analytics Log Data</h5>
              <ul className="list-disc pl-5 space-y-1 text-xs text-on-surface-variant leading-relaxed">
                <li><strong>Machine Identifiers:</strong> Your Internet Protocol (IP) address, browser fingerprinting data, operating system type, device model, and active time-zone configurations.</li>
                <li><strong>Usage Footprints:</strong> Page latency rates, feature navigation heatmaps, token usage frequencies, and platform interaction durations monitored to diagnose backend stability.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'processing',
      title: '3. Data Processing Architecture & Cloud Ecosystem',
      icon: Cloud,
      content: (
        <div className="space-y-6">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Your personal data never wanders into unverified systems. Prepzify enforces clear boundary limits on data processing:
          </p>

          {/* Styled Architecture Diagram */}
          <div className="bg-surface-container-high border border-outline-variant/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-around gap-4 text-center my-4 relative overflow-hidden">
            <div className="flex flex-col items-center p-3 bg-surface rounded-xl border border-outline-variant/50 w-32 shadow-sm">
              <span className="material-symbols-outlined text-primary mb-1">devices</span>
              <span className="text-[10px] font-black text-on-surface">User Device</span>
              <span className="text-[8px] text-on-surface-variant opacity-60">Personal CV / Audio</span>
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-400 rotate-90 md:rotate-0" />
            <div className="flex flex-col items-center p-3 bg-surface rounded-xl border border-outline-variant/50 w-44 shadow-sm">
              <Cloud className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-[10px] font-black text-on-surface">Google Firebase Cloud</span>
              <span className="text-[8px] text-on-surface-variant opacity-60">AES 256 Encryption</span>
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-400 rotate-90 md:rotate-0" />
            <div className="flex flex-col items-center p-3 bg-surface rounded-xl border border-outline-variant/50 w-44 shadow-sm">
              <Sparkles className="w-5 h-5 text-primary mb-1 animate-pulse" />
              <span className="text-[10px] font-black text-on-surface">Google Gemini Pro API</span>
              <span className="text-[8px] text-on-surface-variant opacity-60">Real-Time (No Training)</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              <strong>Storage and Database Isolation:</strong> All user profile information, document text fragments, and historical dashboard records are securely hosted within the <strong>Google Firebase</strong> cloud environment. Firebase leverages enterprise-grade encryption mechanisms (Advanced Encryption Standard - AES 256) to shield your database assets both at rest and during server transit.
            </p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              <strong>AI Engine Interactions:</strong> To calculate career scores and deliver feedback, the text content of your resume or interview transcript is routed via secure HTTPS endpoints directly to the <strong>Google Gemini Pro API</strong>. Under standard Google cloud enterprise privacy terms, your data is processed dynamically in real-time, is isolated from the public internet, and <strong>is never utilized by Google to train public baseline models</strong>.
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed italic">
              <strong>External Integrations & Job Aggregators:</strong> Prepzify links out to external job portals to pull real-time internship and placement listings. When you click these links, you leave our platform. We hold zero control over the cookie deployments or privacy schemas of external job boards.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'commingling',
      title: '4. Zero Data Commingling & Disclosure Restraints',
      icon: Lock,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Prepzify maintains a strict policy against data monetization: <strong>we will never sell, rent, lease, or trade your personal information to third-party marketing companies</strong>. Data sharing is restricted exclusively to the following compliance scenarios:
          </p>
          <ul className="space-y-3 pl-4 border-l-2 border-error/20">
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Infrastructure Operations:</strong> Providing minimal data tokens to our trusted backend infrastructure (Google Firebase) strictly to run your personal dashboard.
            </li>
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Statutory Obligations:</strong> Disclosing information to verified Indian courts, regulatory authorities, defense agencies, or law enforcement officers if mandated by a formal legal subpoena, court order, or statutory decree under Indian law.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'rights',
      title: '5. Rights of the Data Principal',
      icon: Sliders,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Under the provisions of the DPDP Act, 2023, you retain absolute authority over your digital data. You can seamlessly exercise these rights at any point:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <h5 className="font-bold text-xs text-on-surface mb-1">Right to Summary & Access</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">Review all the career logs, resumes, and profile information currently stored in your active Firebase dashboard.</p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <h5 className="font-bold text-xs text-on-surface mb-1">Right to Correction & Updating</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">Edit, modify, or correct inaccurate bio-data fields directly through your user settings panel.</p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <h5 className="font-bold text-xs text-on-surface mb-1">Right to Erasure (Account Deletion)</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">Demand Prepzify purges your identity. Email a formal erasure request to teamprepzify@gmail.com.</p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <h5 className="font-bold text-xs text-on-surface mb-1">Right to Withdraw Consent</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">Withdraw consent at any time. Note that this necessitates profile closure, as AI analytics require database access.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'retention',
      title: '6. Data Lifecycle & Retention Windows',
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            We retain your personal data only for the duration necessary to satisfy the functional requirements of your career preparation account.
          </p>
          <ul className="space-y-3 pl-4 border-l-2 border-indigo-500/30">
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Active Accounts:</strong> Data persists continuously to display your historical improvement charts over time.
            </li>
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Inactive Clean-up Schedule:</strong> To ensure strict data minimization, if a user profile remains entirely inactive for a continuous period of <strong>2 years</strong>, Prepzify will automatically flag the profile, archive the historical data, and securely purge all associated resume uploads from our active Firebase storage buckets.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'cookies',
      title: '7. Cookies & Tracking Technologies',
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Prepzify implements functional session cookies to remember your Firebase login token and protect your user session as you navigate between features.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Third-party analytic tracking cookies may be deployed to monitor system traffic anonymously. You can choose to completely block cookies via your browser settings, though it may disrupt the seamless operation of your dashboard login state.
          </p>
        </div>
      )
    },
    {
      id: 'grievance',
      title: '8. Appointed Grievance Officer Details',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            In compliance with the Information Technology Act, 2000, and data protection rules, any complaints, data discrepancies, or security grievances can be addressed to our Grievance Representative:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-primary mb-1">person</span>
              <h5 className="font-bold text-[10px] text-on-surface-variant uppercase">Representative</h5>
              <p className="text-xs text-on-surface font-bold mt-1">Prepzify Compliance Lead</p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-primary mb-1">corporate_fare</span>
              <h5 className="font-bold text-[10px] text-on-surface-variant uppercase">Legal Entity</h5>
              <p className="text-xs text-on-surface font-bold mt-1">Team Prepzify</p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-primary mb-1">mail</span>
              <h5 className="font-bold text-[10px] text-on-surface-variant uppercase">Electronic Mail</h5>
              <p className="text-xs text-primary font-bold hover:underline mt-1">
                <a href="mailto:teamprepzify@gmail.com">teamprepzify@gmail.com</a>
              </p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-primary mb-1">location_on</span>
              <h5 className="font-bold text-[10px] text-on-surface-variant uppercase">Location Frame</h5>
              <p className="text-xs text-on-surface font-bold mt-1">Haldia, West Bengal, India</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Premium Header */}
      <header className="bg-surface-container p-8 md:p-10 rounded-[40px] border border-outline-variant/30 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full uppercase tracking-widest w-fit">
              <Calendar size={10} /> Data Integrity
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">Privacy Policy</h2>
            <p className="text-on-surface-variant text-sm max-w-xl">
              Learn about our transparent data processing ecosystems, privacy compliance, and principal rights.
            </p>
          </div>
          <div className="bg-surface-container-high border border-outline-variant/50 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase text-on-surface-variant tracking-wider shrink-0 flex items-center gap-2">
            Last Updated: May 27, 2026
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <nav className="col-span-12 lg:col-span-4 bg-surface-container border border-outline-variant/30 rounded-[32px] p-6 space-y-2 sticky top-6">
          <h4 className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest px-3 mb-4">Table of Contents</h4>
          <div className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar pr-1">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full flex items-center gap-3 py-2.5 px-4 transition-all rounded-xl text-left text-xs ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-bold shadow-sm' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="truncate flex-1">{sec.id === 'intro' ? 'Introduction' : sec.title.replace(/^\d+\.\s*/, '')}</span>
                  <ChevronRight size={12} className={`opacity-40 transition-transform ${isActive ? 'rotate-90 text-primary opacity-100' : ''}`} />
                </button>
              );
            })}
          </div>
        </nav>

        {/* Documents Reader View */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <div
                key={sec.id}
                ref={(el) => { contentRefs.current[sec.id] = el; }}
                className={`bg-surface-container-low border rounded-[32px] p-8 space-y-6 transition-all duration-300 ${
                  isActive 
                    ? 'border-primary/40 shadow-xl shadow-primary/5 bg-surface-container-high/40' 
                    : 'border-outline-variant/20'
                }`}
              >
                <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
                  <div className={`p-2.5 rounded-xl border ${
                    isActive 
                      ? 'bg-primary/10 border-primary/20 text-primary' 
                      : 'bg-surface-container border-outline-variant/30 text-on-surface-variant'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-lg font-black text-on-surface tracking-tight">{sec.title}</h3>
                </div>
                <div>
                  {sec.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
