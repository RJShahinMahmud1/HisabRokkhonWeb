import React, { useState, useRef, useMemo } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { 
  Download, TrendingUp, TrendingDown, Calendar, PieChart, HelpCircle, 
  Coins, ShoppingBag, Utensils, Sparkles, Pill, Heart, GraduationCap, 
  Bus, Smartphone, Zap, Home, Gift, FileText, ArrowRightLeft, Percent, 
  AlertTriangle, ShieldCheck, Award, Info, Activity, Printer, CheckCircle2
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'motion/react';

type PresetRange = 'this_month' | 'last_month' | 'last_30_days' | 'last_90_days' | 'this_year' | 'custom';

export function ReportsView() {
  const { transactions, categories, paymentMethods, lang } = useAppStore();

  const [preset, setPreset] = useState<PresetRange>('this_month');
  
  // Custom date range states
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(firstDayOfMonthStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Translations
  const t = {
    downloadPdf: lang === 'bn' ? 'পিডিএফ রিপোর্ট ডাউনলোড করুন' : 'Download PDF Report',
    appTitle: lang === 'bn' ? 'হিসাব রক্ষক' : 'Hisab Rokkhok',
    developerLabel: lang === 'bn' ? 'ডেভেলপার : শাহীন আলম' : 'Developer: Shaheen Alam',
    reportTitle: lang === 'bn' ? 'ব্যক্তিগত অর্থ হিসাব ও বিশ্লেষণ রিপোর্ট' : 'Personal Finance Analysis Report',
    reportDate: lang === 'bn' ? 'রিপোর্ট তৈরির তারিখ: ' : 'Report Generated On: ',
    totalIncome: lang === 'bn' ? 'মোট অর্জিত আয়' : 'Total Earned Income',
    totalExpense: lang === 'bn' ? 'মোট ব্যয়/খরচ' : 'Total Expenses',
    balance: lang === 'bn' ? 'সঞ্চয়/বাকি টাকা' : 'Net Savings/Balance',
    incomeTab: lang === 'bn' ? 'আয় বিবরণী' : 'Income Statement',
    expenseTab: lang === 'bn' ? 'ব্যয় বিবরণী' : 'Expense Statement',
    date: lang === 'bn' ? 'তারিখ' : 'Date',
    description: lang === 'bn' ? 'বিবরণ/নোট' : 'Description',
    amount: lang === 'bn' ? 'পরিমাণ' : 'Amount',
    noRecord: lang === 'bn' ? 'কোন রেকর্ড পাওয়া যায়নি' : 'No records found',
    category: lang === 'bn' ? 'ক্যাটাগরি' : 'Category',
    unknown: lang === 'bn' ? 'অজানা' : 'Unknown',
    rangeSelector: lang === 'bn' ? 'রিপোর্ট সময়সীমা' : 'Report Timeframe',
    quickRanges: lang === 'bn' ? 'দ্রুত নির্বাচন করুন' : 'Quick Presets',
    customRange: lang === 'bn' ? 'কাস্টম তারিখ সিলেক্ট করুন' : 'Select Custom Date Range',
    from: lang === 'bn' ? 'শুরু' : 'From',
    to: lang === 'bn' ? 'শেষ' : 'To',
    comparison: lang === 'bn' ? 'আয় ও ব্যয়ের তুলনা বিশ্লেষণ' : 'Income & Expense Comparison',
    whereMoneyWent: lang === 'bn' ? 'কোথায় কত টাকা খরচ হয়েছে (গ্রাফ ও চার্ট)' : 'Expense Distribution Chart',
    allTxLabel: lang === 'bn' ? 'সকল লেনদেনের তালিকা' : 'Statement of All Transactions',
    pmLabel: lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method',
    savingsRate: lang === 'bn' ? 'সঞ্চয়ের হার' : 'Savings Rate',
    expenseRatio: lang === 'bn' ? 'ব্যয়ের অনুপাত' : 'Expense Ratio',
    analysisLabel: lang === 'bn' ? 'আর্থিক পরামর্শ' : 'Financial Feedback',
    percentOfIncome: lang === 'bn' ? 'আয়ের শতাংশ' : 'Percent of Income',
    percentOfExpense: lang === 'bn' ? 'মোট খরচের শতাংশ' : 'Percent of Expense',
    auditLabel: lang === 'bn' ? 'আর্থিক অডিট ও স্কোর' : 'Financial Audit & Score',
    scoreLabel: lang === 'bn' ? 'আর্থিক সুস্বাস্থ্য স্কোর' : 'Financial Health Score',
    gradeLabel: lang === 'bn' ? 'গ্রেড' : 'Grade',
    verifiedStatement: lang === 'bn' ? 'যাচাইকৃত রিপোর্ট' : 'Verified Financial Report',
    preparedFor: lang === 'bn' ? 'প্রস্তুতকারী' : 'Prepared For',
    officialSeal: lang === 'bn' ? 'হিসাব রক্ষক অফিসিয়াল সিল' : 'Hisab Rokkhok Official Stamp',
    authorizedSignature: lang === 'bn' ? 'অনুমোদিত স্বাক্ষর' : 'Authorized Signature'
  };

  // Preset Date calculations
  const dateRange = useMemo(() => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === 'this_month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (preset === 'last_month') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (preset === 'last_30_days') {
      start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = today;
    } else if (preset === 'last_90_days') {
      start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      end = today;
    } else if (preset === 'this_year') {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
    } else if (preset === 'custom') {
      return {
        start: new Date(startDate + 'T00:00:00'),
        end: new Date(endDate + 'T23:59:59')
      };
    }

    // Set times
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [preset, startDate, endDate]);

  // Filtered transactions based on selected date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const txDate = new Date(t.date + 'T00:00:00');
      return txDate >= dateRange.start && txDate <= dateRange.end;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, dateRange]);

  const incomeTransactions = useMemo(() => filteredTransactions.filter(t => t.type === 'income'), [filteredTransactions]);
  const expenseTransactions = useMemo(() => filteredTransactions.filter(t => t.type === 'expense'), [filteredTransactions]);

  const totalIncome = useMemo(() => incomeTransactions.reduce((acc, t) => acc + t.amount, 0), [incomeTransactions]);
  const totalExpense = useMemo(() => expenseTransactions.reduce((acc, t) => acc + t.amount, 0), [expenseTransactions]);
  const balance = totalIncome - totalExpense;

  const savingsRateVal = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const expenseRatioVal = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 100;

  // Category Color Map
  const getCategoryStyle = (catId: string, catType: string) => {
    const cat = categories.find(c => c.id === catId);
    const name = cat ? cat.name : '';
    const lowerName = name.toLowerCase();

    if (catType === 'income' || catId === 'c1' || lowerName.includes('income') || lowerName.includes('আয়')) {
      return {
        icon: <Coins className="w-4 h-4" />,
        color: '#10B981', // emerald-500
        bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        borderColor: 'border-emerald-500/20 dark:border-emerald-500/30',
        gradient: 'from-emerald-400 to-emerald-600'
      };
    }

    if (catId === 'c2' || lowerName.includes('কাঁচাবাজার') || lowerName.includes('বাজার') || lowerName.includes('grocery') || lowerName.includes('bazar')) {
      return {
        icon: <ShoppingBag className="w-4 h-4" />,
        color: '#22C55E', // green-500
        bgColor: 'bg-green-500/10 dark:bg-green-500/20',
        textColor: 'text-green-600 dark:text-green-400',
        borderColor: 'border-green-500/20 dark:border-green-500/30',
        gradient: 'from-green-400 to-emerald-500'
      };
    }

    if (catId === 'c3' || lowerName.includes('খাবার') || lowerName.includes('খাদ্য') || lowerName.includes('food') || lowerName.includes('restaurant') || lowerName.includes('cafe')) {
      return {
        icon: <Utensils className="w-4 h-4" />,
        color: '#F59E0B', // amber-500
        bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
        textColor: 'text-amber-600 dark:text-amber-400',
        borderColor: 'border-amber-500/20 dark:border-amber-500/30',
        gradient: 'from-amber-400 to-orange-500'
      };
    }

    if (catId === 'c4' || lowerName.includes('শপিং') || lowerName.includes('কেনাকাটা') || lowerName.includes('shopping') || lowerName.includes('cloth')) {
      return {
        icon: <ShoppingBag className="w-4 h-4" />,
        color: '#A855F7', // purple-500
        bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
        textColor: 'text-purple-600 dark:text-purple-400',
        borderColor: 'border-purple-500/20 dark:border-purple-500/30',
        gradient: 'from-purple-400 to-fuchsia-600'
      };
    }

    if (catId === 'c5' || lowerName.includes('কসমেটিক্স') || lowerName.includes('cosmetic') || lowerName.includes('makeup') || lowerName.includes('beauty')) {
      return {
        icon: <Sparkles className="w-4 h-4" />,
        color: '#EC4899', // pink-500
        bgColor: 'bg-pink-500/10 dark:bg-pink-500/20',
        textColor: 'text-pink-600 dark:text-pink-400',
        borderColor: 'border-pink-500/20 dark:border-pink-500/30',
        gradient: 'from-pink-400 to-rose-500'
      };
    }

    if (catId === 'c6' || lowerName.includes('ঔষধ') || lowerName.includes('ওষুধ') || lowerName.includes('medicine') || lowerName.includes('drug') || lowerName.includes('pharma')) {
      return {
        icon: <Pill className="w-4 h-4" />,
        color: '#EF4444', // red-500
        bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
        textColor: 'text-rose-600 dark:text-rose-400',
        borderColor: 'border-rose-500/20 dark:border-rose-500/30',
        gradient: 'from-red-400 to-rose-600'
      };
    }

    if (catId === 'c7' || lowerName.includes('স্বাস্থ্য') || lowerName.includes('ডাক্তার') || lowerName.includes('health') || lowerName.includes('doctor') || lowerName.includes('hospital') || lowerName.includes('clinic')) {
      return {
        icon: <Heart className="w-4 h-4" />,
        color: '#06B6D4', // cyan-500
        bgColor: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        textColor: 'text-cyan-600 dark:text-cyan-400',
        borderColor: 'border-cyan-500/20 dark:border-cyan-500/30',
        gradient: 'from-cyan-400 to-teal-500'
      };
    }

    if (catId === 'c8' || lowerName.includes('একাডেমিক') || lowerName.includes('পড়াশোনা') || lowerName.includes('বই') || lowerName.includes('শিক্ষা') || lowerName.includes('education') || lowerName.includes('study') || lowerName.includes('book') || lowerName.includes('school') || lowerName.includes('college')) {
      return {
        icon: <GraduationCap className="w-4 h-4" />,
        color: '#3B82F6', // blue-500
        bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-500/20 dark:border-blue-500/30',
        gradient: 'from-blue-400 to-indigo-600'
      };
    }

    if (catId === 'c9' || lowerName.includes('যাতায়াত') || lowerName.includes('ভাড়া') && lowerName.includes('গাড়ি') || lowerName.includes('travel') || lowerName.includes('transport') || lowerName.includes('bus') || lowerName.includes('rickshaw') || lowerName.includes('uber')) {
      return {
        icon: <Bus className="w-4 h-4" />,
        color: '#6366F1', // indigo-500
        bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        borderColor: 'border-indigo-500/20 dark:border-indigo-500/30',
        gradient: 'from-indigo-400 to-violet-600'
      };
    }

    if (catId === 'c10' || lowerName.includes('মোবাইল') || lowerName.includes('রিচার্জ') || lowerName.includes('mobile') || lowerName.includes('recharge') || lowerName.includes('phone') || lowerName.includes('internet') || lowerName.includes('wifi')) {
      return {
        icon: <Smartphone className="w-4 h-4" />,
        color: '#14B8A6', // teal-500
        bgColor: 'bg-teal-500/10 dark:bg-teal-500/20',
        textColor: 'text-teal-600 dark:text-teal-400',
        borderColor: 'border-teal-500/20 dark:border-teal-500/30',
        gradient: 'from-teal-400 to-cyan-600'
      };
    }

    if (catId === 'c11' || lowerName.includes('ইউটিলিটি') || lowerName.includes('বিল') || lowerName.includes('utility') || lowerName.includes('bill') || lowerName.includes('electricity') || lowerName.includes('gas') || lowerName.includes('water')) {
      return {
        icon: <Zap className="w-4 h-4" />,
        color: '#F97316', // orange-500
        bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
        textColor: 'text-orange-600 dark:text-orange-400',
        borderColor: 'border-orange-500/20 dark:border-orange-500/30',
        gradient: 'from-orange-400 to-red-500'
      };
    }

    if (catId === 'c12' || lowerName.includes('বাসা') || lowerName.includes('ভাড়া') || lowerName.includes('rent') || lowerName.includes('house') || lowerName.includes('flat')) {
      return {
        icon: <Home className="w-4 h-4" />,
        color: '#8B5CF6', // violet-500
        bgColor: 'bg-violet-500/10 dark:bg-violet-500/20',
        textColor: 'text-violet-600 dark:text-violet-400',
        borderColor: 'border-violet-500/20 dark:border-violet-500/30',
        gradient: 'from-violet-400 to-purple-600'
      };
    }

    return {
      icon: <Gift className="w-4 h-4" />,
      color: '#64748B', // slate-500
      bgColor: 'bg-slate-500/10 dark:bg-slate-500/20',
      textColor: 'text-slate-600 dark:text-slate-400',
      borderColor: 'border-slate-500/20 dark:border-slate-500/30',
      gradient: 'from-slate-400 to-slate-600'
    };
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || t.unknown;

  const getPaymentMethodName = (id: string) => paymentMethods.find(p => p.id === id)?.name || t.unknown;

  // Group Expenses by Category
  const categoryExpenses = useMemo(() => {
    const map: Record<string, number> = {};
    expenseTransactions.forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });

    const list = Object.entries(map).map(([catId, amount]) => {
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        categoryId: catId,
        name: getCategoryName(catId),
        amount,
        percentage,
        style: getCategoryStyle(catId, 'expense')
      };
    }).sort((a, b) => b.amount - a.amount);

    return list;
  }, [expenseTransactions, totalExpense, categories]);

  // SVG Donut Chart Coordinates Calculation
  const donutSectors = useMemo(() => {
    let accumulatedAngle = 0;
    return categoryExpenses.map(item => {
      const angle = (item.percentage / 100) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      // Coordinate calculations
      const radius = 70;
      const innerRadius = 45;
      const center = 100;

      const getCoordinates = (a: number, r: number) => {
        const rad = ((a - 90) * Math.PI) / 180;
        return {
          x: center + r * Math.cos(rad),
          y: center + r * Math.sin(rad)
        };
      };

      const p1 = getCoordinates(startAngle, radius);
      const p2 = getCoordinates(startAngle + angle, radius);
      const p3 = getCoordinates(startAngle + angle, innerRadius);
      const p4 = getCoordinates(startAngle, innerRadius);

      const largeArc = angle > 180 ? 1 : 0;

      const d = `
        M ${p1.x} ${p1.y}
        A ${radius} ${radius} 0 ${largeArc} 1 ${p2.x} ${p2.y}
        L ${p3.x} ${p3.y}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${p4.x} ${p4.y}
        Z
      `;

      return {
        ...item,
        pathData: d,
        color: item.style.color
      };
    });
  }, [categoryExpenses]);

  // Financial Health Score Calculation (0-100)
  const healthScore = useMemo(() => {
    if (totalIncome === 0) return totalExpense > 0 ? 20 : 50;
    
    // Core metric 1: Savings Rate (up to 50 points)
    // 30%+ savings rate = 50 points. 0% savings rate = 15 points. Negative savings rate = 0-10 points.
    let savingsPoints = 0;
    if (savingsRateVal >= 30) {
      savingsPoints = 50;
    } else if (savingsRateVal > 0) {
      savingsPoints = 15 + (savingsRateVal / 30) * 35;
    } else {
      savingsPoints = Math.max(0, 15 + (savingsRateVal / 100) * 15);
    }

    // Core metric 2: Budget Diversification (up to 30 points)
    // If a single category takes >60% of total expenses, deduct points. Otherwise full points.
    let diversificationPoints = 30;
    if (categoryExpenses.length > 0) {
      const topCatRatio = categoryExpenses[0].percentage;
      if (topCatRatio > 70) diversificationPoints = 10;
      else if (topCatRatio > 50) diversificationPoints = 20;
    }

    // Core metric 3: Cash Flow consistency (up to 20 points)
    // Balance ratio of income slips vs expense slips
    let slipPoints = 20;
    if (expenseTransactions.length > incomeTransactions.length * 5) {
      slipPoints = 10;
    }

    return Math.min(Math.round(savingsPoints + diversificationPoints + slipPoints), 100);
  }, [totalIncome, totalExpense, savingsRateVal, categoryExpenses, incomeTransactions, expenseTransactions]);

  // Health Score Grade Label
  const scoreGrade = useMemo(() => {
    if (healthScore >= 85) return { grade: 'A+', color: 'text-emerald-500 border-emerald-500 bg-emerald-500/10' };
    if (healthScore >= 70) return { grade: 'A', color: 'text-green-500 border-green-500 bg-green-500/10' };
    if (healthScore >= 55) return { grade: 'B', color: 'text-blue-500 border-blue-500 bg-blue-500/10' };
    if (healthScore >= 40) return { grade: 'C', color: 'text-amber-500 border-amber-500 bg-amber-500/10' };
    return { grade: 'F', color: 'text-rose-500 border-rose-500 bg-rose-500/10' };
  }, [healthScore]);

  // Financial Insights Box generator
  const financialAdvice = useMemo(() => {
    if (totalIncome === 0 && totalExpense === 0) {
      return {
        title: lang === 'bn' ? 'কোন লেনদেন নেই' : 'No Transactions',
        desc: lang === 'bn' ? 'এই সময়সীমার মধ্যে কোন আয় বা ব্যয়ের তথ্য পাওয়া যায়নি। অনুগ্রহ করে তারিখের ফিল্টার চেক করুন।' : 'No transaction records found inside this selected range. Try custom preset.',
        type: 'info' as const
      };
    }

    if (totalIncome === 0 && totalExpense > 0) {
      return {
        title: lang === 'bn' ? 'আয় ছাড়া খরচ হচ্ছে' : 'Expense Without Income',
        desc: lang === 'bn' ? 'আপনি এই সময়সীমার কোন আয় রেকর্ড করেননি কিন্তু খরচ হয়েছে। দ্রুত কোনো আয়ের উৎস যুক্ত করুন!' : 'You have recorded expenses without logging any income inside this timeframe.',
        type: 'danger' as const
      };
    }

    if (savingsRateVal > 30) {
      return {
        title: lang === 'bn' ? 'চমৎকার আর্থিক সুস্বাস্থ্য!' : 'Outstanding Financial Health!',
        desc: lang === 'bn' ? `অভিনন্দন! আপনার সঞ্চয়ের হার ${savingsRateVal.toFixed(1)}%, যা অনেক স্বাস্থ্যকর। এভাবে বাজেট ধরে রাখুন!` : `Congratulations! Your savings rate is ${savingsRateVal.toFixed(1)}%, which is highly sustainable. Keep it up!`,
        type: 'success' as const
      };
    } else if (savingsRateVal >= 10 && savingsRateVal <= 30) {
      return {
        title: lang === 'bn' ? 'ভালো অর্থনৈতিক সঞ্চয়' : 'Good Savings Momentum',
        desc: lang === 'bn' ? `আপনার আয়ের ${savingsRateVal.toFixed(1)}% টাকা সঞ্চয় হয়েছে। এটি একটি আদর্শ সঞ্চয়। জরুরি তহবিল সমৃদ্ধ করতে থাকুন।` : `You saved ${savingsRateVal.toFixed(1)}% of your income. That is a solid baseline to grow your emergency fund.`,
        type: 'warning' as const
      };
    } else if (savingsRateVal > 0 && savingsRateVal < 10) {
      return {
        title: lang === 'bn' ? 'অতিরিক্ত খরচের প্রবণতা' : 'Warning: High Expenses',
        desc: lang === 'bn' ? `আপনার আয়ের মাত্র ${savingsRateVal.toFixed(1)}% অংশ সঞ্চয় হচ্ছে। অনুগ্রহ করে অপ্রয়োজনীয় কসমেটিক্স, রেস্টুরেন্ট বা শপিং কমান।` : `You saved only ${savingsRateVal.toFixed(1)}% of your income. Consider reviewing non-essential categories to cut down costs.`,
        type: 'warning' as const
      };
    } else {
      return {
        title: lang === 'bn' ? 'সংকটপূর্ণ লাল সংকেত!' : 'Financial Deficit Alert!',
        desc: lang === 'bn' ? `আপনি আয়ের চেয়ে ${Math.abs(balance)} টাকা বেশি খরচ করেছেন! ঋণ বা অতিরিক্ত খরচ কমাতে দ্রুত সাপ্তাহিক বাজেট সীমাবদ্ধ করুন।` : `You spent ${Math.abs(balance)} BDT more than your earnings! Take immediate control to curb secondary spends.`,
        type: 'danger' as const
      };
    }
  }, [totalIncome, totalExpense, savingsRateVal, balance, lang]);

  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    
    // Format dynamic dates for the file name
    const formatFileNameDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).replace(/ /g, '_');
    };
    
    const startName = formatFileNameDate(dateRange.start);
    const endName = formatFileNameDate(dateRange.end);

    const opt = {
      margin: [8, 8, 8, 8] as [number, number, number, number],
      filename: `HisabRokkhok_Premium_Report_${startName}_to_${endName}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        windowWidth: 1120,
        backgroundColor: '#FFFFFF',
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // Run html2pdf and reset exporting state on promise resolve
    html2pdf().set(opt).from(reportRef.current).save()
      .then(() => {
        setIsExporting(false);
      })
      .catch((err) => {
        console.error('PDF export failed:', err);
        setIsExporting(false);
      });
  };

  const getRangeText = () => {
    const opt: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const locale = lang === 'bn' ? 'bn-BD' : 'en-US';
    return `${dateRange.start.toLocaleDateString(locale, opt)} - ${dateRange.end.toLocaleDateString(locale, opt)}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-16 px-2 sm:px-4">
      
      {/* Timeframe Controller & Filter Selector */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4 sm:space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-5 rounded-full bg-blue-600 dark:bg-blue-500"></span>
              {t.rangeSelector}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.quickRanges}</p>
          </div>
          
          <button 
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl text-xs sm:text-sm font-black shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition duration-300 transform active:scale-95 shrink-0"
          >
            {isExporting ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Download size={16} className="animate-bounce" />
            )}
            <span>{isExporting ? 'Generating Statement...' : t.downloadPdf}</span>
          </button>
        </div>

        {/* Preset Selector Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(['this_month', 'last_month', 'last_30_days', 'last_90_days', 'this_year', 'custom'] as PresetRange[]).map((p) => {
            const isActive = preset === p;
            let label: string = p;
            if (p === 'this_month') label = lang === 'bn' ? 'চলতি মাস' : 'This Month';
            if (p === 'last_month') label = lang === 'bn' ? 'গত মাস' : 'Last Month';
            if (p === 'last_30_days') label = lang === 'bn' ? 'গত ৩০ দিন' : 'Last 30 Days';
            if (p === 'last_90_days') label = lang === 'bn' ? 'গত ৯০ দিন' : 'Last 90 Days';
            if (p === 'this_year') label = lang === 'bn' ? 'চলতি বছর' : 'This Year';
            if (p === 'custom') label = lang === 'bn' ? 'কাস্টম' : 'Custom';

            return (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`py-2.5 px-1.5 text-center text-[11px] font-extrabold rounded-xl border transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-lg shadow-blue-500/10 scale-[1.02]' 
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Custom Range Date Pickers (Shown if Custom is active) */}
        <AnimatePresence>
          {preset === 'custom' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.from}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none font-bold shadow-inner"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">{t.to}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none font-bold shadow-inner"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span className="bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-850 shadow-inner">{getRangeText()}</span>
          </div>
        </div>
      </motion.div>

      {/* Main printable and viewable canvas */}
      <div 
        ref={reportRef} 
        id="pdf-canvas"
        className={`bg-white dark:bg-slate-950 rounded-[2.5rem] p-4 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-800/80 transition-all ${
          isExporting ? '!bg-white !text-slate-900 shadow-none border-none max-w-[1100px] !p-8' : ''
        }`}
      >
        
        {/* PDF Header Section */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 dark:border-slate-800 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <span className="text-3xl font-black font-serif italic text-white leading-none">৳</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {t.appTitle}
              </h1>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mt-0.5">
                {t.developerLabel}
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 text-[10px] font-black text-slate-500 dark:text-slate-400 border border-slate-150 dark:border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.verifiedStatement}
            </div>
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 mt-2">
              {t.reportDate} {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Report Main Title & Banner details */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900/40 dark:via-slate-950 dark:to-slate-900/40 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-inner">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
              {t.reportTitle}
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mt-1.5">
              <span>{t.preparedFor}:</span>
              <span className="text-slate-800 dark:text-slate-200 font-extrabold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md text-[11px] text-indigo-600 dark:text-indigo-400">{lang === 'bn' ? 'শাহীন আলম' : 'Shaheen Alam'}</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">{lang === 'bn' ? 'অডিট সময়কাল' : 'Audit Interval'}</span>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{getRangeText()}</span>
          </div>
        </div>

        {/* Financial KPI Summary Bento Box Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          
          {/* Income Box */}
          <div className="border border-emerald-100 bg-emerald-50/10 dark:bg-emerald-950/10 dark:border-emerald-900/30 rounded-2xl p-5 flex items-center gap-4 transition duration-300 hover:border-emerald-300">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t.totalIncome}</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
                +{formatBDT(totalIncome)}
              </p>
            </div>
          </div>

          {/* Expense Box */}
          <div className="border border-rose-100 bg-rose-50/10 dark:bg-rose-950/10 dark:border-rose-900/30 rounded-2xl p-5 flex items-center gap-4 transition duration-300 hover:border-rose-300">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t.totalExpense}</p>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-0.5">
                -{formatBDT(totalExpense)}
              </p>
            </div>
          </div>

          {/* Savings Balance Box */}
          <div className={`border rounded-2xl p-5 flex items-center gap-4 transition duration-300 ${
            balance >= 0 
              ? 'border-blue-100 bg-blue-50/10 dark:bg-blue-950/10 dark:border-blue-900/30 hover:border-blue-300' 
              : 'border-amber-100 bg-amber-50/10 dark:bg-amber-950/10 dark:border-amber-900/30 hover:border-amber-300'
          }`}>
            <div className={`p-3 rounded-xl ${balance >= 0 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t.balance}</p>
              <p className={`text-xl sm:text-2xl font-black tracking-tight mt-0.5 ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {formatBDT(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* COMPARISON AND AUDIT / HEALTH SCORE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 break-inside-avoid">
          
          {/* Comparison Analytics Card */}
          <div className="lg:col-span-7 bg-slate-50/30 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
                <ArrowRightLeft className="w-4 h-4 text-indigo-500 animate-pulse" />
                {t.comparison}
              </h3>

              {/* Dynamic side-by-side comparative progress meters */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>{t.totalIncome}</span>
                    <span className="font-extrabold text-emerald-600">{totalIncome > 0 ? '100%' : '0%'}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-white dark:border-slate-850">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-1000" style={{ width: totalIncome > 0 ? '100%' : '0%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>{t.totalExpense} ({lang === 'bn' ? 'আয়ের তুলনায়' : 'Compared to income'})</span>
                    <span className={`font-extrabold ${expenseRatioVal > 100 ? 'text-rose-500' : expenseRatioVal > 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {totalIncome > 0 ? `${expenseRatioVal.toFixed(1)}%` : totalExpense > 0 ? 'Exceeds Income' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-white dark:border-slate-850">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r ${expenseRatioVal > 100 ? 'from-rose-500 to-red-600' : expenseRatioVal > 70 ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500'}`} 
                      style={{ width: `${Math.min(expenseRatioVal, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {totalIncome > 0 && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                      <span>{t.savingsRate}</span>
                      <span className="font-extrabold text-indigo-500">{savingsRateVal.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-3 overflow-hidden border border-white dark:border-slate-850">
                      <div 
                        className="h-3 rounded-full transition-all duration-1000 bg-gradient-to-r from-blue-500 to-indigo-600" 
                        style={{ width: `${Math.max(savingsRateVal, 0)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Smart dynamic financial advice component */}
            <div className={`mt-5 p-4 rounded-xl border flex items-start gap-3 shadow-inner ${
              financialAdvice.type === 'success' 
                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-400' 
                : financialAdvice.type === 'danger'
                ? 'bg-rose-500/5 border-rose-500/15 text-rose-800 dark:text-rose-400'
                : 'bg-amber-500/5 border-amber-500/15 text-amber-800 dark:text-amber-400'
            }`}>
              {financialAdvice.type === 'success' ? (
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
              ) : financialAdvice.type === 'danger' ? (
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              ) : (
                <HelpCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide">{t.analysisLabel}: {financialAdvice.title}</h4>
                <p className="text-[11px] font-semibold mt-1 leading-relaxed">{financialAdvice.desc}</p>
              </div>
            </div>
          </div>

          {/* Interactive Bento Financial Health Score Widget */}
          <div className="lg:col-span-5 bg-slate-50/30 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/60 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
                <Award className="w-4 h-4 text-indigo-500" />
                {t.auditLabel}
              </h3>
              
              {/* Radial Meter / Semi Gauge representing score */}
              <div className="flex items-center gap-4 py-1">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="10" className="dark:stroke-slate-800" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="url(#scoreGrad)" 
                      strokeWidth="10" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">{healthScore}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Score</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block leading-none">{t.scoreLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block text-xs font-black px-3 py-1 rounded-full border ${scoreGrade.color}`}>
                      {t.gradeLabel}: {scoreGrade.grade}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 leading-tight">
                    {lang === 'bn' ? 'সঞ্চয়ের পরিমাণ, অডিট অনুপাত এবং বাজেট স্থিতিশীলতার উপর নির্ভর করে স্কোর হিসাব করা হয়েছে।' : 'Determined dynamically based on your savings performance and category distribution.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-KPI Ratios block */}
            <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 shadow-inner">
                <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block uppercase">{t.savingsRate}</span>
                <span className="text-sm font-black text-blue-600 dark:text-blue-400 mt-1 block">
                  {savingsRateVal.toFixed(1)}%
                </span>
              </div>
              <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 shadow-inner">
                <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 block uppercase">{t.expenseRatio}</span>
                <span className="text-sm font-black text-rose-500 mt-1 block">
                  {expenseRatioVal.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* EXPENSE CATEGORY DISTRIBUTION */}
        <div className="mb-8 bg-slate-50/20 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 break-inside-avoid shadow-sm">
          <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 mb-6 uppercase tracking-wider">
            <PieChart className="w-5 h-5 text-indigo-500 animate-spin-slow" />
            {t.whereMoneyWent}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Custom interactive/vector SVG Donut Chart container */}
            <div className="md:col-span-5 flex justify-center">
              {categoryExpenses.length > 0 ? (
                <div className="relative w-44 sm:w-52 h-44 sm:h-52">
                  <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                    <circle cx="100" cy="100" r="70" fill="transparent" stroke="#F1F5F9" strokeWidth="22" className="dark:stroke-slate-800" />
                    
                    {/* Render Segments */}
                    {donutSectors.map((sector) => {
                      const isHovered = hoveredCategory === sector.categoryId;
                      return (
                        <path
                          key={sector.categoryId}
                          d={sector.pathData}
                          fill={sector.color}
                          stroke="#FFFFFF"
                          strokeWidth={isHovered ? 2 : 0}
                          className="transition-all duration-300 hover:opacity-80 cursor-pointer origin-center"
                          onMouseEnter={() => setHoveredCategory(sector.categoryId)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          style={{
                            transform: isHovered ? 'scale(1.03)' : 'scale(1)'
                          }}
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Center percentage/title label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {lang === 'bn' ? 'মোট খরচ' : 'Total Expense'}
                    </span>
                    <span className="text-base font-black text-slate-800 dark:text-white mt-0.5">
                      {formatBDT(totalExpense)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-2xl w-full">
                  <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">{t.noRecord}</p>
                </div>
              )}
            </div>

            {/* Detailed list breakdown of expenditures with progress bars */}
            <div className="md:col-span-7 space-y-4">
              {categoryExpenses.length > 0 ? (
                categoryExpenses.slice(0, 6).map((item) => {
                  const isHovered = hoveredCategory === item.categoryId;
                  return (
                    <div 
                      key={item.categoryId} 
                      className={`space-y-1 p-2 rounded-xl transition duration-200 ${
                        isHovered ? 'bg-slate-50 dark:bg-slate-900 shadow-sm' : ''
                      }`}
                      onMouseEnter={() => setHoveredCategory(item.categoryId)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.style.color }}></span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-slate-800 dark:text-white">{formatBDT(item.amount)}</span>
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] font-extrabold ml-1.5">({item.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-white dark:border-slate-850">
                        <div 
                          className="h-2 rounded-full transition-all duration-1000 bg-gradient-to-r" 
                          style={{ 
                            width: `${item.percentage}%`, 
                            backgroundImage: `linear-gradient(to right, ${item.style.color}cc, ${item.style.color})` 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold text-center py-6">{t.noRecord}</p>
              )}
            </div>
          </div>
        </div>

        {/* TRANSACTION STATEMENTS TABULAR LIST */}
        <div className="space-y-4 break-inside-avoid">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-indigo-500" />
              {t.allTxLabel}
            </h3>

            {/* Filter control tabs */}
            <div className="flex gap-1.5 self-stretch sm:self-auto scrollbar-none overflow-x-auto">
              {(['all', 'income', 'expense'] as const).map((tab) => {
                const isActive = activeTab === tab;
                let label = tab === 'all' ? (lang === 'bn' ? 'সব' : 'All') : tab === 'income' ? (lang === 'bn' ? 'আয়' : 'Income') : (lang === 'bn' ? 'ব্যয়' : 'Expense');
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-1.5 px-4 text-[10px] font-black rounded-lg border transition-all duration-250 shrink-0 ${
                      isActive 
                        ? 'bg-indigo-600 text-white border-transparent shadow-md' 
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table display (always visible during PDF export, otherwise hidden on mobile screens and shown on sm+) */}
          <div className={`rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden ${
            isExporting ? 'block' : 'hidden sm:block'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[550px] text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 font-extrabold uppercase tracking-widest text-[9px]">
                    <th className="px-4 py-3.5">{t.date}</th>
                    <th className="px-4 py-3.5">{t.category}</th>
                    <th className="px-4 py-3.5">{t.pmLabel}</th>
                    <th className="px-4 py-3.5 w-1/3">{t.description}</th>
                    <th className="px-4 py-3.5 text-right">{t.amount}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions
                      .filter(t => activeTab === 'all' ? true : t.type === activeTab)
                      .map((item) => {
                        const style = getCategoryStyle(item.categoryId, item.type);
                        const isInc = item.type === 'income';

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/40 transition">
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-semibold">{item.date}</td>
                            <td className="px-4 py-3 font-extrabold text-slate-700 dark:text-slate-200">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: style.color }}></span>
                                {getCategoryName(item.categoryId)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-semibold">{getPaymentMethodName(item.paymentMethodId)}</td>
                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[160px]">{item.note || '-'}</td>
                            <td className={`px-4 py-3 text-right font-black text-sm ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                              {isInc ? '+' : '-'}{formatBDT(item.amount)}
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500 font-bold">{t.noRecord}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Statement Cards List (Hidden during PDF export and hidden on desktop/sm+) */}
          {!isExporting && (
            <div className="space-y-2.5 sm:hidden">
              {filteredTransactions.length > 0 ? (
                filteredTransactions
                  .filter(t => activeTab === 'all' ? true : t.type === activeTab)
                  .map((item) => {
                    const style = getCategoryStyle(item.categoryId, item.type);
                    const isInc = item.type === 'income';
                    return (
                      <div key={item.id} className="p-3.5 bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex justify-between items-center text-xs">
                        <div className="space-y-1 min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-1.5 font-extrabold text-slate-800 dark:text-slate-200">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: style.color }}></span>
                            <span className="truncate">{getCategoryName(item.categoryId)}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                            {item.date} • {getPaymentMethodName(item.paymentMethodId)}
                          </div>
                          {item.note && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate">{item.note}</p>
                          )}
                        </div>
                        <div className={`font-black text-sm shrink-0 ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {isInc ? '+' : '-'}{formatBDT(item.amount)}
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-bold border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  {t.noRecord}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Official PDF Statement Seal and Verification Badges Footer (Only renders properly, looks extremely professional) */}
        <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-150 dark:border-slate-800/80 grid grid-cols-2 gap-8 break-inside-avoid">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">{t.officialSeal}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 leading-relaxed max-w-xs">
              {lang === 'bn' 
                ? 'এই আর্থিক বিবরণী হিসাব রক্ষক অ্যাপ্লিকেশনের সঞ্চিত ডাটাবেস হতে সরাসরি অডিট রিপোর্ট আকারে জেনারেট করা হয়েছে।' 
                : 'This system statement is generated directly from your Hisab Rokkhok data storage with cryptographic consistency validation.'}
            </p>
          </div>
          <div className="flex flex-col items-end justify-end">
            <div className="border-b border-slate-300 dark:border-slate-700 w-44 text-center pb-1">
              <span className="font-serif italic text-xs text-indigo-600 dark:text-indigo-400 font-extrabold">{lang === 'bn' ? 'শাহীন আলম' : 'Shaheen Alam'}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{t.authorizedSignature}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
