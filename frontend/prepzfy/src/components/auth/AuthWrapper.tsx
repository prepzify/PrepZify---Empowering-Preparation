import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await login();
    } catch (err: any) {
      console.error("Login component error:", err);
      // Determine user-friendly message
      if (err.message?.includes('unauthorized-domain')) {
        setError("Domain PrepZfy.com is not authorized in Firebase Console yet.");
      } else {
        setError(err.message || "An unexpected error occurred during sign-in.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Initializing Placement Agent...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-indigo-100 p-10 text-center space-y-8"
        >
          <div className="mx-auto w-full flex justify-center">
            <img 
              src="/input_file_0.png" 
              alt="PrepZfy Logo" 
              className="h-24 w-auto object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as any).style.display = 'none';
                (e.target as any).nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden flex-col items-center gap-2">
              <div className="flex items-center">
                <span className="font-black text-5xl tracking-tighter text-[#0f4c81]">Prep</span>
                <span className="font-black text-5xl tracking-tighter text-[#fb923c]">Zfy</span>
              </div>
              <div className="h-0.5 w-12 bg-[#fb923c] rounded-full" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Empowering Preparation</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-500 font-medium">Master your technical interviews with AI-powered simulations and personalized roadmaps.</p>
          </div>

          <div className="grid gap-4 pt-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            <Button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold rounded-2xl gap-3 shadow-lg shadow-indigo-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Sign in with Google
                </>
              )}
            </Button>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Secure University Login Required</p>
          </div>

          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">1k+</div>
              <div className="text-[10px] text-gray-400 uppercase">Users</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">5k+</div>
              <div className="text-[10px] text-gray-400 uppercase">Mock Exams</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">85%</div>
              <div className="text-[10px] text-gray-400 uppercase">Success</div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
