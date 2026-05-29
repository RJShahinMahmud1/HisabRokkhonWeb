import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Category, PaymentMethod, Transaction, Budget, Loan, SavingsGoal, User } from './types';
import { supabase } from './lib/supabase';

export interface State {
  user: User | null;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  loans: Loan[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  isDark: boolean;
  historySearchTerm: string;
  lang: 'bn' | 'en';
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'আয় (Income)', type: 'income', enabled: true },
  { id: 'c2', name: '🥦 কাঁচাবাজার', type: 'expense', enabled: true },
  { id: 'c3', name: '🍔 খাবার', type: 'expense', enabled: true },
  { id: 'c4', name: '🛍️ শপিং', type: 'expense', enabled: true },
  { id: 'c5', name: '💄 কসমেটিক্স', type: 'expense', enabled: true },
  { id: 'c6', name: '💊 ঔষধ', type: 'expense', enabled: true },
  { id: 'c7', name: '🩺 স্বাস্থ্য', type: 'expense', enabled: true },
  { id: 'c8', name: '📚 একাডেমিক খরচ', type: 'expense', enabled: true },
  { id: 'c9', name: '🚌 যাতায়াত', type: 'expense', enabled: true },
  { id: 'c10', name: '📱 মোবাইল রিচার্জ', type: 'expense', enabled: true },
  { id: 'c11', name: '🧾 ইউটিলিটি বিল', type: 'expense', enabled: true },
  { id: 'c12', name: '🏠 বাসা ভাড়া', type: 'expense', enabled: true },
  { id: 'c13', name: '✨ অন্যান্য খরচ', type: 'expense', enabled: true },
];

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm1', name: 'নগদ (Cash)', enabled: true },
  { id: 'pm2', name: 'বিকাশ (bKash)', enabled: true },
  { id: 'pm3', name: 'রকেট (Rocket)', enabled: true },
  { id: 'pm4', name: 'নগদ (Nagad)', enabled: true },
  { id: 'pm5', name: 'ব্যাংক (Bank)', enabled: true },
];

const initialState: State = {
  user: null,
  categories: DEFAULT_CATEGORIES,
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  transactions: [],
  loans: [],
  savingsGoals: [],
  budgets: [],
  isDark: false,
  historySearchTerm: '',
  lang: 'bn',
};

