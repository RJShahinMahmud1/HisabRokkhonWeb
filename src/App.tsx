import { useState } from 'react';
import { AppProvider, useAppStore } from './store';
import { Layout } from './components/Layout';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { TransactionView } from './views/TransactionView';
import { SettingsView } from './views/SettingsView';
import { ReportsView } from './views/ReportsView';
import { HistoryView } from './views/HistoryView';
import { LoansView } from './views/LoansView';
import { SavingsView } from './views/SavingsView';
import { BudgetView } from './views/BudgetView';
import { ViewState } from './types';

function AppContent() {
  const { user } = useAppStore();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  if (!user) {
    return <AuthView />;
  }

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
