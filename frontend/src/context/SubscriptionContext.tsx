import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, auth, db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

export type PlanId = 'free' | 'pro' | 'pro-plus' | 'elite';

export interface SubscriptionData {
  userId: string;
  status: 'active' | 'inactive';
  planId: Exclude<PlanId, 'free'>;
  planName: string;
  provider: string;
  paymentId: string;
  orderId: string;
  startedAt: any;
  expiresAt: any;
}

export interface UserUsage {
  codingCount: number;
  codingLastReset: string;
  interviewCount: number;
  interviewLastReset: string;
  resumeCount: number;
  resumeLastReset: string;
}

export const LIMITS: Record<PlanId, { interview: number; resume: number; coding: number; chats: number }> = {
  free: {
    interview: 1,  // 1 per week
    resume: 2,     // 2 per month
    coding: 3,     // 3 per day
    chats: 15,
  },
  pro: {
    interview: 5,  // 5 per week
    resume: Infinity,
    coding: Infinity,
    chats: 300,
  },
  'pro-plus': {
    interview: 20, // 20 per week
    resume: Infinity,
    coding: Infinity,
    chats: Infinity,
  },
  elite: {
    interview: 100, // 100 per week
    resume: Infinity,
    coding: Infinity,
    chats: Infinity,
  },
};

interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  resetPeriod: 'day' | 'week' | 'month';
}

interface SubscriptionContextType {
  planId: PlanId;
  subscription: SubscriptionData | null;
  usage: UserUsage;
  loading: boolean;
  isPro: boolean;
  isProPlus: boolean;
  isElite: boolean;
  showUpgradeModal: boolean;
  upgradeFeatureReason: string | null;
  triggerUpgrade: (featureReason: string | null) => void;
  closeUpgradeModal: () => void;
  checkLimit: (feature: 'interview' | 'resume' | 'coding') => LimitCheckResult;
  incrementUsage: (feature: 'interview' | 'resume' | 'coding') => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const getTodayString = () => new Date().toDateString();

const getWeekString = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diff));
  return monday.toDateString();
};

const getMonthString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
};

