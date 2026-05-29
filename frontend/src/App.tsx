/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, auth } from './lib/firebase';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';

import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InterviewAI from './components/InterviewAI';
import PracticeQuestions from './components/PracticeQuestions';
import StudyPaths from './components/StudyPaths';
import ResumeCheck from './components/ResumeCheck';
import ResumeBuilder from './components/ResumeBuilder';
import CampusPlanner from './components/CampusPlanner';
import Settings from './components/Settings';
import Support from './components/Support';
import QuickPrepAssessment from './components/QuickPrepAssessment';
import LiveExpertBooking from './components/LiveExpertBooking';
import InterviewHistory from './components/InterviewHistory';
import LandingPage from './components/LandingPage';
import FAQPage from './components/FAQPage';
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import RefundPolicy from './components/RefundPolicy';
import { ThemeProvider } from './context/ThemeContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { UpgradeModal } from './components/UpgradeModal';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return null;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suppress benign Vite environment errors
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || event.reason || "";
      if (
        msg.includes('WebSocket') || 
        msg.includes('failed to connect to websocket')
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant animate-pulse">Syncing Session...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <UpgradeModal />
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
            <Route path="/terms" element={<div className="p-4 md:p-8 lg:p-12 min-h-screen bg-background"><TermsAndConditions /></div>} />
            <Route path="/privacy" element={<div className="p-4 md:p-8 lg:p-12 min-h-screen bg-background"><PrivacyPolicy /></div>} />
            <Route path="/refund" element={<div className="p-4 md:p-8 lg:p-12 min-h-screen bg-background"><RefundPolicy /></div>} />

            {/* Protected Dashboard Routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/interview" element={<InterviewAI />} />
                    <Route path="/code" element={<PracticeQuestions />} />
                    <Route path="/paths" element={<StudyPaths />} />
                    <Route path="/resume" element={<ResumeCheck />} />
                    <Route path="/resume-builder" element={<ResumeBuilder />} />
                    <Route path="/campus-plan" element={<CampusPlanner />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/quick-prep" element={<QuickPrepAssessment />} />
                    <Route path="/expert" element={<LiveExpertBooking />} />
                    <Route path="/interviews/history" element={<InterviewHistory />} />
                    {/* Fallback for protected routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}
