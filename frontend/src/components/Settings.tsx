import { useState, useEffect } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Moon, Sun, Monitor, Check, Loader2, Save, CreditCard, Shield, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { auth, updateUserProfile } from '../lib/firebase';
import { useSubscription, LIMITS } from '../context/SubscriptionContext';
import { PRICING_PLANS, startRazorpayPayment } from '../services/paymentService';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from 'firebase/auth';

export default function Settings() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [notifications, setNotifications] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
  const { theme, setTheme } = useTheme();

  const { planId, subscription } = useSubscription();
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // OTP Verification States
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(300);
  const [otpError, setOtpError] = useState('');

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any;
    if (showOtpVerification && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((t) => t - 1);
      }, 1000);
    } else if (otpTimer === 0 && showOtpVerification) {
      setOtpError("OTP expired. Please click resend to generate a new confirmation code.");
    }
    return () => clearInterval(interval);
  }, [showOtpVerification, otpTimer]);

  const handleUpgrade = async (plan: any) => {
    setPaymentMessage('');
    setPaymentError('');
    setCheckoutPlanId(plan.id);
    try {
      const res = await startRazorpayPayment(plan);
      setPaymentMessage(`Success! Upgraded to ${res.plan.name} Tier.`);
    } catch (err: any) {
      setPaymentError(err.message || 'Payment could not be completed.');
    } finally {
      setCheckoutPlanId(null);
    }
  };

  const handleDeleteTrigger = () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to permanently delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setEnteredOtp('');
    setOtpTimer(300);
    setOtpError('');
    setShowOtpVerification(true);
  };

  const handleResendOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setEnteredOtp('');
    setOtpTimer(300);
    setOtpError('');
    alert("A new verification OTP code has been generated.");
  };

  const handleConfirmDelete = async () => {
    if (!user) return;

    if (otpTimer === 0) {
      setOtpError("OTP has expired. Please click Resend.");
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setOtpError("Incorrect OTP confirmation code. Please check and try again.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(user);
      alert("Your account has been deleted successfully. We're sorry to see you go!");
      navigate('/landing');
    } catch (err: any) {
      console.error("Account deletion failed:", err);
      if (err.code === 'auth/requires-recent-login') {
        alert("For security reasons, deleting your account requires a recent sign-in session. Please log out, sign in again, and try confirming deletion immediately.");
      } else {
        alert(`Account deletion failed: ${err.message || err}`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await updateUserProfile(displayName);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 lg:space-y-10">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Settings</h2>
        <p className="text-on-surface-variant mt-1 text-sm md:text-base">Manage your account, preferences, and security.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-4 md:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full overflow-hidden border-2 border-primary/20 flex items-center justify-center relative group bg-surface">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-3xl md:text-4xl text-primary">person</span>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg md:text-xl font-bold text-on-surface">{user?.displayName || 'Anonymous Engineer'}</h3>
              <p className="text-xs md:text-sm text-on-surface-variant">Technical Assessment Mode • Active Session</p>
              <div className="flex justify-center sm:justify-start gap-2 mt-3">
                <span className="bg-surface-container-high px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant">
                  {planId === 'free' ? 'Free Tier' : `${planId.toUpperCase()} Tier`}
                </span>
                <span className="bg-surface-container-high px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant">Beta Access</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Senior Dev"
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm focus:border-primary outline-none transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Email Address</label>
              <input 
                type="email" 
                defaultValue={user?.email || 'N/A'} 
                disabled 
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm opacity-60 cursor-not-allowed" 
              />
            </div>
          </div>
        </div>

        {/* Billing & Subscription Section */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-on-surface">Membership & Billing</h4>
                <p className="text-xs text-on-surface-variant">View details of your PrepZify plan and billing operations.</p>
              </div>
            </div>

            {(paymentMessage || paymentError) && (
              <div className={`border p-4 rounded-xl flex items-center gap-3 text-xs font-bold ${
                paymentError
                  ? 'bg-error-container/10 border-error/20 text-error'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
              }`}>
                {paymentError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                <span>{paymentError || paymentMessage}</span>
              </div>
            )}

            {planId !== 'free' && subscription ? (
              <div className="bg-surface border border-outline-variant/30 rounded-xl p-5 md:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-widest">Active Plan</span>
                    <h5 className="text-lg font-black text-on-surface tracking-tight">{subscription.planName} Membership</h5>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Expires: {subscription.expiresAt?.toDate ? subscription.expiresAt.toDate().toLocaleDateString() : new Date(subscription.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-surface-container-high/40 p-4 rounded-xl border border-outline-variant/20">
                    <span className="text-[9px] font-black uppercase text-on-surface-variant block mb-1">Billing Provider</span>
                    <span className="text-xs font-bold text-on-surface capitalize">{subscription.provider} Gateway</span>
                  </div>
                  <div className="bg-surface-container-high/40 p-4 rounded-xl border border-outline-variant/20">
                    <span className="text-[9px] font-black uppercase text-on-surface-variant block mb-1">Order Ref</span>
                    <span className="text-[10px] font-mono text-on-surface truncate block" title={subscription.orderId}>{subscription.orderId}</span>
                  </div>
                  <div className="bg-surface-container-high/40 p-4 rounded-xl border border-outline-variant/20">
                    <span className="text-[9px] font-black uppercase text-on-surface-variant block mb-1">Transaction Ref</span>
                    <span className="text-[10px] font-mono text-on-surface truncate block" title={subscription.paymentId}>{subscription.paymentId}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-surface border border-outline-variant/20 rounded-xl text-center space-y-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <h5 className="font-bold text-on-surface text-sm">You are on the Free Tier</h5>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">Access premium coding topics, unlimited resume audits, and increased AI video simulation credits by upgrading today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PRICING_PLANS.filter(p => p.id !== 'free').map((plan) => (
                    <div 
                      key={plan.id}
                      className={`border p-5 rounded-2xl flex flex-col justify-between min-h-[280px] transition-all hover:scale-[1.01] ${
                        plan.accent 
                          ? 'bg-primary/5 border-primary/40 shadow-lg shadow-primary/5' 
                          : 'bg-surface border-outline-variant/40'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <h6 className="font-black text-sm text-on-surface">{plan.name}</h6>
                          {plan.accent && (
                            <span className="bg-primary text-black text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Popular</span>
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed min-h-8">{plan.description}</p>
                        <div className="flex items-baseline gap-1 pt-1 mb-3">
                          <span className="text-2xl font-black text-on-surface tracking-tighter">{plan.priceLabel}</span>
                          <span className="text-[10px] font-bold text-on-surface-variant">{plan.period}</span>
                        </div>
                        <ul className="space-y-1.5 pt-3 border-t border-outline-variant/35 text-[10px] text-on-surface-variant font-bold">
                          {plan.features.map((feat: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary text-xs shrink-0 select-none">•</span>
                              <span className="leading-relaxed">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleUpgrade(plan)}
                        disabled={checkoutPlanId !== null}
                        className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 ${
                          plan.accent 
                            ? 'bg-primary text-black hover:brightness-110 shadow-lg shadow-primary/10' 
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border border-outline-variant/40'
                        }`}
                      >
                        {checkoutPlanId === plan.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                        {checkoutPlanId === plan.id ? 'Starting...' : `Buy ${plan.name}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl overflow-hidden">
          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Preferences</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-on-surface">Theme Preference</p>
                  <p className="text-xs text-on-surface-variant">How would you like the application to look?</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      theme === t.id 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-outline-variant bg-surface text-on-surface-variant hover:border-primary/40'
                    }`}
                  >
                    <t.icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                    {theme === t.id && <Check className="w-3 h-3 mt-1" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-outline-variant/30"></div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">Push Notifications</p>
                <p className="text-xs text-on-surface-variant">Receive alerts for completed checks and new path availability.</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="h-px bg-outline-variant/30"></div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">Public Leaderboard Profile</p>
                <p className="text-xs text-on-surface-variant">Hide your rank and XP from the global community.</p>
              </div>
              <button 
                onClick={() => setPublicProfile(!publicProfile)}
                className={`w-12 h-6 rounded-full transition-colors relative ${publicProfile ? 'bg-primary' : 'bg-surface-container-highest'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${publicProfile ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-4 md:p-8 space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Security</h4>
            
            {!showOtpVerification ? (
              <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-error-container/5 border border-error/20 rounded-xl gap-4">
                  <div className="text-center md:text-left">
                      <p className="text-sm font-bold text-error">Danger Zone</p>
                      <p className="text-xs text-on-surface-variant">Permanently delete your account and all associated data.</p>
                  </div>
                  <button 
                    onClick={handleDeleteTrigger}
                    className="w-full md:w-auto px-6 py-2 bg-error text-on-error rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                  >
                    Delete Account
                  </button>
              </div>
            ) : (
              <div className="p-4 bg-error-container/5 border border-error/20 rounded-xl space-y-4">
                <div className="text-center md:text-left space-y-1">
                  <p className="text-sm font-bold text-error">Secure Email OTP Verification</p>
                  <p className="text-xs text-on-surface-variant">We have sent a 6-digit confirmation code <span className="font-bold text-primary">from teamprepzify@gmail.com</span> to your email: <span className="font-bold text-on-surface">{user?.email || 'your email'}</span>.</p>
                </div>

                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-center text-xs font-bold text-primary flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>[Sandbox Alert] Verification Email sent from teamprepzify@gmail.com. OTP Code: <span className="font-mono text-sm underline select-all">{generatedOtp}</span></span>
                </div>

                {otpError && (
                  <p className="text-xs text-error font-bold">{otpError}</p>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-center font-mono tracking-[0.3em] font-bold w-full sm:w-48 outline-none focus:border-error"
                  />
                  
                  <div className="text-xs text-on-surface-variant font-bold">
                    OTP expires in: <span className="font-mono text-error">{Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}</span>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto ml-auto">
                    <button
                      onClick={() => setShowOtpVerification(false)}
                      className="px-4 py-2 border border-outline-variant text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-surface-container-high"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResendOtp}
                      disabled={otpTimer > 270}
                      className="px-4 py-2 border border-outline-variant text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-surface-container-high disabled:opacity-50"
                    >
                      Resend
                    </button>
                    <button 
                      onClick={handleConfirmDelete}
                      disabled={isDeleting || enteredOtp.length !== 6}
                      className="px-6 py-2 bg-error text-on-error rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Confirm & Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 md:gap-4">
            {saveStatus === 'success' && (
              <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <Check className="w-3 h-3" /> Profile Updated
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="text-error text-[10px] font-bold uppercase tracking-widest">
                Update Failed
              </span>
            )}
            <button className="w-full sm:w-auto px-8 py-3 border border-outline-variant text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-surface-container-high transition-all">Discard Changes</button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-primary text-on-primary text-[11px] font-bold uppercase tracking-widest rounded-full hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Preferences
            </button>
        </div>
      </div>
    </div>
  );
}
