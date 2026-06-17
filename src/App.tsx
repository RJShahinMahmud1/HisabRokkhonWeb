import { useState, useEffect } from 'react';
import { AppProvider, useAppStore } from './store';
import { Layout } from './components/Layout';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { TransactionView } from './views/TransactionView';
import { ProfileView } from './views/ProfileView';
import { SMSocialView } from './views/social/SMSocialView';
import { SettingsView } from './views/SettingsView';
import { ReportsView } from './views/ReportsView';
import { HistoryView } from './views/HistoryView';
import { LoansView } from './views/LoansView';
import { SavingsView } from './views/SavingsView';
import { BudgetView } from './views/BudgetView';
import { MessengerView } from './views/MessengerView';
import { AdminView } from './views/AdminView';
import { ViewState } from './types';

function AppContent() {
  const { user } = useAppStore();
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    return (localStorage.getItem('hisab_rokkhok_current_view') as ViewState) || 'dashboard';
  });
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('hisab_rokkhok_current_view', currentView);
    if (currentView !== 'profile') {
      setViewingProfileId(null);
    }
  }, [currentView]);

  if (!user) {
    return <AuthView />;
  }
  
  if (user.banned) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
               <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 mx-auto rounded-full flex items-center justify-center mb-4">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Account Banned</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Your account has been suspended by the administrator. Contact support for more information.</p>
               </div>
          </div>
      );
  }

  const handleViewProfile = (uid: string) => {
    setViewingProfileId(uid);
    setCurrentView('profile');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onChangeView={setCurrentView} />;
      case 'income': return <TransactionView type="income" />;
      case 'expense': return <TransactionView type="expense" />;
      case 'loans': return <LoansView />;
      case 'savings': return <SavingsView />;
      case 'budget': return <BudgetView />;
      case 'reports': return <ReportsView />;
      case 'history': return <HistoryView />;
      case 'settings': return <SettingsView />;
      case 'admin': return <AdminView />;
      case 'profile': return <SMSocialView initialProfileId={viewingProfileId} onViewProfile={handleViewProfile} />;
      case 'messages': return <MessengerView onBack={() => setCurrentView('dashboard')} onViewProfile={handleViewProfile} />;
      default: return <DashboardView onChangeView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
