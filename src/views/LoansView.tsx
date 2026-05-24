import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, CheckCircle, Clock } from 'lucide-react';

export function LoansView() {
  const { loans, addLoan, updateLoan } = useAppStore();
  const [type, setType] = useState<'loan_given' | 'loan_taken'>('loan_given');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !amount) return;

    addLoan({
      type,
      personName,
      amount: Number(amount),
      repaidAmount: 0,
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate || undefined,
      note,
      status: 'active'
    });

    setPersonName('');
    setAmount('');
    setDueDate('');
    setNote('');
  };

  const activeLoans = loans.filter(l => l.status === 'active');
  const clearedLoans = loans.filter(l => l.status === 'cleared');

  const markCleared = (id: string) => {
    const loan = loans.find(l => l.id === id);
    if (loan) {
      updateLoan({ ...loan, status: 'cleared', repaidAmount: loan.amount });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">ধার / দেনা</h2>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ধরন</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white appearance-none shadow-sm"
                >
                  <option value="loan_given">কাউকে ধার দিয়েছি</option>
                  <option value="loan_taken">কারো থেকে ধার নিয়েছি</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ব্যক্তির নাম</label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white shadow-sm"
                  placeholder="নাম"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">পরিমাণ (৳)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white shadow-sm"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ফেরতের তারিখ (ঐচ্ছিক)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">নোট (ঐচ্ছিক)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white shadow-sm"
                placeholder="বিস্তারিত..."
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 rounded-full shadow-md text-sm font-bold text-white transition bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              যোগ করুন
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">বর্তমান ধার / দেনা</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeLoans.length > 0 ? (
            activeLoans.map(loan => (
              <Card key={loan.id} className={loan.type === 'loan_given' ? 'border-l-4 border-l-sky-500' : 'border-l-4 border-l-rose-500'}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">{loan.personName}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {loan.type === 'loan_given' ? 'আমি পাবো' : 'আমার কাছে পাবে'}
                      </p>
                      {loan.note && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{loan.note}</p>}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${loan.type === 'loan_given' ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatBDT(loan.amount)}
                      </p>
                      {loan.dueDate && (
                        <p className="text-xs text-slate-500 flex items-center justify-end mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(loan.dueDate).toLocaleDateString('bn-BD')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => markCleared(loan.id)}
                      className="flex items-center text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 px-4 py-2 rounded-xl transition-colors border border-emerald-100 dark:border-emerald-800/30 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      পরিশোধিত
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-slate-500 dark:text-slate-400 py-4">বর্তমানে কোনো ধার/দেনা নেই</p>
          )}
        </div>
      </div>
      
      {clearedLoans.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-4 px-2">পরিশোধিত</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
            {clearedLoans.map(loan => (
              <Card key={loan.id}>
                <CardContent className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-300 line-through">{loan.personName}</h4>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" /> পরিশোধিত
                    </span>
                  </div>
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {formatBDT(loan.amount)}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
