import React from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowRight } from 'lucide-react';
import { ViewState } from '../types';

export function DashboardView({ onChangeView }: { onChangeView: (view: ViewState) => void }) {
  const { user, transactions } = useAppStore();

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">সুস্বাগতম, {user?.name.split(' ')[0]}! 👋</h2>
          <p className="text-slate-500 dark:text-slate-400">আজকের বাজার দর ও আপনার আর্থিক অবস্থা দেখুন।</p>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="relative">
            <input type="text" placeholder="খুঁজুন..." className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full py-2 px-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-64 text-slate-800 dark:text-slate-200 shadow-sm" />
            <span className="absolute left-4 top-2 opacity-40">🔍</span>
          </div>
          <button 
            onClick={() => onChangeView('income')}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <span>+</span> নতুন এন্ট্রি
          </button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between mb-4">
              <span className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg"><TrendingUp className="w-5 h-5"/></span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">মোট আয় (এই মাস)</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{formatBDT(totalIncome)}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
             <div className="flex justify-between mb-4">
              <span className="p-2 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg"><TrendingDown className="w-5 h-5"/></span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">মোট ব্যয় (এই মাস)</p>
            <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{formatBDT(totalExpense)}</h3>
          </CardContent>
        </Card>

        <Card className="bg-blue-600 dark:bg-blue-700 border-none text-white shadow-md">
          <CardContent className="p-6">
             <div className="flex justify-between mb-4">
              <span className="p-2 bg-white/20 rounded-lg"><Wallet className="w-5 h-5 text-white"/></span>
            </div>
            <p className="text-blue-100 text-sm">কারেন্ট ব্যালেন্স</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{formatBDT(balance)}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
             সাম্প্রতিক লেনদেন
          </h2>
          <button 
            onClick={() => onChangeView('history')}
            className="text-sm text-blue-600 dark:text-blue-400 font-semibold flex items-center hover:underline"
          >
            সব দেখুন <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
                  }`}>
                    {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{t.note || 'কোনো নোট নেই'}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase">
                      {new Date(t.date).toLocaleDateString('bn-BD', { month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {t.type === 'income' ? '+' : '-'} {formatBDT(t.amount)}
                </span>
              </div>
            ))
          ) : (
            <Card>
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                কোনো লেনদেন পাওয়া যায়নি
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