interface AppContextType extends State {
  login: (name: string, email: string) => void;
  logout: () => void;
  updateProfile: (name: string, avatarUrl: string) => Promise<void>;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => void;
  updatePaymentMethod: (pm: PaymentMethod) => void;
  deletePaymentMethod: (id: string) => void;
  addLoan: (l: Omit<Loan, 'id'>) => void;
  updateLoan: (l: Loan) => void;
  deleteLoan: (id: string) => void;
  addSavingsGoal: (s: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (s: SavingsGoal) => void;
  setBudget: (b: Omit<Budget, 'id'>) => void;
  toggleTheme: () => void;
  setHistorySearchTerm: (term: string) => void;
  setLang: (lang: 'bn' | 'en') => void;
  importState: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem('hisab_rokkhok_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialState;
      }
    }
    return initialState;
  });
  
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Initial Auth Load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setState(s => ({ ...s, user: { id: session.user.id, name: session.user.user_metadata?.name || 'User', email: session.user.email || '', avatarUrl: session.user.user_metadata?.avatarUrl || '' } }));
        loadFromSupabase(session.user.id);
      } else {
        isInitialLoad.current = false;
      }
    });

    // Listen to Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setState(s => ({ ...s, user: { id: session.user.id, name: session.user.user_metadata?.name || 'User', email: session.user.email || '', avatarUrl: session.user.user_metadata?.avatarUrl || '' } }));
        loadFromSupabase(session.user.id);
      } else {
        setState(s => ({ ...initialState, isDark: s.isDark }));
        isInitialLoad.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadFromSupabase = async (userId: string) => {
    const { data, error } = await supabase.from('app_sync_state').select('state').eq('user_id', userId).single();
    const { data: profile } = await supabase.from('profiles').select('name, avatar_url').eq('id', userId).single();

    if (data && data.state) {
      setState(s => {
        const nextState = { 
          ...s, 
          ...data.state, 
          user: s.user ? { 
              ...s.user, 
              name: profile?.name || s.user.name, 
              avatarUrl: profile?.avatar_url || s.user.avatarUrl 
          } : s.user 
        };
        // Signal that remote state is loaded so we don't overwrite it immediately
        isInitialLoad.current = false;
        return nextState;
      });
    } else if (profile) {
      setState(s => {
        const nextState = s.user ? { ...s, user: { ...s.user, name: profile.name, avatarUrl: profile.avatar_url } } : s;
        isInitialLoad.current = false;
        return nextState;
      });
    } else {
        isInitialLoad.current = false;
    }
  };

  useEffect(() => {
    // LocalStorage fallback
    localStorage.setItem('hisab_rokkhok_data', JSON.stringify(state));
    
    // Remote Sync (debounced)
    if (!isInitialLoad.current && state.user) {
      const stateToSave = { ...state };
      // @ts-ignore
      delete stateToSave.user;
      
      const timeout = setTimeout(() => {
        supabase.from('app_sync_state').upsert({
          user_id: state.user!.id,
          state: stateToSave,
          updated_at: new Date().toISOString()
        }).then();
      }, 1000);
      
      if (state.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return () => clearTimeout(timeout);
    }
    
    if (state.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const login = (name: string, email: string) => {
    // Left for local dev compatibility if needed, but Supabase handles real login
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (name: string, avatarUrl: string) => {
    if (state.user) {
        await supabase.from('profiles').upsert({
            id: state.user.id,
            name: name,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
        });
        setState(s => s.user ? { ...s, user: { ...s.user, name, avatarUrl } } : s);
    }
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    setState((s) => ({
      ...s,
      transactions: [{ ...t, id: uuidv4() }, ...s.transactions],
    }));
  };

  const deleteTransaction = (id: string) => {
    setState((s) => ({
      ...s,
      transactions: s.transactions.filter((t) => t.id !== id),
    }));
  };

  const addCategory = (c: Omit<Category, 'id'>) => {
    setState((s) => ({
      ...s,
      categories: [...s.categories, { ...c, id: uuidv4() }],
    }));
  };

  const updateCategory = (c: Category) => {
    setState((s) => ({
      ...s,
      categories: s.categories.map((cat) => (cat.id === c.id ? c : cat)),
    }));
  };

  const deleteCategory = (id: string) => {
    setState((s) => ({
      ...s,
      categories: s.categories.filter((cat) => cat.id !== id),
    }));
  };

  const addPaymentMethod = (pm: Omit<PaymentMethod, 'id'>) => {
    setState((s) => ({
      ...s,
      paymentMethods: [...s.paymentMethods, { ...pm, id: uuidv4() }],
    }));
  };

  const updatePaymentMethod = (pm: PaymentMethod) => {
    setState((s) => ({
      ...s,
      paymentMethods: s.paymentMethods.map((p) => (p.id === pm.id ? pm : p)),
    }));
  };

  const deletePaymentMethod = (id: string) => {
    setState((s) => ({
      ...s,
      paymentMethods: s.paymentMethods.filter((p) => p.id !== id),
    }));
  };

  const addLoan = (l: Omit<Loan, 'id'>) => {
    setState((s) => ({
      ...s,
      loans: [{ ...l, id: uuidv4() }, ...s.loans],
    }));
  };

  const updateLoan = (l: Loan) => {
    setState((s) => ({
      ...s,
      loans: s.loans.map((loan) => (loan.id === l.id ? l : loan)),
    }));
  };

  const deleteLoan = (id: string) => {
    setState((s) => ({
      ...s,
      loans: s.loans.filter((loan) => loan.id !== id),
    }));
  };

  const addSavingsGoal = (sg: Omit<SavingsGoal, 'id'>) => {
    setState((s) => ({
      ...s,
      savingsGoals: [...s.savingsGoals, { ...sg, id: uuidv4() }],
    }));
  };

  const updateSavingsGoal = (sg: SavingsGoal) => {
    setState((s) => ({
      ...s,
      savingsGoals: s.savingsGoals.map((g) => (g.id === sg.id ? sg : g)),
    }));
  };

  const setBudget = (b: Omit<Budget, 'id'>) => {
    setState((s) => {
      const existing = s.budgets.find(
        (bg) => bg.categoryId === b.categoryId && bg.month === b.month
      );
      if (existing) {
        return {
          ...s,
          budgets: s.budgets.map((bg) =>
            bg.id === existing.id ? { ...bg, amount: b.amount } : bg
          ),
        };
      } else {
        return {
          ...s,
          budgets: [...s.budgets, { ...b, id: uuidv4() }],
        };
      }
    });
  };

  const toggleTheme = () => {
    setState((s) => ({ ...s, isDark: !s.isDark }));
  };

  const setHistorySearchTerm = (term: string) => {
    setState((s) => ({ ...s, historySearchTerm: term }));
  };

  const setLang = (lang: 'bn' | 'en') => {
    setState((s) => ({ ...s, lang }));
  };

  const importState = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        setState((s) => ({ ...s, ...parsed, user: s.user }));
        return true;
      }
      return false;
    } catch(e) {
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateProfile,
        addTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        addLoan,
        updateLoan,
        deleteLoan,
        addSavingsGoal,
        updateSavingsGoal,
        setBudget,
        toggleTheme,
        setHistorySearchTerm,
        setLang,
        importState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
