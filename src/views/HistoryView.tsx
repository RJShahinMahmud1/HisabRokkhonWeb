import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Trash2, Search, TrendingUp, TrendingDown } from 'lucide-react';

export function HistoryView() {
  const { transactions, categories, deleteTransaction, historySearchTerm, setHistorySearchTerm, lang } = useAppStore();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const t = {
    allTransactions: lang === 'hi' ? 'सभी लेनदेन' : lang === 'bn' ? 'সকল লেনদেন' : 'All Transactions',
    searchPlaceholder: lang === 'hi' ? 'खोजें...' : lang === 'bn' ? 'খুঁজুন...' : 'Search...',
    allTypes: lang === 'hi' ? 'सभी प्रकार' : lang === 'bn' ? 'সব ধরন' : 'All Types',
    income: lang === 'hi' ? 'आय' : lang === 'bn' ? 'আয়' : 'Income',
    expense: lang === 'hi' ? 'व्यय' : lang === 'bn' ? 'ব্যয়' : 'Expense',
    noData: lang === 'hi' ? 'कोई डेटा नहीं मिला' : lang === 'bn' ? 'কোনো তথ্য পাওয়া যায়নি' : 'No transactions found',
    unknown: lang === 'hi' ? 'अज्ञात' : lang === 'bn' ? 'অজানা' : 'Unknown',
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || t.unknown;

  const filtered = transactions
    .filter(t_item => filterType === 'all' || t_item.type === filterType)
    .filter(t_item => {
      const catName = getCategoryName(t_item.categoryId).toLowerCase();
      const note = (t_item.note || '').toLowerCase();
      const q = historySearchTerm.toLowerCase();
      return catName.includes(q) || note.includes(q);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">{t.allTransactions}</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder={t.searchPlaceholder}
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
          <option value="all">{t.allTypes}</option>
          <option value="income">{t.income}</option>
          <option value="expense">{t.expense}</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map(t_item => (
            <div key={t_item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-750">
              <div className="flex items-center gap-4">
                 <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-2xl flex items-center justify-center ${
                    t_item.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
                  }`}>
                    {t_item.type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t_item.note || getCategoryName(t_item.categoryId)}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                    {getCategoryName(t_item.categoryId)} • {new Date(t_item.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-bold text-base sm:text-lg hidden sm:inline ${t_item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {t_item.type === 'income' ? '+' : '-'}{formatBDT(t_item.amount)}
                </span>
                <span className={`font-bold sm:hidden ${t_item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatBDT(t_item.amount)}
                </span>
                <button 
                  onClick={() => deleteTransaction(t_item.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-slate-100 dark:bg-slate-700 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            {t.noData}
          </div>
        )}
      </div>
    </div>
  );
}
