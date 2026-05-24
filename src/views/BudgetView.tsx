import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Plus } from 'lucide-react';

export function BudgetView() {
  const { budgets, setBudget, categories, transactions } = useAppStore();
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const expenseCategories = categories.filter(c => c.type === 'expense' && c.enabled);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount) return;

    setBudget({
      categoryId,
      amount: Number(amount),
      month: selectedMonth
    });

    setCategoryId('');
    setAmount('');
  };

  const currentMonthBudgets = budgets.filter(b => b.month === selectedMonth);
  
  const currentMonthExpenses = transactions.filter(t => 
    t.type === 'expense' && t.date.startsWith(selectedMonth)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between flex-wrap gap-4 items-center mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">মাসিক বাজেট</h2>
        <input 
          type="month" 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white shadow-sm"
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ক্যাটাগরি</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white appearance-none shadow-sm"
              >
                <option value="">নির্বাচন করুন</option>
                {expenseCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">বাজেট (৳)</label>
              <input
                type="number" required min="0"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white shadow-sm"
                placeholder="0.00"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 hover:bg-blue-700 font-bold transition flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" /> সেট করুন
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-8">
        {currentMonthBudgets.length > 0 ? currentMonthBudgets.map(budget => {
          const category = categories.find(c => c.id === budget.categoryId);
          if (!category) return null;

          const spent = currentMonthExpenses
            .filter(t => t.categoryId === budget.categoryId)
            .reduce((sum, t) => sum + t.amount, 0);

          const progress = Math.min((spent / budget.amount) * 100, 100);
          const isOverBudget = spent > budget.amount;

          return (
            <Card key={budget.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{category.name}</h4>
                  <div className="text-right">
                    <span className={`font-bold text-base sm:text-lg ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                      {formatBDT(spent)}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm"> / {formatBDT(budget.amount)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-3 mb-2 overflow-hidden border border-white/50 dark:border-slate-600/50">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : progress > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {isOverBudget ? (
                      <span className="text-rose-600 dark:text-rose-400">বাজেট অতিক্রম করেছেন!</span>
                    ) : (
                      <span>আর {formatBDT(budget.amount - spent)} বাকি আছে</span>
                    )}
                  </p>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{progress.toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4">এই মাসে কোনো বাজেট সেট করা হয়নি</p>
        )}
      </div>
    </div>
  );
}
