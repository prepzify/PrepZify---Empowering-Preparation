import React, { useState } from 'react';
import { useSubscription } from '../context/SubscriptionContext';
import { PRICING_PLANS } from '../services/paymentService';
import { X, Shield, Sparkles, CreditCard, Loader2, Check } from 'lucide-react';
import { startRazorpayPayment } from '../services/paymentService';

export const UpgradeModal: React.FC = () => {
  const { showUpgradeModal, upgradeFeatureReason, closeUpgradeModal } = useSubscription();
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!showUpgradeModal) return null;

  const handleUpgrade = async (plan: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    setCheckoutPlanId(plan.id);
    try {
      const res = await startRazorpayPayment(plan);
      setSuccessMsg(`Upgraded successfully! Enjoy ${res.plan.name} Tier features.`);
      setTimeout(() => {
        closeUpgradeModal();
        setSuccessMsg('');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment could not be completed.');
    } finally {
      setCheckoutPlanId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div 
        className="bg-[#1a1a20] border border-outline-variant/30 rounded-[32px] max-w-4xl w-full p-6 md:p-10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
        style={{ fontFamily: 'inherit' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        
        <button 
          onClick={closeUpgradeModal}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Premium Feature Lock</span>
          </div>
          
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none uppercase">Upgrade to Premium</h3>
          <p className="text-on-surface-variant text-sm max-w-lg mx-auto leading-relaxed">
            {upgradeFeatureReason || "You have reached a Free plan feature limit. Choose a subscription below to unlock unlimited capabilities."}
          </p>
        </div>

        {(successMsg || errorMsg) && (
          <div className={`border p-4 rounded-2xl flex items-center gap-3 text-xs font-bold mb-8 ${
            errorMsg
              ? 'bg-error-container/10 border-error/20 text-error'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
          }`}>
            {errorMsg ? <X className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
            <span>{errorMsg || successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.filter(p => p.id !== 'free').map((plan) => (
            <div 
              key={plan.id}
              className={`border p-6 rounded-3xl flex flex-col justify-between min-h-[360px] transition-all relative ${
                plan.accent 
                  ? 'bg-primary/5 border-primary/50 shadow-2xl shadow-primary/5' 
                  : 'bg-surface border-outline-variant/40'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-black text-base text-white">{plan.name}</h4>
                  {plan.accent && (
                    <span className="bg-primary text-black text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">Best Choice</span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed min-h-12">{plan.description}</p>
                <div className="flex items-baseline gap-1 py-2 border-b border-outline-variant/20">
                  <span className="text-3xl font-black text-white tracking-tighter">{plan.priceLabel}</span>
                  <span className="text-xs font-bold text-on-surface-variant">{plan.period}</span>
                </div>
                
                <ul className="space-y-2 pt-2 text-[10px] font-bold text-on-surface-variant">
                  {plan.features.slice(0, 3).map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={checkoutPlanId !== null || successMsg !== ''}
                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mt-6 flex items-center justify-center gap-2 ${
                  plan.accent 
                    ? 'bg-primary text-black hover:brightness-110 shadow-lg shadow-primary/20' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-outline-variant/30'
                }`}
              >
                {checkoutPlanId === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                {checkoutPlanId === plan.id ? 'Starting...' : `Buy ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center pt-8 text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-primary" /> Secure 256-bit SSL encrypted billing payments gateway
        </div>
      </div>
    </div>
  );
};
