import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { 
  Trash2, Search, TrendingUp, TrendingDown,
  ShoppingBag, Utensils, Sparkles, Pill, Heart, GraduationCap, 
  Bus, Smartphone, Zap, Home, Gift, Coins, Filter, HelpCircle
} from 'lucide-react';

export function HistoryView() {
  const { transactions, categories, deleteTransaction, historySearchTerm, setHistorySearchTerm, lang, paymentMethods } = useAppStore();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');

  const t = {
    allTransactions: lang === 'hi' ? 'सभी लेनदेन' : lang === 'bn' ? 'সকল লেনদেন' : 'All Transactions',
    searchPlaceholder: lang === 'hi' ? 'খোজें...' : lang === 'bn' ? 'খুঁজুন...' : 'Search...',
    allTypes: lang === 'hi' ? 'सभी प्रकार' : lang === 'bn' ? 'সব ধরন' : 'All Types',
    allPaymentMethods: lang === 'hi' ? 'सभी भुगतान विधियां' : lang === 'bn' ? 'সব পেমেন্ট মেথড' : 'All Payments',
    income: lang === 'hi' ? 'आय' : lang === 'bn' ? 'আয়' : 'Income',
    expense: lang === 'hi' ? 'ব্যय' : lang === 'bn' ? 'ব্যয়' : 'Expense',
    noData: lang === 'hi' ? 'कोई डेटा नहीं मिला' : lang === 'bn' ? 'কোনো তথ্য পাওয়া যায়নি' : 'No transactions found',
    unknown: lang === 'hi' ? 'अज्ञात' : lang === 'bn' ? 'অজানা' : 'Unknown',
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

  const filtered = transactions
    .filter(t_item => filterType === 'all' || t_item.type === filterType)
    .filter(t_item => filterPaymentMethod === 'all' || t_item.paymentMethodId === filterPaymentMethod)
    .filter(t_item => {
      const catName = getCategoryName(t_item.categoryId).toLowerCase();
      const note = (t_item.note || '').toLowerCase();
      const q = historySearchTerm.toLowerCase();
      return catName.includes(q) || note.includes(q);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2.5 h-6 rounded-full bg-emerald-500"></span>
          {t.allTransactions}
        </h2>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder={t.searchPlaceholder}
            value={historySearchTerm}
            onChange={(e) => setHistorySearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-0 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-0 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none w-full appearance-none cursor-pointer shadow-inner"
            >
              <option value="all">{t.allTypes}</option>
              <option value="income">{t.income}</option>
              <option value="expense">{t.expense}</option>
            </select>
          </div>
          <div>
            <select 
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-0 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/50 outline-none w-full appearance-none cursor-pointer shadow-inner"
            >
              <option value="all">{t.allPaymentMethods}</option>
              {paymentMethods.filter(p => p.enabled).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Mini Stats for Filtered Results */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {lang === 'bn' ? 'মোট লেনদেন' : 'Trx Count'}
          </p>
          <h4 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-2 leading-none">
            {filtered.length}
          </h4>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {lang === 'bn' ? 'মোট আয়' : 'Total In'}
          </p>
          <h4 className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2 leading-none truncate">
            {formatBDT(filtered.filter(x => x.type === 'income').reduce((sum, x) => sum + x.amount, 0))}
          </h4>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800/80 shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {lang === 'bn' ? 'মোট ব্যয়' : 'Total Out'}
          </p>
          <h4 className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-2 leading-none truncate">
            {formatBDT(filtered.filter(x => x.type === 'expense').reduce((sum, x) => sum + x.amount, 0))}
          </h4>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3.5">
        {filtered.length > 0 ? (
          filtered.map(t_item => {
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

