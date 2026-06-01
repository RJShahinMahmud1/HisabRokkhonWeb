import React, { useState } from 'react';
import { useAppStore } from '../store';
import { signInWithGoogle } from '../lib/firebase';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function AuthView() {
  const { isDark } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'কিছু একটা ভুল হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center relative overflow-hidden font-sans transition-colors",
      isDark ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"
    )}>
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-10 m-4">
        <div className="text-center">
          <div className="mx-auto h-12 sm:h-16 w-12 sm:w-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
            <span className="text-2xl sm:text-3xl font-bold">৳</span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            হিসাব রক্ষক
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            আপনার ব্যক্তিগত আয়-ব্যয়ের হিসাব রাখুন সহজে
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {errorMsg && (
            <div className="p-3 text-sm bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl text-center">
              {errorMsg}
            </div>
          )}
          
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-bold rounded-2xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 focus:outline-none shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google দিয়ে লগইন করুন
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