const DEFAULT_USAGE: UserUsage = {
  codingCount: 0,
  codingLastReset: getTodayString(),
  interviewCount: 0,
  interviewLastReset: getWeekString(),
  resumeCount: 0,
  resumeLastReset: getMonthString(),
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [usage, setUsage] = useState<UserUsage>(DEFAULT_USAGE);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeatureReason, setUpgradeFeatureReason] = useState<string | null>(null);
  const [currentUid, setCurrentUid] = useState<string | null>(null);

  // Expose subscription tier helpers
  const planId: PlanId = subscription?.status === 'active' ? subscription.planId : 'free';
  const isPro = planId !== 'free';
  const isProPlus = planId === 'pro-plus' || planId === 'elite';
  const isElite = planId === 'elite';

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUid(user.uid);
      } else {
        setCurrentUid(null);
        setSubscription(null);
        setUsage(DEFAULT_USAGE);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUid) return;

    setLoading(true);

    // 1. Listen to subscription current document
    const subRef = doc(db, 'users', currentUid, 'subscriptions', 'current');
    const unsubSub = onSnapshot(subRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SubscriptionData;
        // Verify expiry in real-time client side
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        if (expiresAt > new Date() && data.status === 'active') {
          setSubscription(data);
        } else {
          setSubscription(null);
        }
      } else {
        setSubscription(null);
      }
      setLoading(false);
    }, (err) => {
      console.warn('Subscription listener error:', err);
      setSubscription(null);
      setLoading(false);
    });

    // 2. Listen to user document for stats and usage counters
    const userRef = doc(db, 'users', currentUid);
    const unsubUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userUsage: UserUsage = {
          codingCount: data.usageCodingCount ?? 0,
          codingLastReset: data.usageCodingLastReset ?? getTodayString(),
          interviewCount: data.usageInterviewsCount ?? 0,
          interviewLastReset: data.usageInterviewsLastReset ?? getWeekString(),
          resumeCount: data.usageResumeCount ?? 0,
          resumeLastReset: data.usageResumeLastReset ?? getMonthString(),
        };
        setUsage(userUsage);
      } else {
        setUsage(DEFAULT_USAGE);
      }
    }, (err) => {
      console.warn('User stats/usage listener error:', err);
    });

    return () => {
      unsubSub();
      unsubUser();
    };
  }, [currentUid]);

  const triggerUpgrade = (featureReason: string | null) => {
    setUpgradeFeatureReason(featureReason);
    setShowUpgradeModal(true);
  };

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
    setUpgradeFeatureReason(null);
  };

  const checkLimit = (feature: 'interview' | 'resume' | 'coding'): LimitCheckResult => {
    const limits = LIMITS[planId];
    
    if (feature === 'coding') {
      const resetStr = getTodayString();
      const current = usage.codingLastReset === resetStr ? usage.codingCount : 0;
      const limit = limits.coding;
      return {
        allowed: current < limit,
        current,
        limit,
        resetPeriod: 'day',
      };
    }

    if (feature === 'interview') {
      const resetStr = getWeekString();
      const current = usage.interviewLastReset === resetStr ? usage.interviewCount : 0;
      const limit = limits.interview;
      return {
        allowed: current < limit,
        current,
        limit,
        resetPeriod: 'week',
      };
    }

    // resume
    const resetStr = getMonthString();
    const current = usage.resumeLastReset === resetStr ? usage.resumeCount : 0;
    const limit = limits.resume;
    return {
      allowed: current < limit,
      current,
      limit,
      resetPeriod: 'month',
    };
  };

  const incrementUsage = async (feature: 'interview' | 'resume' | 'coding') => {
    if (!currentUid) {
      // Local fallback for guests
      if (feature === 'coding') {
        setUsage((prev) => ({ ...prev, codingCount: prev.codingCount + 1 }));
      } else if (feature === 'interview') {
        setUsage((prev) => ({ ...prev, interviewCount: prev.interviewCount + 1 }));
      } else {
        setUsage((prev) => ({ ...prev, resumeCount: prev.resumeCount + 1 }));
      }
      return;
    }

    const userRef = doc(db, 'users', currentUid);
    
    if (feature === 'coding') {
      const today = getTodayString();
      const resetCount = usage.codingLastReset === today ? usage.codingCount : 0;
      await updateDoc(userRef, {
        usageCodingCount: resetCount + 1,
        usageCodingLastReset: today,
      }).catch(async () => {
        // Fallback merge write if document isn't fully structured
        await setDoc(userRef, {
          usageCodingCount: resetCount + 1,
          usageCodingLastReset: today,
        }, { merge: true });
      });
      return;
    }

    if (feature === 'interview') {
      const week = getWeekString();
      const resetCount = usage.interviewLastReset === week ? usage.interviewCount : 0;
      await updateDoc(userRef, {
        usageInterviewsCount: resetCount + 1,
        usageInterviewsLastReset: week,
      }).catch(async () => {
        await setDoc(userRef, {
          usageInterviewsCount: resetCount + 1,
          usageInterviewsLastReset: week,
        }, { merge: true });
      });
      return;
    }

    // resume
    const month = getMonthString();
    const resetCount = usage.resumeLastReset === month ? usage.resumeCount : 0;
    await updateDoc(userRef, {
      usageResumeCount: resetCount + 1,
      usageResumeLastReset: month,
    }).catch(async () => {
      await setDoc(userRef, {
        usageResumeCount: resetCount + 1,
        usageResumeLastReset: month,
      }, { merge: true });
    });
  };

  return (
    <SubscriptionContext.Provider
      value={{
        planId,
        subscription,
        usage,
        loading,
        isPro,
        isProPlus,
        isElite,
        showUpgradeModal,
        upgradeFeatureReason,
        triggerUpgrade,
        closeUpgradeModal,
        checkLimit,
        incrementUsage,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
