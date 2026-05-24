import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { TransactionType } from '../types';

export function TransactionView({ type }: { type: 'income' | 'expense' }) {
  const { transactions, categories, paymentMethods, addTransaction, deleteTransaction } = useAppStore();
  
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [note, setNote] = useState('');

  const typeCategories = categories.filter((c) => c.type === type && c.enabled);
  const activePaymentMethods = paymentMethods.filter(p => p.enabled);

  const filteredTransactions = transactions
    .filter((t) => t.type === type)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId || !paymentMethodId) return;

    addTransaction({
      type,
      amount: Number(amount),
      date,
      categoryId,
      paymentMethodId,
      note,
    });

    setAmount('');
    setNote('');
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
        {type === 'income' ? 'আয় যোগ করুন' : 'ব্যয় যোগ করুন'}
      </h2>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white shadow-sm"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">তারিখ</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ক্যাটাগরি</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white appearance-none shadow-sm"
                >
                  <option value="">নির্বাচন করুন</option>
                  {typeCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">পেমেন্ট মেথড</label>
                <select
                  required
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white appearance-none shadow-sm"
                >
                  <option value="">নির্বাচন করুন</option>
                  {activePaymentMethods.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">নোট (ঐচ্ছিক)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white shadow-sm"
                placeholder="বিস্তারিত লিখুন..."
              />
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center items-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-full shadow-md text-sm font-bold text-white transition ${
                type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              <Plus className="w-5 h-5 mr-2" />
              সংরক্ষণ করুন
            </button>
          </form>
        </CardContent>
      </Card>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
        সাম্প্রতিক {type === 'income' ? 'আয়' : 'ব্যয়'} সমূহ
      </h3>

      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-750">
              <div className="flex items-center gap-4">
                 <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-2xl flex items-center justify-center ${
                    type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
                  }`}>
                    {type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t.note || getCategoryName(t.categoryId)}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                    {getCategoryName(t.categoryId)} • {new Date(t.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric'})}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-bold text-base sm:text-lg ${type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {type === 'income' ? '+' : '-'}{formatBDT(t.amount)}
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
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">কোনো ডাটা পাওয়া যায়নি</p>
        )}
      </div>
    </div>
  );
}
