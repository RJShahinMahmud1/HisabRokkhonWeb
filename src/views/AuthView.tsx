import React, { useState } from 'react';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabase';
import { Wallet, Loader2 } from 'lucide-react';
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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { name: name || 'User' } }
        });
        if (error) throw error;
        // If no error, we probably signed up
        if (errorMsg === '') {
           setErrorMsg('অ্যাকাউন্ট তৈরি হয়েছে! দয়া করে ইমেইল ভেরিফাই করুন (অথবা আপনার Supabase থেকে ইমেইল ভেরিফিকেশন বন্ধ করুন)।');
        }
      }
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
            হিসাব রক্ষক (Supabase)
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            আপনার ব্যক্তিগত আয়-ব্যয়ের হিসাব রাখুন সহজে
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="p-3 text-sm bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl">
              {errorMsg}
            </div>
          )}
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
      </div>
    </div>
  );
}
