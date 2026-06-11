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
import { MessagesView } from './views/MessagesView';
import { ViewState } from './types';

function AppContent() {
  const { user } = useAppStore();
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    return (localStorage.getItem('hisab_rokkhok_current_view') as ViewState) || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('hisab_rokkhok_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    window.history.replaceState({ view: currentView }, '');
    
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setCurrentView(event.state.view);
      } else {
        setCurrentView('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const changeView = (view: ViewState) => {
    if (view !== currentView) {
      window.history.pushState({ view }, '');
      setCurrentView(view);
    }
  };

  if (!user) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onChangeView={changeView} />;
      case 'income': return <TransactionView type="income" />;
      case 'expense': return <TransactionView type="expense" />;
      case 'loans': return <LoansView />;
      case 'savings': return <SavingsView />;
      case 'budget': return <BudgetView />;
      case 'reports': return <ReportsView />;
      case 'history': return <HistoryView />;
      case 'settings': return <SettingsView />;
      case 'profile': return <ProfileView />;
      case 'messages': return <MessagesView onBack={() => changeView('dashboard')} />;
      default: return <DashboardView onChangeView={changeView} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={changeView}>
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
