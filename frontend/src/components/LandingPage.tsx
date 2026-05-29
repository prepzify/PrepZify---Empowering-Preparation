import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Cpu, 
  Code2, 
  Zap, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2,
  Trophy,
  Users,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { auth } from '../lib/firebase';
import { PRICING_PLANS, PricingPlan, startRazorpayPayment } from '../services/paymentService';
import Logo from './Logo';
import Footer from './Footer';
import FAQSection from './FAQSection';

export default function LandingPage() {
  const navigate = useNavigate();
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const handlePlanClick = async (plan: PricingPlan) => {
    setPaymentMessage('');
    setPaymentError('');

    if (plan.id === 'free') {
      navigate('/auth');
      return;
    }

    if (!auth.currentUser) {
      navigate(`/auth?plan=${plan.id}`);
      return;
    }

    setCheckoutPlan(plan.id);
    try {
      const payment = await startRazorpayPayment(plan);
      setPaymentMessage(`${payment.plan.name} is active. Your subscription has been saved in Firebase.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Payment could not be completed.';
      setPaymentError(message);
    } finally {
      setCheckoutPlan(null);
    }
  };

  return (
    <div className="bg-background min-h-screen text-on-surface selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="w-50" />
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#workflow" className="hover:text-primary transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
        </div>

        <Link 
          to="/auth" 
          className="bg-primary text-on-primary px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Next-Gen Assessment Platform</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-on-surface">
            Master Your Next <br />
            <span className="text-primary italic">Engineering</span> Interview
          </h2>
          
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Personalized coding paths, AI-powered mock interviews, and deep resume intelligence to get you hired at elite tech companies.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/auth" 
              className="w-full sm:w-auto bg-primary text-on-primary px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 transition-transform flex items-center justify-center gap-3"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] border border-outline-variant hover:bg-surface-container transition-colors">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Floating Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-24">
          {[
            { label: 'Success Rate', val: '94%', icon: Trophy },
            { label: 'Active Learners', val: '40k+', icon: Users },
            { label: 'Mock Sessions', val: '1.2M', icon: MessageSquare },
            { label: 'Hiring Partners', val: '200+', icon: ShieldCheck }
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="bg-surface-container border border-outline-variant p-6 rounded-3xl"
            >
              <m.icon className="w-6 h-6 text-primary mb-4" />
              <h4 className="text-3xl font-black tracking-tighter">{m.val}</h4>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 md:px-12 bg-surface">
        <div className="max-w-7xl mx-auto">
          <header className="mb-20 text-center space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Core Intelligence</h3>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Everything you need to <span className="text-primary italic">excel</span></h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI Mock Interviews',
                desc: 'Real-time video and audio assessments with adaptive AI that probes your edge cases.',
                icon: Cpu,
                color: 'bg-indigo-500'
              },
              {
                title: 'Resume Intelligence',
                desc: 'Deep semantic analysis of your profile to match top-tier engineering mandates.',
                icon: ShieldCheck,
                color: 'bg-emerald-500'
              },
              {
                title: 'Adaptive Study Paths',
                desc: 'Dynamic curriculum that adjusts based on your performance and goals.',
                icon: Code2,
                color: 'bg-[#ff9800]'
              }
            ].map((f) => (
              <div key={f.title} className="p-8 bg-surface-container rounded-[32px] border border-outline-variant hover:border-primary/30 transition-all group">
                <div className={`${f.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-black/20`}>
                  <f.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-4">{f.title}</h4>
                <p className="text-on-surface-variant leading-relaxed text-sm">{f.desc}</p>
                <div className="mt-8 flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing/Premium Section */}
      <section id="pricing" className="py-32 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto space-y-20">
          <header className="text-center space-y-4 max-w-2xl mx-auto">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Simple Pricing</h3>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Invest in your <span className="text-primary italic">career</span> today</h2>
            <p className="text-on-surface-variant font-medium">Choose the plan that fits your current goals. Upgrade or downgrade anytime.</p>
          </header>

          {(paymentMessage || paymentError) && (
            <div className={`max-w-3xl mx-auto border p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
              paymentError
                ? 'bg-error-container/10 border-error/20 text-error'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
            }`}>
              {paymentError ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
              <span>{paymentError || paymentMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`border p-7 rounded-[28px] space-y-7 flex flex-col min-h-[520px] ${
                  plan.accent
                    ? 'bg-[#ff9800] border-[#ff9800] text-white shadow-2xl shadow-primary/25'
                    : 'bg-surface-container border-outline-variant'
                }`}
              >
                <div className="space-y-2">
                  <h4 className={`text-xl font-black ${plan.accent ? 'text-white' : 'text-on-surface'}`}>
                    {plan.name}
                  </h4>
                  <p className={`text-sm font-medium min-h-10 ${plan.accent ? 'text-white/80' : 'text-on-surface-variant'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black tracking-tighter ${plan.accent ? 'text-white' : 'text-on-surface'}`}>
                    {plan.priceLabel}
                  </span>
                  <span className={`font-bold text-sm ${plan.accent ? 'text-white/80' : 'text-on-surface-variant'}`}>
                    {plan.period}
                  </span>
                </div>

                <div className={`h-px ${plan.accent ? 'bg-white/60' : 'bg-outline-variant'}`} />

                <ul className="space-y-3 flex-1">
                  {plan.features.map(item => (
                    <li
                      key={item}
                      className={`flex items-start gap-3 text-xs font-bold leading-relaxed ${
                        plan.accent ? 'text-white/90' : 'text-on-surface-variant'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${plan.accent ? 'text-white' : 'text-primary'}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handlePlanClick(plan)}
                  disabled={checkoutPlan === plan.id}
                  className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.accent
                      ? 'bg-white text-[#ff9800] hover:brightness-95'
                      : plan.id === 'free'
                        ? 'border border-outline-variant hover:bg-surface-container-high'
                        : 'bg-primary text-on-primary hover:brightness-110 shadow-xl shadow-primary/20'
                  }`}
                >
                  {plan.id === 'free' ? (
                    'Get Started'
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      {checkoutPlan === plan.id ? 'Opening Checkout...' : `Buy ${plan.name}`}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 md:px-12 bg-surface border-t border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto">
          <FAQSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-5xl mx-auto rounded-[64px] bg-primary overflow-hidden relative p-12 md:p-24 text-center space-y-10">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] border-[40px] border-white rounded-full translate-x-1/2 -translate-y-1/2" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
              Ready to land your dream role?
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Join thousands of engineers who used PrepZify to transition into Lead and Senior roles at top companies.
            </p>
          </div>
          
          <Link 
            to="/auth" 
            className="inline-flex bg-white text-primary px-12 py-5 rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/10 hover:scale-105 active:scale-95 transition-all"
          >
            Get Infinite Access Now
          </Link>

          <footer className="pt-10 flex flex-wrap justify-center gap-6 text-white/60 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> No Credit Card Required</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> 14-Day Free Trial</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Cancel Anytime</div>
          </footer>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
