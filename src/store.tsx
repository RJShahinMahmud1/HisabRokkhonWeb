import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Category, PaymentMethod, Transaction, Budget, Loan, SavingsGoal, User, Post } from './types';
import { auth, db, handleFirestoreError, OperationType, updateUserProfile } from './lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

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
  posts: Post[];
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
  posts: [],
};

interface AppContextType extends State {
  login: (name: string, email: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addPost: (p: Omit<Post, 'id'>) => void;
  deletePost: (id: string) => void;
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        isInitialLoad.current = true;
        setState(s => ({ ...s, user: { ...s.user, id: user.uid, name: user.displayName || 'User', email: user.email || '', avatarUrl: user.photoURL || '' } }));
        loadFromFirebase(user.uid);
      } else {
        setState(s => ({ ...initialState, isDark: s.isDark }));
      }
    });

    return () => unsubscribe();
  }, []);

  const loadFromFirebase = async (userId: string) => {
    try {
      const docRef = doc(db, 'userStates', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.stateStr) {
          const remoteState = JSON.parse(data.stateStr);
          
          const nextName = auth.currentUser?.displayName || remoteState.user?.name || 'User';
          const nextAvatar = auth.currentUser?.photoURL || remoteState.user?.avatarUrl || '';
          
          // Background sync to publicProfiles
          setDoc(doc(db, 'publicProfiles', userId), {
             name: nextName,
             avatarUrl: nextAvatar,
             updatedAt: serverTimestamp()
          }, { merge: true }).catch(console.error);
          
          setState(s => {
            const nextState = { 
              ...s, 
              ...remoteState, 
              user: s.user ? { 
                  ...(remoteState.user || {}),
                  name: nextName, 
                  avatarUrl: nextAvatar
              } : s.user 
            };
            isInitialLoad.current = false;
            return nextState;
          });
          return;
        }
      }
      
      // If doc doesn't exist or didn't return early
      const fallbackName = auth.currentUser?.displayName || 'User';
      const fallbackAvatar = auth.currentUser?.photoURL || '';
      setDoc(doc(db, 'publicProfiles', userId), {
         name: fallbackName,
         avatarUrl: fallbackAvatar,
         updatedAt: serverTimestamp()
      }, { merge: true }).catch(console.error);
      
      isInitialLoad.current = false;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `userStates/${userId}`);
      isInitialLoad.current = false;
    }
  };

  useEffect(() => {
    // LocalStorage fallback
    localStorage.setItem('hisab_rokkhok_data', JSON.stringify(state));
    
    // Remote Sync (debounced)
    if (!isInitialLoad.current && state.user) {
      const stateToSave = { ...state };
      
      const timeout = setTimeout(async () => {
         try {
           const docRef = doc(db, 'userStates', state.user!.id);
           await setDoc(docRef, {
             userId: state.user!.id,
             stateStr: JSON.stringify(stateToSave),
             updatedAt: serverTimestamp()
           }, { merge: true });
         } catch (error) {
           handleFirestoreError(error, OperationType.WRITE, `userStates/${state.user!.id}`);
         }
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
    await auth.signOut();
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (updates.name || updates.avatarUrl !== undefined) {
          const currentName = updates.name || state.user?.name || 'User';
          const currentAvatar = updates.avatarUrl !== undefined ? updates.avatarUrl : (state.user?.avatarUrl || '');
          
          if (currentAvatar.length > 2000) {
             // Too long for Firebase Auth photoURL (typically means it's base64), update only name
             await updateUserProfile(currentName, '');
          } else {
             await updateUserProfile(currentName, currentAvatar);
          }
          
          if (state.user?.id) {
            await setDoc(doc(db, 'publicProfiles', state.user.id), {
              name: currentName,
              avatarUrl: currentAvatar,
              updatedAt: serverTimestamp()
            }, { merge: true }).catch(e => console.error("Could not sync public profile", e));
          }
      }
      setState(s => s.user ? { ...s, user: { ...s.user, ...updates } } : s);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const addPost = (p: Omit<Post, 'id'>) => {
    setState((s) => ({
      ...s,
      posts: [{ ...p, id: uuidv4() }, ...(s.posts || [])],
    }));
  };

  const deletePost = (id: string) => {
    setState((s) => ({
      ...s,
      posts: (s.posts || []).filter((post) => post.id !== id),
    }));
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
        addPost,
        deletePost,
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
