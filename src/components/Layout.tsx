import React from 'react';
import { 
  Home, 
  Wallet, 
  CreditCard, 
  PieChart, 
  Settings, 
  LogOut, 
  User as UserIcon,
  PiggyBank,
  BookOpen,
  MessageCircle,
  Shield
} from 'lucide-react';
import { useAppStore } from '../store';
import { ViewState } from '../types';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { user, logout, isDark, lang } = useAppStore();

  if (!user) return <>{children}</>;

  const t = {
    dashboard: lang === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
    income: lang === 'bn' ? 'আয়' : 'Income',
    expense: lang === 'bn' ? 'ব্যয়' : 'Expense',
    loans: lang === 'bn' ? 'ধার/দেনা' : 'Loans',
    savings: lang === 'bn' ? 'সঞ্চয়' : 'Savings',
    budget: lang === 'bn' ? 'বাজেট' : 'Budget',
    reports: lang === 'bn' ? 'রিপোর্ট' : 'Reports',
    profile: lang === 'bn' ? 'প্রোফাইল' : 'Profile',
    settings: lang === 'bn' ? 'ক্যাটাগরি ম্যানেজমেন্ট' : 'Category Mgmt',
    messages: lang === 'bn' ? 'মেসেজ' : 'Messages',
    accountant: lang === 'bn' ? 'হিসাব রক্ষক' : 'Accountant',
    logout: lang === 'bn' ? 'লগআউট' : 'Logout',
  };

  const menuItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: t.dashboard, icon: <Home size={18} /> },
    { id: 'income', label: t.income, icon: <Wallet size={18} /> },
    { id: 'expense', label: t.expense, icon: <CreditCard size={18} /> },
    { id: 'loans', label: t.loans, icon: <BookOpen size={18} /> },
    { id: 'savings', label: t.savings, icon: <PiggyBank size={18} /> },
    { id: 'budget', label: t.budget, icon: <PieChart size={18} /> },
    { id: 'reports', label: t.reports, icon: <PieChart size={18} /> },
    { id: 'profile', label: t.profile, icon: <UserIcon size={18} /> },
    { id: 'settings', label: t.settings, icon: <Settings size={18} /> },
    { id: 'messages', label: t.messages, icon: <MessageCircle size={18} /> },
  ];

  if (user?.role === 'admin') {
      menuItems.push({ id: 'admin', label: 'Admin Panel', icon: <Shield size={18} /> });
  }

  // Fetch unread count globally
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

  return (
    <div className={cn(
      "flex h-screen relative overflow-hidden font-sans transition-colors",
      isDark ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"
    )}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex w-64 h-full z-10 flex-col p-6 transition-colors border-r",
        isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm flex-shrink-0">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }} />
            <div className="hidden w-full h-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">৳</div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-blue-900 dark:text-blue-300">{t.accountant}</h1>
        </div>
        <div className="flex-1 overflow-y-auto scroll-smooth overscroll-none">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex items-center w-full px-3 py-2.5 sm:py-3 text-sm font-medium rounded-xl transition-colors relative",
                  currentView === item.id 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
                {item.id === 'messages' && totalUnread > 0 && (
                   <span className="absolute right-3 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                       {totalUnread > 99 ? '99+' : totalUnread}
                   </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        <button onClick={() => onViewChange('profile')} className="mt-auto p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-left hover:bg-slate-200 dark:hover:bg-slate-700 transition w-full group">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">প্রোফাইল</p>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-blue-200 dark:bg-blue-800 border-2 border-white dark:border-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
               {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <UserIcon size={20} className="text-blue-600 dark:text-blue-300"/>
               )}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</p>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
             </div>
          </div>
       </button>
     </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden z-10 relative">
        {/* Mobile Header */}
        {currentView !== 'dashboard' && (
          <header className={cn(
            "md:hidden flex items-center justify-between h-10 sm:h-12 px-3 border-b transition-colors",
            isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
          )}>
            <div className="flex items-center gap-2">
              <button onClick={() => onViewChange('dashboard')} className="p-1 sm:p-2 mr-1 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm flex-shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }} />
                <div className="hidden w-full h-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">৳</div>
              </div>
              <h1 className="font-bold sm:text-base text-[15px] tracking-tight text-blue-900 dark:text-blue-300">{t.accountant}</h1>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto scroll-smooth overscroll-none p-3 sm:p-6 lg:p-8 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex-1">
            {children}
          </div>
          <div className="mt-8 text-center pb-4">
             <a 
                href="https://www.facebook.com/ShahinAlomOfficial28" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
             >
                Developed by Shahin
             </a>
          </div>
        </div>
      </main>
    </div>
  );
}
