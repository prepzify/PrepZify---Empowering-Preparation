import { useState, useRef } from 'react';
import { 
  Zap, 
  Calendar, 
  AlertCircle, 
  RotateCcw, 
  HelpCircle,
  ChevronRight,
  BookOpen
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
}

export default function RefundPolicy() {
  const [activeSection, setActiveSection] = useState('overview');
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
      id: 'overview',
      title: 'Overview',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Prepzify is committed to providing premium, cloud-based software-as-a-service (SaaS) tools for engineering career development. This Cancellation and Refund Policy governs the transactions, billing allocations, and reversal protocols for our subscriptions and digital tokens.
          </p>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3 mt-4">
            <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <span className="font-bold text-primary">Summary:</span> Transactions are digital, instant, and generally non-refundable due to active server-side computing and third-party API costs. Exceptional reversals are supported for verified payment failures.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'delivery',
      title: '1. Digital Service and Delivery Mechanism',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Prepzify functions exclusively as a cloud-based, software-as-a-service (SaaS) platform providing digital career development tools.
          </p>
          <ul className="space-y-3 pl-4 border-l-2 border-primary/20">
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Absolute Digital Delivery:</strong> No physical goods, components, paper manuals, or tangible products will ever be packed, shipped, or delivered. All services, including advanced AI evaluation tokens, resume templates, and simulated interview rooms, are unlocked instantly inside your digital dashboard upon successful verification of the transaction.
            </li>
            <li className="text-sm text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface">Immediate Confirmation:</strong> Upon the completion of any payment via our gateway aggregator, an automated billing invoice and service credit activation email will be transmitted directly to your registered email address.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'subscription',
      title: '2. Subscription Layouts & Cancellation Covenants',
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Prepzify provides baseline free-tier career tracking tools, alongside advanced premium subscription packages and token bundles that unlock unlimited high-capacity evaluations via the Google Gemini Pro API.
          </p>
          <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 space-y-2">
            <h5 className="font-bold text-xs text-on-surface flex items-center gap-2">
              User-Initiated Cancellation
            </h5>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              You can cancel recurring subscription plans at any moment through your account profile dashboard. Following cancellation, your premium access tier will remain fully functional until your current active monthly or annual billing window closes.
            </p>
          </div>
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>Please Note:</strong> Prepzify does not issue partial, pro-rata, or fractional financial adjustments for unused days remaining within an active billing cycle.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'non-refundable',
      title: '3. Non-Refundable Nature of Digital Assets',
      icon: AlertCircle,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-error/5 border border-error/20 rounded-2xl space-y-2">
            <h5 className="font-black text-xs text-error uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Strictly Final & Non-Refundable
            </h5>
            <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
              Because Prepzify's core features involve real-time cloud computing, server data handoffs, and immediate third-party API transaction overheads (Google Gemini Pro API processing), the absolute instant a user prompts an AI resume parse or live mock review, all completed purchases of premium credits, subscription tiers, and token allocations are strictly final and non-refundable.
            </p>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            By completing a transaction on the Platform, you acknowledge that you forfeit any right to claim refunds once your purchased credits have been delivered to your user state.
          </p>
        </div>
      )
    },
    {
      id: 'reversals',
      title: '4. Exceptional Transaction Reversals',
      icon: RotateCcw,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            In highly specific scenarios involving financial network congestion, payment gateway latency, or database communication drops where a user is legitimately debited but the service tokens fail to unlock:
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <h5 className="font-bold text-xs text-on-surface mb-1">Reporting Timeline</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                The user must notify the billing team by sending a descriptive email containing the clear transaction reference ID, payment timestamp, and proof of account debit to <a href="mailto:teamprepzify@gmail.com" className="text-primary hover:underline font-bold">teamprepzify@gmail.com</a> within <strong>7 days</strong> of the failed attempt.
              </p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30">
              <h5 className="font-bold text-xs text-on-surface mb-1">Internal Auditing</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Prepzify will thoroughly audit database records and payment gateway logs. If our internal evaluation confirms that a monetary deduction occurred without the successful provision of corresponding digital service credits, a full reversal protocol will be activated.
              </p>
            </div>
          </div>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
            <h5 className="font-bold text-xs text-primary">Refund Timeline & Source Pathway</h5>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              All verified and approved transaction reversals are returned directly to the original source payment instrument (i.e., your specific UPI VPA account, Net Banking account, or Credit/Debit card profile).
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Reversals are processed via our payment gateway aggregator (<strong>Razorpay</strong>) and will typically reflect within your bank account within <strong>5 to 7 working days</strong>, completely subject to standard banking clearing schedules across India. No cash or alternative account conversions are permitted.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'support',
      title: '5. Dedicated Billing Support Line',
      icon: HelpCircle,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            For all payment failures, duplicate deductions, or invoicing discrepancies, please contact our financial resolution desk:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-primary mb-2">mail</span>
              <h5 className="font-bold text-xs text-on-surface">Email Contact</h5>
              <p className="text-xs text-primary hover:underline font-bold mt-1">
                <a href="mailto:teamprepzify@gmail.com">teamprepzify@gmail.com</a>
              </p>
            </div>
            <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/30 text-center">
              <span className="material-symbols-outlined text-primary mb-2">location_on</span>
              <h5 className="font-bold text-xs text-on-surface">Compliance Postal Frame</h5>
              <p className="text-xs text-on-surface-variant mt-1">Haldia, West Bengal, India</p>
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
              <Calendar size={10} /> Billing Rules
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight">Cancellation and Refund Policy</h2>
            <p className="text-on-surface-variant text-sm max-w-xl">
              Please read these cancellation policies carefully. Transactions on Prepzify are digital and instantly delivered.
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
                  <span className="truncate flex-1">{sec.id === 'overview' ? 'Introduction' : sec.title.replace(/^\d+\.\s*/, '')}</span>
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
