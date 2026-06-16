import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { 
  Bell, ChevronDown, BookOpen, Receipt, FileText, 
  PieChart, Wallet, Activity, ScanLine, User as UserIcon,
  Settings, Sun, Moon, Globe, MessageCircle
} from 'lucide-react';
import { ViewState } from '../types';

export function DashboardView({ onChangeView }: { onChangeView: (view: ViewState) => void }) {
  const { user, transactions, categories, setHistorySearchTerm, isDark, toggleTheme, lang, setLang, loans, savingsGoals } = useAppStore();
  
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  let currentBalance = totalIncome - totalExpense;
  loans.forEach(loan => {
    if (loan.type === 'loan_given') {
      currentBalance -= (loan.amount - loan.repaidAmount);
    } else if (loan.type === 'loan_taken') {
      currentBalance += (loan.amount - loan.repaidAmount);
    }
  });
  savingsGoals.forEach(goal => {
    currentBalance -= goal.savedAmount;
  });

  const incomeCount = transactions.filter(t => t.type === 'income').length;
  const expenseCount = transactions.filter(t => t.type === 'expense').length;
  const totalCount = transactions.length;

  const t = {
    welcome: lang === 'bn' ? 'সুস্বাগতম' : 'Welcome',
    accountant: lang === 'bn' ? 'হিসাব রক্ষক' : 'Accountant',
    balance: lang === 'bn' ? 'কারেন্ট ব্যালেন্স' : 'Current Balance',
    transactions: lang === 'bn' ? 'লেনদেন' : 'Transactions',
    income: lang === 'bn' ? 'আয়' : 'Income',
    expense: lang === 'bn' ? 'ব্যয়' : 'Expense',
    history: lang === 'bn' ? 'সব ইতিহাস' : 'History',
    allHistory: lang === 'bn' ? 'সব হিসাব' : 'All History',
    newIncome: lang === 'bn' ? 'নতুন আয়' : 'New Income',
    newExpense: lang === 'bn' ? 'নতুন ব্যয়' : 'New Expense',
    budget: lang === 'bn' ? 'লাভ-ক্ষতি' : 'Budget',
    loans: lang === 'bn' ? 'উধারি' : 'Loans',
    reports: lang === 'bn' ? 'রিপোর্ট' : 'Reports',
    savings: lang === 'bn' ? 'সঞ্চয়' : 'Savings',
    profile: lang === 'bn' ? 'প্রোফাইল' : 'Profile',
    settings: lang === 'bn' ? 'ক্যাটাগরি ম্যানেজমেন্ট' : 'Category Mgmt',
    messages: lang === 'bn' ? 'মেসেজিং' : 'Messaging',
    allTransactions: lang === 'bn' ? 'সব লেনদেন' : 'All Trx',
    totalIncome: lang === 'bn' ? 'মোট আয়' : 'Total Income',
    totalExpense: lang === 'bn' ? 'মোট ব্যয়' : 'Total Expense',
  };

  const [totalUnread, setTotalUnread] = React.useState(0);
  React.useEffect(() => {
    if (!user) return;
    let unsub: (() => void) | null = null;
    let isMounted = true;
    import('firebase/firestore').then(({ query, collection, where, onSnapshot }) => {
        import('../lib/firebase').then(({ db }) => {
            if (!isMounted) return;
            unsub = onSnapshot(query(collection(db, 'conversations'), where('participants', 'array-contains', user.id)), (snapshot) => {
                let unread = 0;
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if(data.unreadCount && data.unreadCount[user.id] > 0) {
                        unread += data.unreadCount[user.id];
                    }
                });
                setTotalUnread(unread);
            }, (error) => {
                // Ignore silent permission errors on logout
            });
        });
    });
    return () => {
        isMounted = false;
        if (unsub) unsub();
    };
  }, [user]);

  const menuItems = [
    { icon: <BookOpen strokeWidth={1.5} size={26} className="text-[#32C58F]" />, label: t.allHistory, view: 'history' },
    { icon: <Receipt strokeWidth={1.5} size={26} className="text-[#32C58F]" />, label: t.newIncome, view: 'income' },
    { icon: <FileText strokeWidth={1.5} size={26} className="text-[#32C58F]" />, label: t.newExpense, view: 'expense' },
    { icon: <PieChart strokeWidth={1.5} size={26} className="text-[#32C58F]" />, label: t.budget, view: 'budget' },
    { icon: <Wallet strokeWidth={1.5} size={26} className="text-[#32C58F]" />, label: t.loans, view: 'loans' },
    { icon: <Activity strokeWidth={1.5} size={26} className="text-[#32C58F]" />, label: t.reports, view: 'reports' },
    { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#32C58F]"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path><path d="M2 9v1c0 1.1.9 2 2 2h1"></path><path d="M16 11h0"></path></svg>, label: t.savings, view: 'savings' },
    { icon: <UserIcon strokeWidth={1.5} size={26} className="text-[#32C58F]" />, label: t.profile, view: 'profile' },
    { icon: <Settings strokeWidth={1.5} size={26} className="text-[#32C58F]" />, label: t.settings, view: 'settings' }
  ];

  return (
    <div className="relative pb-24 font-sans max-w-lg mx-auto md:max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 md:hidden">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
               {user?.avatarUrl ? (
                 <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                   <UserIcon size={24} className="text-emerald-600"/>
                 </div>
               )}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{lang === 'bn' ? 'হাই' : 'Hi'}, {user?.name.split(' ')[0]}!</h2>
            <div className="flex items-center text-xs font-semibold bg-blue-500 text-white px-2.5 py-0.5 rounded-full cursor-pointer mt-0.5 max-w-max">
              {t.accountant} <ChevronDown size={14} className="ml-1 opacity-80" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')} className="p-2 flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold text-sm">
            <Globe size={24} />
            <span className="uppercase">{lang}</span>
          </button>
        </div>
      </div>

      {/* Modern Desktop Header Header Placeholder if needed */}
      <div className="hidden md:flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t.welcome}, {user?.name.split(' ')[0]}! 👋</h2>
        </div>
        <div className="flex gap-4">
          <button 
             onClick={() => onChangeView('income')}
             className="bg-emerald-500 text-white px-4 sm:px-6 py-2 rounded-full font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 hover:bg-emerald-600 transition"
          >
            <span>+</span> IN
          </button>
           <button 
             onClick={() => onChangeView('expense')}
             className="bg-rose-500 text-white px-4 sm:px-6 py-2 rounded-full font-bold shadow-md shadow-rose-500/20 flex items-center gap-2 hover:bg-rose-600 transition"
          >
            <span>-</span> OUT
          </button>
        </div>
      </div>


      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#EAF7ED] dark:bg-emerald-950/30 rounded-3xl p-3 sm:p-4 text-center border-b-4 border-emerald-100/50 dark:border-emerald-900/50">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#38B06B] dark:text-emerald-400">{totalCount}</h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">{t.transactions}</p>
        </div>
        <div className="bg-[#FFF0F0] dark:bg-rose-950/30 rounded-3xl p-3 sm:p-4 text-center border-b-4 border-rose-100/50 dark:border-rose-900/50">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F05E5E] dark:text-rose-400">{incomeCount}</h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">{t.income}</p>
        </div>
        <div className="bg-[#FFF7EA] dark:bg-amber-950/30 rounded-3xl p-3 sm:p-4 text-center border-b-4 border-amber-100/50 dark:border-amber-900/50">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F5B546] dark:text-amber-500">{expenseCount}</h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">{t.expense}</p>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-[#21CD7A] to-[#1AB185] rounded-[1.5rem] p-5 mb-6 text-white relative overflow-hidden flex flex-col justify-center min-h-[110px] shadow-sm">
        <div className="z-10 relative">
          <p className="text-xs sm:text-sm font-bold mb-1.5 bg-white/20 inline-block px-3 py-1 rounded-full text-white backdrop-blur-sm">{t.balance}</p>
          <h3 className="text-3xl sm:text-4xl font-black flex items-center tracking-tight">
             {formatBDT(currentBalance)}
          </h3>
        </div>
        <div className="absolute -right-10 top-0 bottom-0 w-1/2 bg-[#17A074] skew-x-12 z-0"></div>
        <div className="absolute right-[-20%] -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl z-0"></div>
        <div className="absolute top-4 right-5 p-2 bg-white/20 rounded-xl backdrop-blur-sm z-10 text-white">
          <Wallet size={28} />
        </div>
      </div>

      {/* Pills */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <button 
          onClick={() => {
            setHistorySearchTerm('');
            onChangeView('history');
          }}
          className="bg-[#5C9EFC] text-white px-5 sm:px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-blue-500/20 whitespace-nowrap"
        >
          {t.history}
        </button>
        {categories.slice(0, 5).map((category) => (
          <button 
            key={category.id} 
            onClick={() => {
              setHistorySearchTerm(category.name);
              onChangeView('history');
            }}
            className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-2 border-slate-100 dark:border-slate-700 px-5 sm:px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap hover:border-[#5C9EFC] transition-colors"
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Large Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <button onClick={() => onChangeView('income')} className="bg-[#1ACE65] text-white rounded-[1.5rem] p-4 sm:p-5 relative overflow-hidden text-left shadow-sm">
          <div className="w-9 h-9 border border-white/30 rounded-[10px] flex items-center justify-center mb-4 bg-transparent mt-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10"></path><line x1="2" y1="10" x2="22" y2="10"></line><path d="m16 20 2 2 4-4"></path></svg>
          </div>
          <div className="absolute top-5 right-5 text-white/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <p className="font-bold text-[15px] sm:text-base opacity-95 mb-0.5 tracking-tight">{t.totalIncome} <span className="opacity-70 font-medium ml-1">✓</span></p>
          <h3 className="text-[22px] sm:text-2xl font-black tracking-tight">{formatBDT(totalIncome).replace('৳', '৳ ')}</h3>
          <p className="text-[10px] sm:text-xs font-semibold opacity-75 mt-1 sm:mt-1.5 uppercase">{t.allTransactions}</p>
        </button>

        <button onClick={() => onChangeView('expense')} className="bg-[#E7484B] text-white rounded-[1.5rem] p-4 sm:p-5 relative overflow-hidden text-left shadow-sm">
          <div className="w-9 h-9 border border-white/30 rounded-[10px] flex items-center justify-center mb-4 bg-transparent mt-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10"></path><line x1="2" y1="10" x2="22" y2="10"></line><polyline points="15 16 19 20 23 16"></polyline></svg>
          </div>
          <div className="absolute top-5 right-5 text-white/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          </div>
          <p className="font-bold text-[15px] sm:text-base opacity-95 mb-0.5 tracking-tight">{t.totalExpense} <span className="opacity-70 font-medium ml-1">↗</span></p>
          <h3 className="text-[22px] sm:text-2xl font-black tracking-tight">{formatBDT(totalExpense).replace('৳', '৳ ')}</h3>
          <p className="text-[10px] sm:text-xs font-semibold opacity-75 mt-1 sm:mt-1.5 uppercase">{t.allTransactions}</p>
        </button>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        {menuItems.map((item, idx) => (
          <button 
            key={idx} 
            onClick={() => onChangeView(item.view as ViewState)}
            className="bg-white dark:bg-slate-800 rounded-[1.5rem] p-3 sm:p-4 py-4 sm:py-5 flex flex-col items-center justify-center gap-2 sm:gap-3 border border-slate-100 dark:border-slate-800 shadow-sm transition-all active:scale-95 text-center h-full hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-[44px] sm:w-[50px] h-[44px] sm:h-[50px] rounded-2xl border-[1.5px] border-[#DDF6EE] dark:border-[#DDF6EE]/20 flex items-center justify-center mb-1 bg-transparent shrink-0">
              {item.icon}
            </div>
            <span className="text-[11px] sm:text-[13px] font-bold text-slate-600 dark:text-slate-300 tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-1">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 sm:bottom-12 md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white dark:bg-slate-800 rounded-full shadow-[0_4px_30px_rgb(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 px-6 sm:px-8 py-2 sm:py-2.5 gap-8 sm:gap-12 md:hidden">
        <button onClick={() => onChangeView('income')} className="flex items-center gap-1.5 font-black tracking-tight text-[#14C969] hover:text-[#10A956] transition-colors whitespace-nowrap">
          <span className="text-[#14C969] text-base font-bold">৳</span> IN
        </button>
        
        <div className="relative -mt-9">
          <button 
            onClick={() => onChangeView('messages')}
            className="w-14 h-14 bg-[#5C9EFC] text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 border-4 border-white dark:border-slate-800 hover:scale-105 transition-transform relative"
          >
            <MessageCircle size={24} strokeWidth={2.5} />
            {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white border-2 border-white dark:border-slate-800 rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm">
                    {totalUnread > 99 ? '99+' : totalUnread}
                </span>
            )}
          </button>
        </div>

        <button onClick={() => onChangeView('expense')} className="flex items-center gap-1.5 font-black tracking-tight text-[#EF4444] hover:text-[#DC2626] transition-colors whitespace-nowrap">
          <span className="text-[#EF4444] text-base font-bold">৳</span> OUT
        </button>
      </div>
    </div>
  );
}
