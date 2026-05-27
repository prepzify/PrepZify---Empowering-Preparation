import { useState, useRef } from 'react';
import { 
  UserCheck, 
  Shield, 
  History, 
  FileText, 
  Sparkles, 
  Scale, 
  AlertTriangle, 
  Globe, 
  Calendar,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

export default function TermsAndConditions() {
  const [activeSection, setActiveSection] = useState('welcome');
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
      id: 'welcome',
      title: 'Welcome to Prepzify',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Please read these Terms of Use ("Terms", "Agreement") carefully before navigating or registering on the digital platform hosted at <a href="https://www.prepzify.com" className="text-primary hover:underline font-bold">https://www.prepzify.com</a> (the "Site" or "Platform"). This document constitutes a legally binding electronic contract between you—the end-user, candidate, or visitor ("User", "You", "Your")—and <strong>Prepzify</strong> ("Prepzify", "We", "Us", "Our").
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            By accessing, browsing, creating an account, or subscribing to any AI-driven career services offered on this Platform, you acknowledge that you have read, understood, and unconditionally accept to be bound by these Terms. If you do not agree to these terms, you must immediately cease all interactions with our services.
          </p>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3 mt-4">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-primary">Quick Summary:</span> By using Prepzify, you agree to these legal conditions, including our AI terms and restrictions on sharing accounts.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'eligibility',
      title: '1. Legal Eligibility & Guardianship Affirmation',
      icon: UserCheck,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Prepzify provides automated career counseling, resume engineering, and interactive mock interview simulation services designed to cater to a diverse spectrum of students and young professionals.
          </p>
          <ul className="space-y-3 pl-4 border-l-2 border-primary/20">
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Adult Users (18+):</strong> If you are aged 18 or above, you affirm that you possess the absolute legal capacity to form a binding contract under the Indian Contract Act, 1872.
            </li>
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Minor Users (Under 18):</strong> Prepzify is designed to be completely child-friendly and educational. However, in strict compliance with Indian digital regulations, any user under the age of 18 ("Minor") must access this platform under the active supervision and guidance of a parent or lawful guardian. By executing the registration process for a Minor, it is legally deemed that your parent or guardian has reviewed, understood, and accepted these Terms on your behalf.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'account',
      title: '2. Account Registration, Authentication, & Access',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            To unlock the core dashboard capabilities, users must register and maintain an active digital profile.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <h5 className="font-bold text-xs text-on-surface mb-1">Account Integrity</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">Requires current, complete, and highly accurate details via Google Firebase authentication gateway.</p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <h5 className="font-bold text-xs text-on-surface mb-1">Password Confidentiality</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">You are exclusively responsible for safeguarding credentials. All sessions are attributed to you.</p>
            </div>
          </div>
          <div className="p-4 bg-error/5 border border-error/20 rounded-2xl space-y-2">
            <h5 className="font-black text-xs text-error uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Strict Prohibitions against Multi-User Access
            </h5>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Prepzify enforces a rigid single-user access framework. The following constitute a material breach:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-on-surface-variant">
              <li>Sharing private account credentials or Firebase session state with any third party.</li>
              <li>Caching or mirroring any authenticated portion of the Site on proxy servers.</li>
              <li>Deploying automated networks/scripts to distribute access tokens across multiple workstations.</li>
            </ol>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed italic">
            <strong>Security Enforcement:</strong> Notify us at <a href="mailto:support@prepzify.com" className="text-primary hover:underline font-bold">support@prepzify.com</a> instantly upon finding compromised credentials. Suspicious concurrent IP activity will trigger immediate termination of access.
          </p>
        </div>
      )
    },
    {
      id: 'modifications',
      title: '3. Platform Evolution & Revisions',
      icon: History,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Prepzify operates as a rapidly evolving SaaS platform. We reserve the absolute right, entirely at our sole discretion, to modify, update, replace, temporarily suspend, or permanently discontinue any feature, service tier, visual UI element, or data pipeline at any time without prior liability or notice.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Any amendment to these Terms will be made visible on this page with an updated "Last Updated" timestamp. Checking this document periodically is your responsibility. Your continued usage of the Platform following the publication of revisions constitutes explicit, binding acceptance of the new operating terms.
          </p>
        </div>
      )
    },
    {
      id: 'property',
      title: '4. Intellectual Property & Ownership',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider">Platform Proprietary Rights</h5>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              The ownership, titles, interest, and intellectual property rights concerning the platform's architectural ecosystem—including but not limited to the source code (MERN Stack layout), custom UI components, backend routing mechanisms, vector embeddings, branding, logos, graphics, and technical documentation—are exclusively retained by Prepzify.
            </p>
          </div>
          <div className="space-y-3">
            <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider">User Content License</h5>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              When you upload personal documents, resumes, text strings, or interview voice transcripts, you retain ownership of your underlying data. You grant Prepzify a limited, non-exclusive, royalty-free, operational license to transmit this information through cloud databases (Google Firebase) and secure processing microservices (Google Gemini Pro API) solely to execute the features requested by you.
            </p>
          </div>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
            <h5 className="font-bold text-xs text-primary mb-1">Output Assets</h5>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Any resume file or mock score assessment card generated and downloaded by you is your personal property, granted to you for non-commercial career distribution and personal employment applications.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'ai-disclaimer',
      title: '5. AI Evaluation Disclaimer & Liability Limits',
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
            <h5 className="font-black text-xs text-amber-500 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Nature of AI Operations
            </h5>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Prepzify utilizes advanced large language model pipelines, specifically the <strong>Google Gemini Pro API</strong>, to perform algorithmic resume parsing, structure scoring, and automated mock interview speech/text evaluations.
            </p>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            <strong>Warranties Disclaimed:</strong> You explicitly acknowledge and agree that these AI-generated metrics are provided strictly as automated training aids to supplement your career preparation. Prepzify gives <strong>no warranties, representations, or guarantees</strong> regarding the absolute contextual accuracy, semantic perfection, or objective fairness of the AI analytics.
          </p>
          <div className="p-4 bg-error/5 border border-error/20 rounded-2xl">
            <p className="text-xs text-error font-black uppercase tracking-wider mb-1">Limitation of Liability</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              To the maximum extent permitted under applicable Indian laws, Prepzify, its developers, and affiliates shall never be held liable for any direct, indirect, incidental, punitive, special, or consequential damages. This includes, without limitation, corporate recruitment rejections, placement disqualifications, failure to pass competitive institutional examinations, or loss of career data arising out of your reliance on the AI metrics provided by the Platform.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'conduct',
      title: '6. User Conduct & Intermediary Compliance',
      icon: Scale,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            In strict compliance with Rule 3(1)(b) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, you agree and guarantee that you will not host, upload, modify, stream, or transmit any document, text, or file on Prepzify that:
          </p>
          <ul className="space-y-2.5 pl-6 list-disc text-sm text-on-surface-variant leading-relaxed">
            <li>Belongs to another individual without explicit authorization or legal right.</li>
            <li>Infringes upon any patent, trademark, trade secret, copyright, or other proprietary intellectual rights of any party.</li>
            <li>Contains deep-learning bypasses, software viruses, trojans, or malicious code designed to degrade, interrupt, or completely crash our Firebase or frontend hosting infrastructure.</li>
            <li>Is highly defamatory, obscene, invasive of privacy, racially or ethnically objectionable, or legally unlawful under the Indian Penal Code.</li>
            <li>Threatens the unity, integrity, defense, security, or sovereignty of the Republic of India.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'indemnification',
      title: '7. Indemnification Obligations',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            You agree to defend, indemnify, and hold harmless Prepzify, its developers, founders, and stakeholders from and against any and all legal claims, financial liabilities, operational losses, damages, costs, and expenses (including standard attorney fees and judicial disbursements) arising out of or resulting from your breach of these Terms, misuse of the AI features, or any illicit activity executed through your authenticated user account.
          </p>
        </div>
      )
    },
    {
      id: 'termination',
      title: '8. Termination Protocol',
      icon: AlertTriangle,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            This Agreement remains active until terminated by either party. You may terminate this contract at any point by ceasing all use of the Platform and requesting account deletion via email.
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Prepzify reserves the right to restrict your access, delete your profile, or ban your IP address instantly if we establish that you have violated any core covenant of these Terms or if keeping the platform live becomes commercially non-viable.
          </p>
        </div>
      )
    },
    {
      id: 'governing-law',
      title: '9. Governing Law, Jurisdiction, & Severability',
      icon: Globe,
      content: (
        <div className="space-y-4">
          <ul className="space-y-3 pl-4 border-l-2 border-indigo-500/30">
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Governing Law:</strong> This electronic record is generated in accordance with the Information Technology Act, 2000, and is governed by and construed strictly under the laws of the <strong>Republic of India</strong>, without regard to conflict of laws principles.
            </li>
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Exclusive Jurisdiction:</strong> Any legal suit, dispute, or arbitration arising directly in relation to these Terms shall be subject to the exclusive jurisdiction of the competent courts located in <span className="font-bold text-primary">Kolkata, West Bengal</span>, India.
            </li>
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Severability:</strong> If any specific provision of this Agreement is deemed invalid, unlawful, or unenforceable by an authorized court of law, that specific clause shall be modified or severed to the minimum extent necessary, and all remaining provisions shall continue in full force, validity, and legal effect.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'abuse',
      title: '10. Reporting System Abuse',
      icon: AlertTriangle,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            If you discover any user violating these terms, or encounter bugs that expose system vulnerabilities, please report the incident instantly to our security team at <a href="mailto:support@prepzify.com" className="text-primary hover:underline font-bold">support@prepzify.com</a>.
          </p>
          <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-center py-6">
            <p className="text-xs text-on-surface-variant font-bold">Thank you for helping us maintain a safe and honest engineering prep environment.</p>
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
              <Calendar size={10} /> Legal Agreement
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">Terms and Conditions</h2>
            <p className="text-on-surface-variant text-sm max-w-xl">
              Please read these platform terms carefully. By using Prepzify, you consent to these rules and guidelines.
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
                  <span className="truncate flex-1">{sec.id === 'welcome' ? 'Introduction' : sec.title.replace(/^\d+\.\s*/, '')}</span>
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
