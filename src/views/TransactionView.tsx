import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { TransactionType } from '../types';

export function TransactionView({ type }: { type: 'income' | 'expense' }) {
  const { transactions, categories, paymentMethods, addTransaction, deleteTransaction, lang } = useAppStore();
  
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [note, setNote] = useState('');

  const t = {
    addIncome: lang === 'hi' ? 'आय जोड़ें' : lang === 'bn' ? 'আয় যোগ করুন' : 'Add Income',
    addExpense: lang === 'hi' ? 'व्यय जोड़ें' : lang === 'bn' ? 'ব্যয় যোগ করুন' : 'Add Expense',
    amountLabel: lang === 'hi' ? 'मात्रा (৳)' : lang === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)',
    dateLabel: lang === 'hi' ? 'तारीख' : lang === 'bn' ? 'তারিখ' : 'Date',
    categoryLabel: lang === 'hi' ? 'श्रेणी' : lang === 'bn' ? 'ক্যাটাগরি' : 'Category',
    paymentMethodLabel: lang === 'hi' ? 'भुगतान विधि' : lang === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method',
    select: lang === 'hi' ? 'चुनें' : lang === 'bn' ? 'নির্বাচন করুন' : 'Select',
    noteLabel: lang === 'hi' ? 'नोट (वैकल्पिक)' : lang === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Note (Optional)',
    notePlaceholder: lang === 'hi' ? 'विवरण लिखें...' : lang === 'bn' ? 'বিস্তারিত লিখুন...' : 'Enter details...',
    saveBtn: lang === 'hi' ? 'सहेजें' : lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save',
    recentIncome: lang === 'hi' ? 'हाल की आय' : lang === 'bn' ? 'সাম্প্রতিক আয় সমূহ' : 'Recent Income',
    recentExpense: lang === 'hi' ? 'हाल के व्यय' : lang === 'bn' ? 'সাম্প্রতিক ব্যয় সমূহ' : 'Recent Expenses',
    noData: lang === 'hi' ? 'कोई डेटा नहीं मिला' : lang === 'bn' ? 'কোনো ডাটা পাওয়া যায়নি' : 'No data found',
    unknown: lang === 'hi' ? 'अज्ञात' : lang === 'bn' ? 'অজানা' : 'Unknown',
  };

  const typeCategories = categories.filter((c) => c.type === type && c.enabled);
  const activePaymentMethods = paymentMethods.filter(p => p.enabled);

  const filteredTransactions = transactions
    .filter((t) => t.type === type)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let submitCategoryId = categoryId;
    if (type === 'income' && !submitCategoryId) {
      submitCategoryId = typeCategories[0]?.id || 'unknown';
    }

    if (!amount || !paymentMethodId || (type === 'expense' && !submitCategoryId)) return;

    addTransaction({
      type,
      amount: Number(amount),
      date,
      categoryId: submitCategoryId,
      paymentMethodId,
      note,
    });

    setAmount('');
    setNote('');
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || t.unknown;

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
        {type === 'income' ? t.addIncome : t.addExpense}
      </h2>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.amountLabel}</label>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.dateLabel}</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white shadow-sm"
                />
              </div>

              {type === 'expense' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.categoryLabel}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {typeCategories.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategoryId(c.id)}
                        className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
                          categoryId === c.id 
                            ? 'border-pink-500 bg-pink-50/50 dark:border-pink-500/50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400' 
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        } flex items-center justify-start gap-3 transition shadow-sm`}
                      >
                        <span className="text-sm sm:text-base font-semibold">
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={type === 'income' ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.paymentMethodLabel}</label>
                <select
                  required
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white appearance-none shadow-sm"
                >
                  <option value="">{t.select}</option>
                  {activePaymentMethods.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.noteLabel}</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white shadow-sm"
                placeholder={t.notePlaceholder}
              />
            </div>

            <button
              type="submit"
              className={`w-full flex justify-center items-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-full shadow-md text-sm font-bold text-white transition ${
                type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              }`}
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.saveBtn}
            </button>
          </form>
        </CardContent>
      </Card>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
        {type === 'income' ? t.recentIncome : t.recentExpense}
      </h3>

      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(t_item => (
            <div key={t_item.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-750">
              <div className="flex items-center gap-4">
                 <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-2xl flex items-center justify-center ${
                    type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
                  }`}>
                    {type === 'income' ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t_item.note || getCategoryName(t_item.categoryId)}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                    {getCategoryName(t_item.categoryId)} • {new Date(t_item.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric'})}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`font-bold text-base sm:text-lg ${type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {type === 'income' ? '+' : '-'}{formatBDT(t_item.amount)}
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
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">{t.noData}</p>
        )}
      </div>
    </div>
  );
}
