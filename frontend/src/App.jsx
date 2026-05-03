import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import TestInterface from './pages/TestInterface';
import TestResult from './pages/TestResult';
import StudyPlan from './pages/StudyPlan';
import Interview from './pages/Interview';
import CompanyRecommendations from './pages/CompanyRecommendations';
import Chatbot from './pages/Chatbot';

// Layout wrapper for authenticated pages with Navbar
const AuthLayout = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen gradient-bg">
        <Navbar />
        {/* Main content area — offset for sidebar on desktop, topbar on mobile */}
        <main className="lg:ml-64 pt-20 lg:pt-6 px-4 lg:px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
};

// Redirect authenticated users away from auth pages
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><div className="spinner" /></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
          }}
        />

        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

          {/* Protected routes with sidebar layout */}
          <Route element={<AuthLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resume" element={<ResumeUpload />} />
            <Route path="/test" element={<TestInterface />} />
            <Route path="/test/result/:id" element={<TestResult />} />
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/companies" element={<CompanyRecommendations />} />
            <Route path="/chat" element={<Chatbot />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
