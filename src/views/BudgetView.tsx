import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { 
  Plus, Edit2, Trash2, X, HelpCircle, Coins,
  ShoppingBag, Utensils, Sparkles, Pill, Heart, GraduationCap, 
  Bus, Smartphone, Zap, Home, Gift
} from 'lucide-react';

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

  const getCategoryStyle = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    const name = cat ? cat.name : '';
    const lowerName = name.toLowerCase();

    // কাঁচাবাজার (Groceries/Bazar)
    if (catId === 'c2' || lowerName.includes('কাঁচাবাজার') || lowerName.includes('বাজার') || lowerName.includes('grocery') || lowerName.includes('bazar')) {
      return {
        icon: <ShoppingBag className="w-5 h-5" />,
        color: '#22C55E', // green-500
        bgColor: 'bg-green-500/10 dark:bg-green-500/20',
        textColor: 'text-green-600 dark:text-green-400',
        borderColor: 'border-green-500/20 dark:border-green-500/30'
      };
    }

    // খাবার (Food)
    if (catId === 'c3' || lowerName.includes('খাবার') || lowerName.includes('খাদ্য') || lowerName.includes('food') || lowerName.includes('restaurant') || lowerName.includes('cafe')) {
      return {
        icon: <Utensils className="w-5 h-5" />,
        color: '#F59E0B', // amber-500
        bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
        textColor: 'text-amber-600 dark:text-amber-400',
        borderColor: 'border-amber-500/20 dark:border-amber-500/30'
      };
    }

    // শপিং (Shopping)
    if (catId === 'c4' || lowerName.includes('শপিং') || lowerName.includes('কেনাকাটা') || lowerName.includes('shopping') || lowerName.includes('cloth')) {
      return {
        icon: <ShoppingBag className="w-5 h-5" />,
        color: '#A855F7', // purple-500
        bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
        textColor: 'text-purple-600 dark:text-purple-400',
        borderColor: 'border-purple-500/20 dark:border-purple-500/30'
      };
    }

    // কসমেটিক্স (Cosmetics)
    if (catId === 'c5' || lowerName.includes('কসমেটিক্স') || lowerName.includes('cosmetic') || lowerName.includes('makeup') || lowerName.includes('beauty')) {
      return {
        icon: <Sparkles className="w-5 h-5" />,
        color: '#EC4899', // pink-500
        bgColor: 'bg-pink-500/10 dark:bg-pink-500/20',
        textColor: 'text-pink-600 dark:text-pink-400',
        borderColor: 'border-pink-500/20 dark:border-pink-500/30'
      };
    }

    // ঔষধ (Medicine)
    if (catId === 'c6' || lowerName.includes('ঔষধ') || lowerName.includes('오ষুধ') || lowerName.includes('medicine') || lowerName.includes('drug') || lowerName.includes('pharma')) {
      return {
        icon: <Pill className="w-5 h-5" />,
        color: '#EF4444', // red-500
        bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
        textColor: 'text-rose-600 dark:text-rose-400',
        borderColor: 'border-rose-500/20 dark:border-rose-500/30'
      };
    }

    // স্বাস্থ্য (Health)
    if (catId === 'c7' || lowerName.includes('স্বাস্থ্য') || lowerName.includes('ডাক্তার') || lowerName.includes('health') || lowerName.includes('doctor') || lowerName.includes('hospital') || lowerName.includes('clinic')) {
      return {
        icon: <Heart className="w-5 h-5" />,
        color: '#06B6D4', // cyan-500
        bgColor: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        textColor: 'text-cyan-600 dark:text-cyan-400',
        borderColor: 'border-cyan-500/20 dark:border-cyan-500/30'
      };
    }

    // একাডেমিক খরচ (Education)
    if (catId === 'c8' || lowerName.includes('একাডেমিক') || lowerName.includes('পড়াশোনা') || lowerName.includes('বই') || lowerName.includes('শিক্ষা') || lowerName.includes('education') || lowerName.includes('study') || lowerName.includes('book') || lowerName.includes('school') || lowerName.includes('college')) {
      return {
        icon: <GraduationCap className="w-5 h-5" />,
        color: '#3B82F6', // blue-500
        bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-500/20 dark:border-blue-500/30'
      };
    }

    // যাতায়াত (Travel/Commute)
    if (catId === 'c9' || lowerName.includes('যাতায়াত') || lowerName.includes('ভাড়া') && lowerName.includes('গাড়ি') || lowerName.includes('travel') || lowerName.includes('transport') || lowerName.includes('bus') || lowerName.includes('rickshaw') || lowerName.includes('uber')) {
      return {
        icon: <Bus className="w-5 h-5" />,
        color: '#6366F1', // indigo-500
        bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        borderColor: 'border-indigo-500/20 dark:border-indigo-500/30'
      };
    }

    // মোবাইল রিচার্জ (Mobile Recharge)
    if (catId === 'c10' || lowerName.includes('মোবাইল') || lowerName.includes('রিচার্জ') || lowerName.includes('mobile') || lowerName.includes('recharge') || lowerName.includes('phone') || lowerName.includes('internet') || lowerName.includes('wifi')) {
      return {
        icon: <Smartphone className="w-5 h-5" />,
        color: '#14B8A6', // teal-500
        bgColor: 'bg-teal-500/10 dark:bg-teal-500/20',
        textColor: 'text-teal-600 dark:text-teal-400',
        borderColor: 'border-teal-500/20 dark:border-teal-500/30'
      };
    }

    // ইউটিলিটি বিল (Utility Bill)
    if (catId === 'c11' || lowerName.includes('ইউটিলিটি') || lowerName.includes('বিল') || lowerName.includes('utility') || lowerName.includes('bill') || lowerName.includes('electricity') || lowerName.includes('gas') || lowerName.includes('water')) {
      return {
        icon: <Zap className="w-5 h-5" />,
        color: '#F97316', // orange-500
        bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
        textColor: 'text-orange-600 dark:text-orange-400',
        borderColor: 'border-orange-500/20 dark:border-orange-500/30'
      };
    }

    // বাসা ভাড়া (Rent)
    if (catId === 'c12' || lowerName.includes('বাসা') || lowerName.includes('ভাড়া') || lowerName.includes('rent') || lowerName.includes('house') || lowerName.includes('flat')) {
      return {
        icon: <Home className="w-5 h-5" />,
        color: '#8B5CF6', // violet-500
        bgColor: 'bg-violet-500/10 dark:bg-violet-500/20',
        textColor: 'text-violet-600 dark:text-violet-400',
        borderColor: 'border-violet-500/20 dark:border-violet-500/30'
      };
    }

    return {
      icon: <Gift className="w-5 h-5" />,
      color: '#64748B', // slate-500
      bgColor: 'bg-slate-500/10 dark:bg-slate-500/20',
      textColor: 'text-slate-600 dark:text-slate-400',
      borderColor: 'border-slate-500/20 dark:border-slate-500/30'
    };
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

          const categoryStyle = getCategoryStyle(budget.categoryId);

          return (
            <Card 
              key={budget.id}
              className="border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] border-l-4"
              style={{ borderLeftColor: categoryStyle.color }}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${categoryStyle.bgColor} ${categoryStyle.textColor} ${categoryStyle.borderColor}`}>
                      {categoryStyle.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">{category.name}</h4>
                      <div className="flex gap-1.5 mt-1">
                        <button 
                          onClick={() => {
                            setEditingBudgetId(budget.id);
                            setEditAmount(String(budget.amount));
                          }}
                          className="p-1 px-2 text-[10px] font-semibold bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
                        >
                           <Edit2 className="w-2.5 h-2.5" /> {t.edit}
                        </button>
                        {deleteConfirmId === budget.id ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 p-1 rounded-md">
                             <span className="text-[9px] text-rose-600 dark:text-rose-400 font-bold px-1">{t.confirm}</span>
                            <button 
                              onClick={() => {
                                deleteBudget(budget.id);
                                setDeleteConfirmId(null);
                              }}
                              className="bg-rose-600 text-white px-2 py-0.5 rounded text-[9px] font-bold hover:bg-rose-700 transition"
                            >
                               {t.yes}
                            </button>
                            <button 
                              onClick={() => setDeleteConfirmId(null)}
                              className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[9px] font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                            >
                               {t.no}
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeleteConfirmId(budget.id)}
                            className="p-1 px-2 text-[10px] font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-md flex items-center gap-1 transition"
                          >
                             <Trash2 className="w-2.5 h-2.5" /> {t.deleteLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-base ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                      {formatBDT(spent)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs font-bold block">/ {formatBDT(budget.amount)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 mb-2 overflow-hidden border border-white/50 dark:border-slate-800/50">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : progress > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">
                    {isOverBudget ? (
                       <span className="text-rose-600 dark:text-rose-400">{t.overBudget}</span>
                    ) : (
                       <span>
                        {lang === 'hi' ? `${formatBDT(budget.amount - spent)} और बाकी है` : lang === 'bn' ? `আর ${formatBDT(budget.amount - spent)} বাকি আছে` : `${formatBDT(budget.amount - spent)} remaining`}
                      </span>
                    )}
                  </p>
                  <span className="text-[10px] sm:text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">{progress.toFixed(0)}%</span>
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
