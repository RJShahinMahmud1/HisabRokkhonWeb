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
  BookOpen
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
  const { user, logout, isDark } = useAppStore();

  if (!user) return <>{children}</>;

  const menuItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: <Home size={18} /> },
    { id: 'income', label: 'আয়', icon: <Wallet size={18} /> },
    { id: 'expense', label: 'ব্যয়', icon: <CreditCard size={18} /> },
    { id: 'loans', label: 'ধার/দেনা', icon: <BookOpen size={18} /> },
    { id: 'savings', label: 'সঞ্চয়', icon: <PiggyBank size={18} /> },
    { id: 'budget', label: 'বাজেট', icon: <PieChart size={18} /> },
    { id: 'reports', label: 'রিপোর্ট', icon: <PieChart size={18} /> },
    { id: 'settings', label: 'সেটিংস', icon: <Settings size={18} /> },
  ];

  const bottomNavItems = menuItems.filter(item => 
    ['dashboard', 'income', 'expense', 'reports', 'settings'].includes(item.id)
  );

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
          <div className="w-9 sm:w-10 h-9 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">৳</div>
          <h1 className="text-xl font-bold tracking-tight text-blue-900 dark:text-blue-300">হিসাব রক্ষক</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex items-center w-full px-3 py-2.5 sm:py-3 text-sm font-medium rounded-xl transition-colors",
                  currentView === item.id 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
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
               <p className="text-sm font-bold truncate text-slate-800 dark:text-slate-200">{user.name}</p>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
          >
            <LogOut size={16} className="mr-2" /> লগআউট
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden pb-14 md:pb-0 z-10 relative">
        {/* Mobile Header */}
        <header className={cn(
          "md:hidden flex items-center justify-between h-10 sm:h-12 px-3 border-b transition-colors",
          isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
        )}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">৳</div>
            <h1 className="font-bold sm:text-base text-sm text-blue-900 dark:text-blue-300">হিসাব রক্ষক</h1>
          </div>
          <button onClick={logout} className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400">
            <LogOut size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 flex flex-col">
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

      {/* Mobile Bottom Navigation */}
      <nav className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 border-t z-50 transition-colors",
        isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
      )}>
        <ul className="flex items-center justify-around h-14">
          {bottomNavItems.map((item) => (
            <li key={item.id} className="flex-1">
              <button
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors relative",
                  currentView === item.id 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-slate-500 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-200"
                )}
              >
                {item.icon}
                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
