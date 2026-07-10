import React, { useState } from "react";
import { useAppStore } from "../store";
import { formatBDT } from "../lib/utils";
import {
  Bell,
  ChevronDown,
  BookOpen,
  Receipt,
  FileText,
  PieChart,
  Wallet,
  Activity,
  ScanLine,
  User as UserIcon,
  Settings,
  Sun,
  Moon,
  Globe,
  MessageCircle,
  Shield,
  UserCircle,
  Users
} from "lucide-react";
import { ViewState } from "../types";
import { motion } from "motion/react";

export function DashboardView({
  onChangeView,
  onViewProfile,
}: {
  onChangeView: (view: ViewState) => void;
  onViewProfile?: (uid: string) => void;
}) {
  const {
    user,
    transactions,
    categories,
    setHistorySearchTerm,
    isDark,
    toggleTheme,
    lang,
    setLang,
    loans,
    savingsGoals,
  } = useAppStore();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  let currentBalance = totalIncome - totalExpense;
  loans.forEach((loan) => {
    if (loan.type === "loan_given") {
      currentBalance -= loan.amount - loan.repaidAmount;
    } else if (loan.type === "loan_taken") {
      currentBalance += loan.amount - loan.repaidAmount;
    }
  });
  savingsGoals.forEach((goal) => {
    currentBalance -= goal.savedAmount;
  });

  const incomeCount = transactions.filter((t) => t.type === "income").length;
  const expenseCount = transactions.filter((t) => t.type === "expense").length;
  const totalCount = transactions.length;

  const t = {
    welcome:
      lang === "hi" ? "स्वागत हे" : lang === "bn" ? "সুস্বাগতম" : "Welcome",
    accountant:
      lang === "hi" ? "मुनीम" : lang === "bn" ? "হিসাব রক্ষক" : "Accountant",
    balance:
      lang === "hi"
        ? "कुल जमा राशि"
        : lang === "bn"
          ? "কারেন্ট ব্যালেন্স"
          : "Current Balance",
    transactions:
      lang === "hi" ? "लेनदेन" : lang === "bn" ? "লেনদেন" : "Transactions",
    income: lang === "hi" ? "आय" : lang === "bn" ? "আয়" : "Income",
    expense: lang === "hi" ? "व्यय" : lang === "bn" ? "ব্যয়" : "Expense",
    history: lang === "hi" ? "इतिहास" : lang === "bn" ? "সব ইতিহাস" : "History",
    allHistory:
      lang === "hi" ? "सभी इतिहास" : lang === "bn" ? "সব হিসাব" : "All History",
    newIncome:
      lang === "hi" ? "नई आय" : lang === "bn" ? "নতুন আয়" : "New Income",
    newExpense:
      lang === "hi" ? "नया व्यय" : lang === "bn" ? "নতুন ব্যয়" : "New Expense",
    budget: lang === "hi" ? "बजट" : lang === "bn" ? "লাভ-ক্ষতি" : "Budget",
    loans: lang === "hi" ? "ऋण / उधारी" : lang === "bn" ? "উধারি" : "Loans",
    reports: lang === "hi" ? "रिपोर्ट" : lang === "bn" ? "রিপোর্ট" : "Reports",
    savings: lang === "hi" ? "बचत" : lang === "bn" ? "সঞ্চয়" : "Savings",
    profile: "SM Social",
    settings:
      lang === "hi"
        ? "श्रेणी प्रबंधन"
        : lang === "bn"
          ? "ক্যাটাগরি ম্যানেজমেন্ট"
          : "Category Mgmt",
    messages: lang === "hi" ? "संदेश" : lang === "bn" ? "মেসেজিং" : "Messaging",
    allTransactions:
      lang === "hi" ? "सभी लेनदेन" : lang === "bn" ? "সব লেনদেন" : "All Trx",
    totalIncome:
      lang === "hi" ? "कुल आय" : lang === "bn" ? "মোট আয়" : "Total Income",
    totalExpense:
      lang === "hi" ? "कुल व्यय" : lang === "bn" ? "মোট ব্যয়" : "Total Expense",
  };

  const [totalUnread, setTotalUnread] = React.useState(0);
  React.useEffect(() => {
    if (!user) return;
    let unsub: (() => void) | null = null;
    let isMounted = true;
    import("firebase/firestore").then(
      ({ query, collection, where, onSnapshot }) => {
        import("../lib/firebase").then(({ db }) => {
          if (!isMounted) return;
          unsub = onSnapshot(
            query(
              collection(db, "conversations"),
              where("participants", "array-contains", user.id),
            ),
            (snapshot) => {
              let unread = 0;
              snapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (data.unreadCount && data.unreadCount[user.id] > 0) {
                  unread += data.unreadCount[user.id];
                }
              });
              setTotalUnread(unread);
            },
            (error) => {
              // Ignore silent permission errors on logout
            },
          );
        });
      },
    );
    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, [user]);

  const menuItems = [
    {
      icon: <BookOpen strokeWidth={1.5} size={26} className="text-[#32C58F]" />,
      label: t.allHistory,
      view: "history",
    },
    {
      icon: <Receipt strokeWidth={1.5} size={26} className="text-[#32C58F]" />,
      label: t.newIncome,
      view: "income",
    },
    {
      icon: <FileText strokeWidth={1.5} size={26} className="text-[#32C58F]" />,
      label: t.newExpense,
      view: "expense",
    },
    {
      icon: <PieChart strokeWidth={1.5} size={26} className="text-[#32C58F]" />,
      label: t.budget,
      view: "budget",
    },
    {
      icon: <Wallet strokeWidth={1.5} size={26} className="text-[#32C58F]" />,
      label: t.loans,
      view: "loans",
    },
    {
      icon: <Activity strokeWidth={1.5} size={26} className="text-[#32C58F]" />,
      label: t.reports,
      view: "reports",
    },
    {
      icon: (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[#32C58F]"
        >
          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.5-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"></path>
          <path d="M2 9v1c0 1.1.9 2 2 2h1"></path>
          <path d="M16 11h0"></path>
        </svg>
      ),
      label: t.savings,
      view: "savings",
    },
    {
      icon: <Users strokeWidth={1.5} size={26} className="text-[#32C58F]" />,
      label: "SM Social",
      view: "profile",
    },
    {
      icon: <UserCircle strokeWidth={1.5} size={26} className="text-[#32C58F]" />,
      label: "Profile",
      view: "my_profile",
    },
    {
      icon: (
        <div className="relative">
          <MessageCircle strokeWidth={1.5} size={26} className="text-[#32C58F]" />
          {totalUnread > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>}
        </div>
      ),
      label: t.messages,
      view: "messages",
    },
    {
      icon: <Settings strokeWidth={1.5} size={26} className="text-[#32C58F]" />,
      label: t.settings,
      view: "settings",
    },
    ...(user?.role === 'admin' ? [{
      icon: <Shield strokeWidth={1.5} size={26} className="text-[#32C58F]" />,
      label: "Admin Panel",
      view: "admin",
    }] : [])
  ];

  return (
    <div className="relative pb-24 font-sans max-w-lg mx-auto md:max-w-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 md:hidden">
        <div className="flex items-center gap-3">
          <button className="relative cursor-default">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                  <UserIcon size={24} className="text-emerald-600" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {lang === "bn" ? "হাই" : "Hi"}, {user?.name.split(" ")[0]}!
            </h2>
            <div className="flex items-center text-xs font-semibold bg-blue-500 text-white px-2.5 py-0.5 rounded-full mt-0.5 max-w-max">
              {t.accountant}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300"
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="p-2 flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold text-sm"
          >
            <Globe size={24} />
            <span className="uppercase">{lang}</span>
          </button>
        </div>
      </div>

      {/* Modern Desktop Header Header Placeholder if needed */}
      <div className="hidden md:flex justify-between items-center mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <button className="relative cursor-default">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                  <UserIcon size={24} className="text-emerald-600" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t.welcome}, {user?.name.split(" ")[0]}! 👋
            </h2>
            <div className="flex items-center gap-2 mt-1 hidden"></div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => onChangeView("income")}
            className="bg-emerald-500 text-white px-4 sm:px-6 py-2 rounded-full font-bold shadow-md shadow-emerald-500/20 flex items-center gap-2 hover:bg-emerald-600 transition"
          >
            <span>+</span> IN
          </button>
          <button
            onClick={() => {
              setHistorySearchTerm("");
              onChangeView("history");
            }}
            className="bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-4 sm:px-6 py-2 rounded-full font-bold shadow-md shadow-slate-500/20 flex items-center gap-2 hover:bg-slate-700 dark:hover:bg-slate-300 transition"
          >
            ALL TRX
          </button>
          <button
            onClick={() => onChangeView("expense")}
            className="bg-rose-500 text-white px-4 sm:px-6 py-2 rounded-full font-bold shadow-md shadow-rose-500/20 flex items-center gap-2 hover:bg-rose-600 transition"
          >
            <span>-</span> OUT
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#EAF7ED] dark:bg-emerald-950/30 rounded-3xl p-3 sm:p-4 text-center border-b-4 border-emerald-100/50 dark:border-emerald-900/50">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#38B06B] dark:text-emerald-400">
            {totalCount}
          </h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">
            {t.transactions}
          </p>
        </div>
        <div className="bg-[#FFF0F0] dark:bg-rose-950/30 rounded-3xl p-3 sm:p-4 text-center border-b-4 border-rose-100/50 dark:border-rose-900/50">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F05E5E] dark:text-rose-400">
            {incomeCount}
          </h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">
            {t.income}
          </p>
        </div>
        <div className="bg-[#FFF7EA] dark:bg-amber-950/30 rounded-3xl p-3 sm:p-4 text-center border-b-4 border-amber-100/50 dark:border-amber-900/50">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#F5B546] dark:text-amber-500">
            {expenseCount}
          </h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase">
            {t.expense}
          </p>
        </div>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] border border-slate-200/10 dark:border-slate-800/80 rounded-[1.5rem] p-6 mb-6 text-white relative overflow-hidden flex flex-col justify-center min-h-[120px] shadow-[0_10px_30px_-5px_rgba(0,0,0,0.25)]">
        <div className="z-10 relative">
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2 bg-emerald-500/10 text-emerald-400 inline-block px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-sm">
            {t.balance}
          </p>
          <h3 className="text-3xl sm:text-4.5xl font-black flex items-center tracking-tight text-white">
            {formatBDT(currentBalance)}
          </h3>
        </div>
        <div className="absolute -right-10 top-0 bottom-0 w-1/2 bg-blue-500/5 skew-x-12 z-0"></div>
        <div className="absolute right-[-10%] -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute top-4 right-5 p-3 bg-white/5 dark:bg-slate-800/40 rounded-2xl border border-white/10 dark:border-slate-700/30 backdrop-blur-md z-10 text-emerald-400 dark:text-emerald-300 shadow-inner">
          <Wallet size={24} />
        </div>
      </div>

      {/* Pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
        <button
          onClick={() => {
            setHistorySearchTerm("");
            onChangeView("history");
          }}
          className="bg-[#5C9EFC] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 whitespace-nowrap transition-transform active:scale-95 cursor-pointer"
        >
          {t.history}
        </button>
        {categories.slice(0, 5).map((category) => (
          <button
            key={category.id}
            onClick={() => {
              setHistorySearchTerm(category.name);
              onChangeView("history");
            }}
            className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-2 border-slate-100 dark:border-slate-700 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap hover:border-[#5C9EFC] transition-all-colors active:scale-95 cursor-pointer"
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Large Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChangeView("income")}
          className="bg-gradient-to-br from-[#1ACE65] to-[#12A34C] text-white rounded-[1.5rem] p-4 sm:p-5 relative overflow-hidden text-left shadow-[0_8px_20px_-6px_rgba(26,206,101,0.3)] cursor-pointer"
        >
          <div className="w-9 h-9 border border-white/30 rounded-[10px] flex items-center justify-center mb-4 bg-white/10 mt-1">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10"></path>
              <line x1="2" y1="10" x2="22" y2="10"></line>
              <path d="m16 20 2 2 4-4"></path>
            </svg>
          </div>
          <div className="absolute top-5 right-5 text-white/50">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <p className="font-bold text-[15px] sm:text-base opacity-95 mb-0.5 tracking-tight">
            {t.totalIncome}{" "}
            <span className="opacity-70 font-medium ml-1">✓</span>
          </p>
          <h3 className="text-[22px] sm:text-2xl font-black tracking-tight">
            {formatBDT(totalIncome).replace("৳", "৳ ")}
          </h3>
          <p className="text-[10px] sm:text-xs font-semibold opacity-75 mt-1 sm:mt-1.5 uppercase">
            {t.allTransactions}
          </p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChangeView("expense")}
          className="bg-gradient-to-br from-[#E7484B] to-[#C93538] text-white rounded-[1.5rem] p-4 sm:p-5 relative overflow-hidden text-left shadow-[0_8px_20px_-6px_rgba(231,72,75,0.3)] cursor-pointer"
        >
          <div className="w-9 h-9 border border-white/30 rounded-[10px] flex items-center justify-center mb-4 bg-white/10 mt-1">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10"></path>
              <line x1="2" y1="10" x2="22" y2="10"></line>
              <polyline points="15 16 19 20 23 16"></polyline>
            </svg>
          </div>
          <div className="absolute top-5 right-5 text-white/50">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </div>
          <p className="font-bold text-[15px] sm:text-base opacity-95 mb-0.5 tracking-tight">
            {t.totalExpense}{" "}
            <span className="opacity-70 font-medium ml-1">↗</span>
          </p>
          <h3 className="text-[22px] sm:text-2xl font-black tracking-tight">
            {formatBDT(totalExpense).replace("৳", "৳ ")}
          </h3>
          <p className="text-[10px] sm:text-xs font-semibold opacity-75 mt-1 sm:mt-1.5 uppercase">
            {t.allTransactions}
          </p>
        </motion.button>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        {menuItems.map((item, idx) => (
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            key={idx}
            onClick={() => {
              if (item.view === "my_profile") {
                if (onViewProfile && user) onViewProfile(user.id);
              } else {
                onChangeView(item.view as ViewState);
              }
            }}
            className="group relative bg-white dark:bg-slate-800 rounded-[1.5rem] p-3 sm:p-4 py-4 sm:py-5 flex flex-col items-center justify-center gap-2 sm:gap-3 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] transition-all text-center h-full hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)] hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer overflow-hidden z-10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-[-1]" />
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -5, 5, -2, 2, 0] }}
              transition={{ duration: 0.5, ease: "easeInOut", repeat: 0 }}
              whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.15 }}
              className="w-[44px] sm:w-[50px] h-[44px] sm:h-[50px] rounded-2xl border-[1.5px] border-[#DDF6EE] dark:border-[#DDF6EE]/25 flex items-center justify-center mb-1 bg-gradient-to-br from-[#f2fcf9] to-white dark:from-slate-800 dark:to-slate-900 shadow-inner group-hover:from-blue-50 group-hover:to-white dark:group-hover:from-blue-900/20 dark:group-hover:to-slate-800 group-hover:border-blue-200 dark:group-hover:border-blue-500/30 transition-colors"
            >
              <div 
                className="text-[#32C58F] drop-shadow-md"
                style={{ filter: "drop-shadow(0px 2px 4px rgba(50, 197, 143, 0.4))" }}
              >
                {item.icon}
              </div>
            </motion.div>
            <span className="text-[11px] sm:text-[13px] font-bold text-slate-600 dark:text-slate-300 tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full px-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 sm:bottom-12 md:bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center bg-white dark:bg-slate-800 rounded-full shadow-[0_4px_30px_rgb(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 px-6 sm:px-8 py-2.5 gap-6 sm:gap-8 md:hidden">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChangeView("income")}
          className="flex items-center gap-1.5 font-black tracking-tight text-[#14C969] hover:text-[#10A956] transition-colors whitespace-nowrap"
        >
          <span className="text-[#14C969] text-base font-bold">৳</span> IN
        </motion.button>

        <div className="relative -mt-7">
          <motion.button
            whileHover={{ scale: 1.1, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setHistorySearchTerm("");
              onChangeView("history");
            }}
            className="px-4 h-12 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 rounded-full flex items-center justify-center shadow-lg shadow-slate-500/20 border-[3.5px] border-white dark:border-slate-800 transition-all font-black tracking-wide text-xs whitespace-nowrap"
          >
            ALL TRX
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChangeView("expense")}
          className="flex items-center gap-1.5 font-black tracking-tight text-[#EF4444] hover:text-[#DC2626] transition-colors whitespace-nowrap"
        >
          <span className="text-[#EF4444] text-base font-bold">৳</span> OUT
        </motion.button>
      </div>
    </div>
  );
}
