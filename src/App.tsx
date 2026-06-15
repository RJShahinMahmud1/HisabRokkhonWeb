import { useState, useEffect } from 'react';
import { AppProvider, useAppStore } from './store';
import { Layout } from './components/Layout';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { TransactionView } from './views/TransactionView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { ReportsView } from './views/ReportsView';
import { HistoryView } from './views/HistoryView';
import { LoansView } from './views/LoansView';
import { SavingsView } from './views/SavingsView';
import { BudgetView } from './views/BudgetView';
import { MessengerView } from './views/MessengerView';
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
      case 'profile': return <ProfileView profileId={viewingProfileId} onBack={() => { setViewingProfileId(null); setCurrentView('messages'); }} />;
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
