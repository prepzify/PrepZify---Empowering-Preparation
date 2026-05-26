import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Briefcase, 
  Clock,
  Video,
  History as HistoryIcon,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function LiveExpertBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    phoneNumber: '',
    domain: '',
    jobDetails: '',
    scheduledAt: '',
    preferredContact: 'whatsapp' as 'whatsapp' | 'insite'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const bookingData = {
        userId: auth.currentUser.uid,
        ...formData,
        scheduledAt: new Date(formData.scheduledAt),
        status: 'pending',
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, `users/${auth.currentUser.uid}/expertBookings`), bookingData);
      // Also update the id
      setSuccess(true);
    } catch (err) {
      console.error("Booking Error:", err);
      alert("Failed to book session. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    "2026-05-14T10:00", "2026-05-14T11:00", "2026-05-14T14:00", "2026-05-14T15:00",
    "2026-05-15T10:00", "2026-05-15T11:00", "2026-05-15T14:00", "2026-05-15T15:00"
  ];

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-surface-container rounded-3xl p-10 text-center space-y-6 border border-outline-variant shadow-2xl"
        >
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-on-surface uppercase tracking-tight">Booking Confirmed!</h2>
          <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
            Our career expert will reach out to you via {formData.preferredContact === 'whatsapp' ? 'WhatsApp' : 'our in-site platform'} at the scheduled time.
          </p>
          <div className="py-4 border-y border-outline-variant space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              <span>Time</span>
              <span className="text-on-surface">{new Date(formData.scheduledAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              <span>Method</span>
              <span className="text-on-surface uppercase">{formData.preferredContact}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-primary text-on-primary rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-all"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background p-6 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Expert Network</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-on-surface tracking-tighter">
            BOOK A LIVE <span className="text-indigo-400">MOCK INTERVIEW</span>
          </h1>
          <p className="text-on-surface-variant text-sm max-w-xl font-medium leading-relaxed">
            Connect with industry veterans to clear your technical doubts and experience a real-world interview scenario with personalized feedback.
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr,350px] gap-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <User size={12} /> Full Name
                    </label>
                    <input 
                      required
                      type="text" 
                      value={formData.userName}
                      onChange={e => setFormData({...formData, userName: e.target.value})}
                      className="w-full bg-surface-container border border-outline rounded-2xl p-4 text-on-surface font-medium focus:border-indigo-400/50 outline-none transition-all"
                      placeholder="e.g. Akib Ansari"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                      <Phone size={12} /> Phone Number
                    </label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full bg-surface-container border border-outline rounded-2xl p-4 text-on-surface font-medium focus:border-indigo-400/50 outline-none transition-all"
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <Briefcase size={12} /> Target Role / Domain
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.domain}
                    onChange={e => setFormData({...formData, domain: e.target.value})}
                    className="w-full bg-surface-container border border-outline rounded-2xl p-4 text-on-surface font-medium focus:border-indigo-400/50 outline-none transition-all"
                    placeholder="e.g. Backend Developer - Java/Spring"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
                    <HistoryIcon size={12} /> Job Details / Target Companies
                  </label>
                  <textarea 
                    value={formData.jobDetails}
                    onChange={e => setFormData({...formData, jobDetails: e.target.value})}
                    className="w-full bg-surface-container border border-outline rounded-2xl p-4 text-on-surface font-medium focus:border-indigo-400/50 outline-none transition-all min-h-[120px]"
                    placeholder="List specific roles or companies you're preparing for..."
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-indigo-500/20"
                  >
                    Select Time Slot <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Available Slots</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {timeSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({...formData, scheduledAt: slot})}
                        className={`p-4 rounded-xl border text-[10px] font-black transition-all ${
                          formData.scheduledAt === slot 
                           ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg' 
                           : 'bg-surface-container border-outline text-on-surface-variant hover:border-indigo-400/50'
                        }`}
                      >
                        {new Date(slot).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        <br />
                        {new Date(slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Preference for Interaction</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, preferredContact: 'whatsapp'})}
                      className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                        formData.preferredContact === 'whatsapp' 
                         ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg' 
                         : 'bg-surface-container border-outline text-on-surface-variant hover:border-indigo-400/50'
                      }`}
                    >
                      <MessageCircle size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, preferredContact: 'insite'})}
                      className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                        formData.preferredContact === 'insite' 
                         ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg' 
                         : 'bg-surface-container border-outline text-on-surface-variant hover:border-indigo-400/50'
                      }`}
                    >
                      <Video size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">In-Site Panel</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-surface-container-highest p-6 rounded-3xl border border-outline-variant">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-indigo-400 transition-colors"
                  >
                    Go Back
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || !formData.scheduledAt}
                    className="bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {loading ? 'Confirming...' : 'Book My Session'} <CheckCircle2 size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <aside className="space-y-6">
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-8 space-y-6">
               <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                 <Zap size={14} /> EXPERT BENEFITS
               </h4>
               <ul className="space-y-4">
                  {[
                    "1-on-1 Personalized Session",
                    "Real Industry Feedback",
                    "Resume Deep Dive",
                    "Behavioral Coaching",
                    "Domain Specific DSA Prep"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-[10px] font-bold text-on-surface-variant uppercase tracking-tight">
                       <CheckCircle2 size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                       {benefit}
                    </li>
                  ))}
               </ul>
            </div>

            <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                     <Clock size={20} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-on-surface uppercase tracking-widest">Next Available</h5>
                    <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-tight">Tomorrow @ 10:00 AM</p>
                  </div>
               </div>
               <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">
                 Sessions usually last 45-60 minutes including feedback and doubt clearing.
               </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
