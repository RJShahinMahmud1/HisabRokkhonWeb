import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { 
  Plus, Trash2, TrendingUp, TrendingDown, HelpCircle,
  ShoppingBag, Utensils, Sparkles, Pill, Heart, GraduationCap, 
  Bus, Smartphone, Zap, Home, Gift, Coins
} from 'lucide-react';
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

  const getCategoryStyle = (catId: string, type: 'income' | 'expense') => {
    const cat = categories.find(c => c.id === catId);
    const name = cat ? cat.name : '';
    const lowerName = name.toLowerCase();

    if (type === 'income' || catId === 'c1' || lowerName.includes('income') || lowerName.includes('আয়')) {
      return {
        icon: <Coins className="w-5 h-5" />,
        color: '#10B981', // emerald-500
        bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        borderColor: 'border-emerald-500/20 dark:border-emerald-500/30'
      };
    }

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
    if (catId === 'c6' || lowerName.includes('ঔষধ') || lowerName.includes('ওষুধ') || lowerName.includes('medicine') || lowerName.includes('drug') || lowerName.includes('pharma')) {
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

    // অন্যান্য খরচ (Others)
    return {
      icon: <Gift className="w-5 h-5" />,
      color: '#64748B', // slate-500
      bgColor: 'bg-slate-500/10 dark:bg-slate-500/20',
      textColor: 'text-slate-600 dark:text-slate-400',
      borderColor: 'border-slate-500/20 dark:border-slate-500/30'
    };
  };

  const getPaymentMethodStyle = (pmId: string) => {
    const pm = paymentMethods.find(p => p.id === pmId);
    if (!pm) return null;
    
    const name = pm.name;
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('bkash') || lowerName.includes('বিকাশ')) {
      return {
        name: lang === 'bn' ? 'বিকাশ' : 'bKash',
        className: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40',
      };
    }
    if (lowerName.includes('nagad') || lowerName.includes('নগদ') && (lowerName.includes('nagad') || pmId === 'pm4')) {
      return {
        name: lang === 'bn' ? 'নগদ' : 'Nagad',
        className: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/40',
      };
    }
    if (lowerName.includes('rocket') || lowerName.includes('রকেট')) {
      return {
        name: lang === 'bn' ? 'রকেট' : 'Rocket',
        className: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40',
      };
    }
    if (lowerName.includes('bank') || lowerName.includes('ব্যাংক')) {
      return {
        name: lang === 'bn' ? 'ব্যাংক' : 'Bank',
        className: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40',
      };
    }
    if (lowerName.includes('cash') || lowerName.includes('নগদ') && (lowerName.includes('cash') || pmId === 'pm1')) {
      return {
        name: lang === 'bn' ? 'ক্যাশ' : 'Cash',
        className: 'bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60',
      };
    }
    
    return {
      name: pm.name,
      className: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40',
    };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span className={`w-2.5 h-6 rounded-full ${type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
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

              <div className={type === 'income' ? 'md:col-span-2' : 'md:col-span-2'}>
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

      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
        {type === 'income' ? t.recentIncome : t.recentExpense}
      </h3>

      {/* Modern Redesigned Recent Transactions List */}
      <div className="space-y-3.5">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(t_item => {
            const categoryStyle = getCategoryStyle(t_item.categoryId, t_item.type as 'income' | 'expense');
            const pmStyle = getPaymentMethodStyle(t_item.paymentMethodId);

            return (
              <div 
                key={t_item.id} 
                className="group relative flex items-center justify-between p-3.5 sm:p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.1)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 border-l-4"
                style={{ borderLeftColor: categoryStyle.color }}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                   <div className={`w-10 sm:w-11 h-10 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 ${categoryStyle.bgColor} ${categoryStyle.textColor} ${categoryStyle.borderColor}`}>
                      {categoryStyle.icon}
                    </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[160px] sm:max-w-[280px]">
                        {t_item.note || getCategoryName(t_item.categoryId)}
                      </h4>
                      {t_item.note && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 truncate">
                          {getCategoryName(t_item.categoryId)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-slate-400 dark:text-slate-500">
                      <span className="text-[10px] sm:text-[11px] font-medium">
                        {new Date(t_item.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px]">•</span>
                      {pmStyle && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md truncate uppercase ${pmStyle.className}`}>
                          {pmStyle.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <span className={`font-black text-sm sm:text-base tracking-tight ${t_item.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {t_item.type === 'income' ? '+' : '-'}{formatBDT(t_item.amount)}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block uppercase tracking-wider">
                      {t_item.type === 'income' ? (lang === 'bn' ? 'আয়' : 'Income') : (lang === 'bn' ? 'ব্যয়' : 'Expense')}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => deleteTransaction(t_item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition rounded-xl"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold">{t.noData}</p>
          </div>
        )}
      </div>
    </div>
  );
}

