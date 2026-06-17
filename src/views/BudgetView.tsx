import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function BudgetView() {
  const { budgets, setBudget, deleteBudget, categories, transactions, lang } = useAppStore();
  
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  // States for budget editing
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const t = {
    monthlyBudget: lang === 'hi' ? 'मासिक बजट' : lang === 'bn' ? 'মাসিক বাজেট' : 'Monthly Budget',
    category: lang === 'hi' ? 'श्रेणी' : lang === 'bn' ? 'ক্যাটাগরি' : 'Category',
    selectCategory: lang === 'hi' ? 'चुनें' : lang === 'bn' ? 'নির্বাচন করুন' : 'Select Category',
    budgetLabel: lang === 'hi' ? 'बजट (৳)' : lang === 'bn' ? 'বাজেট (৳)' : 'Budget (৳)',
    setBudgetBtn: lang === 'hi' ? 'सेट करें' : lang === 'bn' ? 'সেট করুন' : 'Set Budget',
    budgetEdit: lang === 'hi' ? 'बजट संशोधन' : lang === 'bn' ? 'বাজেট সংশোধন' : 'Edit Budget',
    newBudgetAmount: lang === 'hi' ? 'नया बजट राशि (৳)' : lang === 'bn' ? 'নতুন বাজেট পরিমাণ (৳)' : 'New Budget Amount (৳)',
    cancel: lang === 'hi' ? 'रद्द करें' : lang === 'bn' ? 'বাতিল' : 'Cancel',
    update: lang === 'hi' ? 'अपडेट' : lang === 'bn' ? 'আপডেট' : 'Update',
    edit: lang === 'hi' ? 'संपादित करें' : lang === 'bn' ? 'এডিট' : 'Edit',
    deleteLabel: lang === 'hi' ? 'हटाएं' : lang === 'bn' ? 'মুছুন' : 'Delete',
    confirm: lang === 'hi' ? 'पक्का?' : lang === 'bn' ? 'নিশ্চিত?' : 'Confirm?',
    yes: lang === 'hi' ? 'हाँ' : lang === 'bn' ? 'হ্যাঁ' : 'Yes',
    no: lang === 'hi' ? 'नहीं' : lang === 'bn' ? 'না' : 'No',
    overBudget: lang === 'hi' ? 'बजट सीमा पार हो गई!' : lang === 'bn' ? 'বাজেট অতিক্রম করেছেন!' : 'Over Budget!',
    noBudgets: lang === 'hi' ? 'इस महीने कोई बजट सेट नहीं किया गया है' : lang === 'bn' ? 'এই মাসে কোনো বাজেট সেট করা হয়নি' : 'No budgets set for this month',
  };

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
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t.monthlyBudget}</h2>
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.category}</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white appearance-none shadow-sm"
              >
                <option value="">{t.selectCategory}</option>
                {expenseCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.budgetLabel}</label>
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
              <Plus className="w-5 h-5 mr-2" /> {t.setBudgetBtn}
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

          if (editingBudgetId === budget.id) {
            return (
              <Card key={budget.id}>
                <CardContent className="p-4 sm:p-6">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setBudget({
                        categoryId: budget.categoryId,
                        amount: Number(editAmount),
                        month: budget.month
                      });
                      setEditingBudgetId(null);
                    }}
                    className="space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                       <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{t.budgetEdit}: {category.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setEditingBudgetId(null)}
                        className="text-slate-400 hover:text-rose-500 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-1 w-full">
                         <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.newBudgetAmount}</label>
                        <input 
                          type="number" required min="0"
                          value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                         <button type="button" onClick={() => setEditingBudgetId(null)} className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition">{t.cancel}</button>
                         <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">{t.update}</button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={budget.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{category.name}</h4>
                    <div className="flex gap-1.5 ml-1">
                      <button 
                        onClick={() => {
                          setEditingBudgetId(budget.id);
                          setEditAmount(String(budget.amount));
                        }}
                        className="p-1 px-2 text-[11px] bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-md hover:text-blue-600 flex items-center gap-1 transition"
                      >
                         <Edit2 className="w-3 h-3" /> {t.edit}
                      </button>
                      {deleteConfirmId === budget.id ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 p-1 rounded-md">
                           <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold px-1">{t.confirm}</span>
                          <button 
                            onClick={() => {
                              deleteBudget(budget.id);
                              setDeleteConfirmId(null);
                            }}
                            className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-bold hover:bg-rose-700 transition"
                          >
                             {t.yes}
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(null)}
                            className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                          >
                             {t.no}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeleteConfirmId(budget.id)}
                          className="p-1 px-2 text-[11px] bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-md flex items-center gap-1 transition"
                        >
                           <Trash2 className="w-3 h-3" /> {t.deleteLabel}
                        </button>
                      )}
                    </div>
                  </div>
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
                       <span className="text-rose-600 dark:text-rose-400">{t.overBudget}</span>
                    ) : (
                       <span>
                        {lang === 'hi' ? `${formatBDT(budget.amount - spent)} और बाकी है` : lang === 'bn' ? `আর ${formatBDT(budget.amount - spent)} বাকি আছে` : `${formatBDT(budget.amount - spent)} remaining`}
                      </span>
                    )}
                  </p>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{progress.toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
           <p className="text-center text-slate-500 dark:text-slate-400 py-4">{t.noBudgets}</p>
        )}
      </div>
    </div>
  );
}
