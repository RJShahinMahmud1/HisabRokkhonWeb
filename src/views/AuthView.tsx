import React, { useState } from 'react';
import { useAppStore } from '../store';
import { signInWithGoogle, signUpWithEmail, loginWithEmail } from '../lib/firebase';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function AuthView() {
  const { isDark } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) return;
    
    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name || 'User');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'কিছু একটা ভুল হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/popup-blocked') {
        setErrorMsg('ব্রাউজার পপআপ ব্লক করেছে। দয়া করে পপআপ অ্যালাউ করুন অথবা "Open in New Tab" বাটনে ক্লিক করে নতুন ট্যাবে ট্রাই করুন।');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Firebase Console-এ আপনার ডোমেইনটি যুক্ত নেই। Firebase -> Authentication -> Settings -> Authorized Domains-এ গিয়ে আপনার ওয়েবসাইটের লিংক যুক্ত করুন।');
      } else {
        setErrorMsg(err.message || 'কিছু একটা ভুল হয়েছে');
      }
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
        <div className="text-center flex flex-col items-center">
          <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-lg shadow-blue-200 dark:shadow-blue-900/20 bg-white ring-1 ring-slate-100 dark:ring-slate-700">
            <img src="/logo.png" alt="Hisab Rokkhok Logo" className="w-full h-full object-cover" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }} />
            <div className="hidden w-full h-full bg-blue-600 text-white flex items-center justify-center">
              <span className="text-4xl font-bold">৳</span>
            </div>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            হিসাব রক্ষক
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium tracking-wide">
            স্মার্ট অর্থ ব্যবস্থাপনা
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {errorMsg && (
            <div className="p-3 text-sm bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="sr-only">নাম</label>
                  <input
                    id="name"
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none sm:text-sm"
                    placeholder="আপনার নাম"
                  />
                </div>
              )}
              <div>
                <label htmlFor="email-address" className="sr-only">ইমেইল</label>
                <input
                  id="email-address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none sm:text-sm"
                  placeholder="ইমেইল এড্রেস"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">পাসওয়ার্ড</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="appearance-none block w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 outline-none sm:text-sm"
                  placeholder="পাসওয়ার্ড"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 sm:py-3 px-3 sm:px-4 text-sm font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none shadow-md shadow-blue-500/20 transition-colors disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট খুলুন')}
              </button>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                disabled={loading}
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                {isLogin ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন'}
              </button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">অথবা</span>
            </div>
          </div>
          
          <button
            type="button"
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
