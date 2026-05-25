import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Trash2, Search, TrendingUp, TrendingDown } from 'lucide-react';

export function HistoryView() {
  const { transactions, categories, deleteTransaction, historySearchTerm, setHistorySearchTerm } = useAppStore();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  const filtered = transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => {
      const catName = getCategoryName(t.categoryId).toLowerCase();
      const note = (t.note || '').toLowerCase();
      const q = historySearchTerm.toLowerCase();
      return catName.includes(q) || note.includes(q);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">সকল লেনদেন</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="খুঁজুন..."
            value={historySearchTerm}
            onChange={(e) => setHistorySearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
          />
        </div>
        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none w-full md:w-48 appearance-none dark:text-white shadow-sm"
        >
          <option value="all">সব ধরন</option>
          <option value="income">আয়</option>
          <option value="expense">ব্যয়</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-750">
              <div className="flex items-center gap-4">
                 <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-2xl flex items-center justify-center ${
                    t.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
                  }`}>
                    {t.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.note || getCategoryName(t.categoryId)}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                    {getCategoryName(t.categoryId)} • {new Date(t.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-bold text-base sm:text-lg hidden sm:inline ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatBDT(t.amount)}
                </span>
                <span className={`font-bold sm:hidden ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatBDT(t.amount)}
                </span>
                <button 
                  onClick={() => deleteTransaction(t.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-100 dark:bg-slate-700 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            কোনো তথ্য পাওয়া যায়নি
          </div>
        )}
      </div>
    </div>
  );
}
