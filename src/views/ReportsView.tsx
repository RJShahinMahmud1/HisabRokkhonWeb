import React, { useState, useRef, useMemo } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { 
  Download, TrendingUp, TrendingDown, Calendar, PieChart, HelpCircle, 
  Coins, ShoppingBag, Utensils, Sparkles, Pill, Heart, GraduationCap, 
  Bus, Smartphone, Zap, Home, Gift, FileText, ArrowRightLeft, Percent, 
  AlertTriangle, ShieldCheck, Award, Activity, X, Info
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'motion/react';

type PresetRange = 'this_month' | 'last_month' | 'last_30_days' | 'last_90_days' | 'this_year' | 'custom';

export function ReportsView() {
  const { transactions, categories, paymentMethods, lang, isDark } = useAppStore();

  const [preset, setPreset] = useState<PresetRange>('this_month');
  
  // Custom date range states
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonthStr = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(firstDayOfMonthStr);
  const [endDate, setEndDate] = useState<string>(todayStr);

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');

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

    if (catId === 'c2' || lowerName.includes('grocery') || lowerName.includes('bazar') || lowerName.includes('বাজার')) {
      return {
        icon: <ShoppingBag className="w-4 h-4" />,
        color: '#22C55E', // green-500
        bgColor: 'bg-green-500/10 dark:bg-green-500/20',
        textColor: 'text-green-600 dark:text-green-400',
        borderColor: 'border-green-500/20 dark:border-green-500/30',
        gradient: 'from-green-400 to-emerald-500'
      };
    }

    if (catId === 'c3' || lowerName.includes('food') || lowerName.includes('খাবার') || lowerName.includes('restaurant')) {
      return {
        icon: <Utensils className="w-4 h-4" />,
        color: '#F59E0B', // amber-500
        bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
        textColor: 'text-amber-600 dark:text-amber-400',
        borderColor: 'border-amber-500/20 dark:border-amber-500/30',
        gradient: 'from-amber-400 to-orange-500'
      };
    }

    if (catId === 'c4' || lowerName.includes('shopping') || lowerName.includes('কেনাকাটা')) {
      return {
        icon: <ShoppingBag className="w-4 h-4" />,
        color: '#A855F7', // purple-500
        bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
        textColor: 'text-purple-600 dark:text-purple-400',
        borderColor: 'border-purple-500/20 dark:border-purple-500/30',
        gradient: 'from-purple-400 to-fuchsia-600'
      };
    }

    if (catId === 'c5' || lowerName.includes('cosmetic') || lowerName.includes('কসমেটিক্স')) {
      return {
        icon: <Sparkles className="w-4 h-4" />,
        color: '#EC4899', // pink-500
        bgColor: 'bg-pink-500/10 dark:bg-pink-500/20',
        textColor: 'text-pink-600 dark:text-pink-400',
        borderColor: 'border-pink-500/20 dark:border-pink-500/30',
        gradient: 'from-pink-400 to-rose-500'
      };
    }

    if (catId === 'c6' || lowerName.includes('medicine') || lowerName.includes('ওষুধ') || lowerName.includes('ঔষধ')) {
      return {
        icon: <Pill className="w-4 h-4" />,
        color: '#EF4444', // red-500
        bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
        textColor: 'text-rose-600 dark:text-rose-400',
        borderColor: 'border-rose-500/20 dark:border-rose-500/30',
        gradient: 'from-red-400 to-rose-600'
      };
    }

    if (catId === 'c7' || lowerName.includes('health') || lowerName.includes('ডাক্তার') || lowerName.includes('স্বাস্থ্য')) {
      return {
        icon: <Heart className="w-4 h-4" />,
        color: '#06B6D4', // cyan-500
        bgColor: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        textColor: 'text-cyan-600 dark:text-cyan-400',
        borderColor: 'border-cyan-500/20 dark:border-cyan-500/30',
        gradient: 'from-cyan-400 to-teal-500'
      };
    }

    if (catId === 'c8' || lowerName.includes('education') || lowerName.includes('শিক্ষা') || lowerName.includes('বই')) {
      return {
        icon: <GraduationCap className="w-4 h-4" />,
        color: '#3B82F6', // blue-500
        bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
        textColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-500/20 dark:border-blue-500/30',
        gradient: 'from-blue-400 to-indigo-600'
      };
    }

    if (catId === 'c9' || lowerName.includes('travel') || lowerName.includes('যাতায়াত') || lowerName.includes('ভাড়া')) {
      return {
        icon: <Bus className="w-4 h-4" />,
        color: '#6366F1', // indigo-500
        bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        textColor: 'text-indigo-600 dark:text-indigo-400',
        borderColor: 'border-indigo-500/20 dark:border-indigo-500/30',
        gradient: 'from-indigo-400 to-violet-600'
      };
    }

    if (catId === 'c10' || lowerName.includes('mobile') || lowerName.includes('রিচার্জ') || lowerName.includes('phone')) {
      return {
        icon: <Smartphone className="w-4 h-4" />,
        color: '#14B8A6', // teal-500
        bgColor: 'bg-teal-500/10 dark:bg-teal-500/20',
        textColor: 'text-teal-600 dark:text-teal-400',
        borderColor: 'border-teal-500/20 dark:border-teal-500/30',
        gradient: 'from-teal-400 to-cyan-600'
      };
    }

    if (catId === 'c11' || lowerName.includes('utility') || lowerName.includes('বিল') || lowerName.includes('electricity')) {
      return {
        icon: <Zap className="w-4 h-4" />,
        color: '#F97316', // orange-500
        bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
        textColor: 'text-orange-600 dark:text-orange-400',
        borderColor: 'border-orange-500/20 dark:border-orange-500/30',
        gradient: 'from-orange-400 to-red-500'
      };
    }

    if (catId === 'c12' || lowerName.includes('rent') || lowerName.includes('বাসা ভাড়া')) {
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

    return Object.entries(map).map(([catId, amount]) => {
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        categoryId: catId,
        name: getCategoryName(catId),
        amount,
        percentage,
        style: getCategoryStyle(catId, 'expense')
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [expenseTransactions, totalExpense, categories]);

  // SVG Donut Sectors Calculation
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
    
    let savingsPoints = 0;
    if (savingsRateVal >= 30) {
      savingsPoints = 50;
    } else if (savingsRateVal > 0) {
      savingsPoints = 15 + (savingsRateVal / 30) * 35;
    } else {
      savingsPoints = Math.max(0, 15 + (savingsRateVal / 100) * 15);
    }

    let diversificationPoints = 30;
    if (categoryExpenses.length > 0) {
      const topCatRatio = categoryExpenses[0].percentage;
      if (topCatRatio > 70) diversificationPoints = 10;
      else if (topCatRatio > 50) diversificationPoints = 20;
    }

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
    
    const formatFileNameDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).replace(/ /g, '_');
    };
    
    const startName = formatFileNameDate(dateRange.start);
    const endName = formatFileNameDate(dateRange.end);

    // Precise OKLCH to RGB conversion algorithm (CSS Color Module Level 4)
    const oklchToRgb = (l: number, c: number, h: number, a: number = 1): string => {
      const hRad = (h * Math.PI) / 180;
      const a_val = c * Math.cos(hRad);
      const b_val = c * Math.sin(hRad);

      const l_ = l + 0.3963377774 * a_val + 0.2158037573 * b_val;
      const m_ = l - 0.1055613458 * a_val - 0.0638541728 * b_val;
      const s_ = l - 0.0894841775 * a_val - 1.2914855480 * b_val;

      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;

      const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const b_channel = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

      const convertChannel = (val: number): number => {
        if (val <= 0.0031308) {
          return Math.max(0, Math.min(255, Math.round(12.92 * val * 255)));
        } else {
          return Math.max(0, Math.min(255, Math.round((1.055 * Math.pow(val, 1 / 2.4) - 0.055) * 255)));
        }
      };

      const r255 = convertChannel(r);
      const g255 = convertChannel(g);
      const b255 = convertChannel(b_channel);

      if (a === 1) {
        return `rgb(${r255}, ${g255}, ${b255})`;
      } else {
        return `rgba(${r255}, ${g255}, ${b255}, ${a})`;
      }
    };

    // Precise OKLab to RGB conversion algorithm (CSS Color Module Level 4)
    const oklabToRgb = (l: number, a_val: number, b_val: number, alpha: number = 1): string => {
      const l_ = l + 0.3963377774 * a_val + 0.2158037573 * b_val;
      const m_ = l - 0.1055613458 * a_val - 0.0638541728 * b_val;
      const s_ = l - 0.0894841775 * a_val - 1.2914855480 * b_val;

      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;

      const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const b_channel = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

      const convertChannel = (val: number): number => {
        if (val <= 0.0031308) {
          return Math.max(0, Math.min(255, Math.round(12.92 * val * 255)));
        } else {
          return Math.max(0, Math.min(255, Math.round((1.055 * Math.pow(val, 1 / 2.4) - 0.055) * 255)));
        }
      };

      const r255 = convertChannel(r);
      const g255 = convertChannel(g);
      const b255 = convertChannel(b_channel);

      if (alpha === 1) {
        return `rgb(${r255}, ${g255}, ${b255})`;
      } else {
        return `rgba(${r255}, ${g255}, ${b255}, ${alpha})`;
      }
    };

    const replaceColorsInString = (cssText: string): string => {
      let result = '';
      let i = 0;
      const len = cssText.length;
      
      while (i < len) {
        if (
          cssText.startsWith('oklch(', i) || 
          cssText.startsWith('oklab(', i) || 
          cssText.startsWith('color-mix(', i)
        ) {
          const isColorMix = cssText.startsWith('color-mix(', i);
          const isOklch = cssText.startsWith('oklch(', i);
          const isOklab = cssText.startsWith('oklab(', i);
          
          if (isColorMix) i += 10;
          else if (isOklch) i += 6;
          else if (isOklab) i += 6;
          
          let braceCount = 1;
          let content = '';
          while (i < len && braceCount > 0) {
            const char = cssText[i];
            if (char === '(') braceCount++;
            else if (char === ')') braceCount--;
            
            if (braceCount > 0) {
              content += char;
            }
            i++;
          }
          
          let parsed = '';
          if (isOklch) {
            const parts = content.trim().split(/[\s\/,]+/);
            if (parts.length >= 3) {
              const l = parts[0].endsWith('%') ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
              const c = parts[1].endsWith('%') ? (parseFloat(parts[1]) / 100) * 0.4 : parseFloat(parts[1]);
              let h = parseFloat(parts[2]);
              let a = parts[3] ? (parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])) : 1;
              if (!isNaN(l) && !isNaN(c) && !isNaN(h) && !isNaN(a)) {
                parsed = oklchToRgb(l, c, h, a);
              }
            }
          } else if (isOklab) {
            const parts = content.trim().split(/[\s\/,]+/);
            if (parts.length >= 3) {
              const l = parts[0].endsWith('%') ? parseFloat(parts[0]) / 100 : parseFloat(parts[0]);
              const a_val = parts[1].endsWith('%') ? (parseFloat(parts[1]) / 100) * 0.4 : parseFloat(parts[1]);
              const b_val = parts[2].endsWith('%') ? (parseFloat(parts[2]) / 100) * 0.4 : parseFloat(parts[2]);
              let alpha = parts[3] ? (parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3])) : 1;
              if (!isNaN(l) && !isNaN(a_val) && !isNaN(b_val) && !isNaN(alpha)) {
                parsed = oklabToRgb(l, a_val, b_val, alpha);
              }
            }
          }
          
          if (!parsed) {
            parsed = '#71717a';
          }
          result += parsed;
        } else {
          result += cssText[i];
          i++;
        }
      }
      return result;
    };

    const opt = {
      margin: [8, 8, 8, 8] as [number, number, number, number],
      filename: `HisabRokkhok_Premium_Report_${startName}_to_${endName}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
         scale: 2, 
         useCORS: true, 
         windowWidth: 1120,
         backgroundColor: '#FFFFFF',
         logging: false,
         onclone: (clonedDoc: Document) => {
           // 1. Gather all CSS rules from clonedDoc's styleSheets and document's styleSheets
           const cssBlocks: string[] = [];
           
           try {
             const sheets = Array.from(clonedDoc.styleSheets);
             sheets.forEach(sheet => {
               try {
                 const rules = Array.from(sheet.cssRules || sheet.rules || []);
                 const sheetCss = rules.map(rule => rule.cssText).join('\n');
                 if (sheetCss) {
                   cssBlocks.push(sheetCss);
                 }
               } catch (e) {
                 const ownerNode = sheet.ownerNode as HTMLElement;
                 if (ownerNode && ownerNode.textContent) {
                   cssBlocks.push(ownerNode.textContent);
                 }
               }
             });
           } catch (e) {
             console.error('Error reading styleSheets in clone:', e);
           }

           if (cssBlocks.length === 0) {
             try {
               const originalSheets = Array.from(document.styleSheets);
               originalSheets.forEach(sheet => {
                 try {
                   const rules = Array.from(sheet.cssRules || sheet.rules || []);
                   const sheetCss = rules.map(rule => rule.cssText).join('\n');
                   if (sheetCss) {
                     cssBlocks.push(sheetCss);
                   }
                 } catch (e) {
                   const ownerNode = sheet.ownerNode as HTMLElement;
                   if (ownerNode && ownerNode.textContent) {
                     cssBlocks.push(ownerNode.textContent);
                   }
                 }
               });
             } catch (e) {
               console.error('Error reading original styleSheets:', e);
             }
           }

           // 2. Sanitize and replace all oklch, oklab, and color-mix functions in compiled CSS
           const combinedCss = cssBlocks.join('\n');
           const sanitizedCss = replaceColorsInString(combinedCss);

           // 3. Remove all original <style> and <link rel="stylesheet"> elements from the cloned document
           const origStyles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
           origStyles.forEach(node => node.parentNode?.removeChild(node));

           // 4. Create a brand new single <style> element with the sanitized CSS
           const newStyle = clonedDoc.createElement('style');
           newStyle.textContent = sanitizedCss;
           clonedDoc.head.appendChild(newStyle);

           // 5. Also replace inline styles on all elements
           const allElements = clonedDoc.querySelectorAll('*');
           allElements.forEach(el => {
             const htmlEl = el as HTMLElement;
             if (htmlEl && htmlEl.style) {
               const cssText = htmlEl.style.cssText;
               if (cssText && (cssText.includes('oklch') || cssText.includes('oklab') || cssText.includes('color-mix'))) {
                 htmlEl.style.cssText = replaceColorsInString(cssText);
               }
             }
           });
         }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
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
        className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-5 rounded-full bg-blue-600 dark:bg-blue-500"></span>
              {t.rangeSelector}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t.quickRanges}</p>
          </div>
          
          <button 
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl text-xs sm:text-sm font-black shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition duration-300 transform active:scale-95 shrink-0"
          >
            {isExporting ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Download size={16} className="animate-pulse" />
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

        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">{getRangeText()}</span>
          </div>
        </div>
      </motion.div>

      {/* Main printable and viewable canvas */}
      <div 
        ref={reportRef} 
        id="pdf-canvas"
        className={`bg-white dark:bg-slate-950 rounded-[2rem] p-4 sm:p-8 shadow-md border border-slate-150 dark:border-slate-800/80 transition-all ${
          isExporting ? '!bg-white !text-slate-900 shadow-none border-none max-w-[1100px] !p-8' : ''
        }`}
      >
        
        {/* PDF Header Section */}
        <div className="flex justify-between items-start border-b-2 border-slate-100 dark:border-slate-800 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <span className="text-2xl font-black font-serif italic text-white leading-none">৳</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {t.appTitle}
              </h1>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">
                {t.developerLabel}
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 text-[9px] font-bold text-slate-500 dark:text-slate-400 border border-slate-150 dark:border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {t.verifiedStatement}
            </div>
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1.5">
              {t.reportDate} {new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Report Main Title & Banner details */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
              {t.reportTitle}
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
              <span>{t.preparedFor}:</span>
              <span className="text-slate-800 dark:text-slate-200 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg text-[10px] text-emerald-600 dark:text-emerald-400">{lang === 'bn' ? 'শাহীন আলম' : 'Shaheen Alam'}</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">{lang === 'bn' ? 'অডিট সময়কাল' : 'Audit Interval'}</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{getRangeText()}</span>
          </div>
        </div>

        {/* Financial KPI Summary Bento Box Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Income Box */}
          <div className="border border-emerald-100 bg-emerald-50/10 dark:bg-emerald-950/10 dark:border-emerald-900/30 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t.totalIncome}</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
                +{formatBDT(totalIncome)}
              </p>
            </div>
          </div>

          {/* Expense Box */}
          <div className="border border-rose-100 bg-rose-50/10 dark:bg-rose-950/10 dark:border-rose-900/30 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t.totalExpense}</p>
              <p className="text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight mt-0.5">
                -{formatBDT(totalExpense)}
              </p>
            </div>
          </div>

          {/* Savings Balance Box */}
          <div className={`border rounded-2xl p-4 flex items-center gap-3.5 ${
            balance >= 0 
              ? 'border-blue-100 bg-blue-50/10 dark:bg-blue-950/10 dark:border-blue-900/30' 
              : 'border-amber-100 bg-amber-50/10 dark:bg-amber-950/10 dark:border-amber-900/30'
          }`}>
            <div className={`p-2.5 rounded-xl ${balance >= 0 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{t.balance}</p>
              <p className={`text-lg font-black tracking-tight mt-0.5 ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {formatBDT(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* COMPARISON AND AUDIT / HEALTH SCORE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
          {/* Comparison Analytics Card */}
          <div className="lg:col-span-7 bg-slate-50/30 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
                <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                {t.comparison}
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    <span>{t.totalIncome}</span>
                    <span className="font-bold text-emerald-600">{totalIncome > 0 ? '100%' : '0%'}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white dark:border-slate-800">
                    <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: totalIncome > 0 ? '100%' : '0%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                    <span>{t.totalExpense} ({lang === 'bn' ? 'আয়ের তুলনায়' : 'Compared to income'})</span>
                    <span className={`font-bold ${expenseRatioVal > 100 ? 'text-rose-500' : expenseRatioVal > 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {totalIncome > 0 ? `${expenseRatioVal.toFixed(1)}%` : totalExpense > 0 ? 'Exceeds Income' : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white dark:border-slate-800">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-500 ${expenseRatioVal > 100 ? 'bg-rose-500' : expenseRatioVal > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min(expenseRatioVal, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {totalIncome > 0 && (
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      <span>{t.savingsRate}</span>
                      <span className="font-bold text-blue-500">{savingsRateVal.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white dark:border-slate-800">
                      <div 
                        className="h-2.5 rounded-full transition-all duration-500 bg-blue-500" 
                        style={{ width: `${Math.max(savingsRateVal, 0)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Smart dynamic financial advice */}
            <div className={`mt-5 p-3 rounded-xl border flex items-start gap-2.5 ${
              financialAdvice.type === 'success' 
                ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-400' 
                : financialAdvice.type === 'danger'
                ? 'bg-rose-500/5 border-rose-500/15 text-rose-800 dark:text-rose-400'
                : 'bg-amber-500/5 border-amber-500/15 text-amber-800 dark:text-amber-400'
            }`}>
              {financialAdvice.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              ) : financialAdvice.type === 'danger' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              ) : (
                <HelpCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              )}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wide">{t.analysisLabel}: {financialAdvice.title}</h4>
                <p className="text-[10px] font-bold mt-0.5 leading-relaxed">{financialAdvice.desc}</p>
              </div>
            </div>
          </div>

          {/* Bento Financial Health Score Widget */}
          <div className="lg:col-span-5 bg-slate-50/30 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-2 mb-4 uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-500" />
                {t.auditLabel}
              </h3>
              
              <div className="flex items-center gap-3 py-1">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="10" className="dark:stroke-slate-800" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="transparent" 
                      stroke="#10B981" 
                      strokeWidth="10" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * healthScore) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-black text-slate-800 dark:text-white tracking-tighter">{healthScore}</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Score</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase block leading-none">{t.scoreLabel}</span>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full border ${scoreGrade.color}`}>
                      {t.gradeLabel}: {scoreGrade.grade}
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 leading-tight">
                    {lang === 'bn' ? 'সঞ্চয়, ক্যাটাগরি ডাইভার্সিফিকেশন এবং ট্রানজেকশন কন্সিস্টেন্সির ওপর ভিত্তি করে স্কোর।' : 'Calculated automatically based on your savings performance and category variance.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-KPI Ratios block */}
            <div className="mt-4 border-t border-slate-100 dark:border-slate-850 pt-4 grid grid-cols-2 gap-2.5">
              <div className="bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-850 shadow-inner">
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 block uppercase">{t.savingsRate}</span>
                <span className="text-xs font-black text-emerald-600 mt-0.5 block">
                  {savingsRateVal.toFixed(1)}%
                </span>
              </div>
              <div className="bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-850 shadow-inner">
                <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-500 block uppercase">{t.expenseRatio}</span>
                <span className={`text-xs font-black mt-0.5 block ${expenseRatioVal > 85 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {expenseRatioVal.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* WHERE THE MONEY WENT CHART - কোথায় কত টাকা খরচ হয়েছে সেই গ্রাফ চার্ট হিসেবে দেখাও */}
        <div className="bg-slate-50/30 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 mb-6">
          <h3 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-2 mb-5 uppercase tracking-wider">
            <PieChart className="w-4 h-4 text-emerald-500" />
            {t.whereMoneyWent}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Custom SVG Donut (Highly reliable for HTML-to-PDF export!) */}
            <div className="md:col-span-5 flex justify-center py-2 relative">
              {categoryExpenses.length === 0 ? (
                <div className="w-36 h-36 rounded-full border-4 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-center p-3">
                  <span className="text-[10px] font-bold text-slate-400">{t.noRecord}</span>
                </div>
              ) : (
                <div className="relative w-44 h-44">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {donutSectors.map((sector, i) => (
                      <path
                        key={sector.categoryId}
                        d={sector.pathData}
                        fill={sector.color}
                        className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                        stroke={isDark ? '#020617' : '#FFFFFF'}
                        strokeWidth="1.5"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-extrabold text-slate-400 uppercase leading-none">{lang === 'bn' ? 'মোট ব্যয়' : 'Expenses'}</span>
                    <span className="text-sm font-black text-rose-500 tracking-tight mt-1">{formatBDT(totalExpense)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Color Coded Bento List Items of category expenditures */}
            <div className="md:col-span-7 space-y-3.5">
              {categoryExpenses.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-bold text-xs">
                  {t.noRecord}
                </div>
              ) : (
                categoryExpenses.map((item) => (
                  <div key={item.categoryId} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${item.style.bgColor} ${item.style.textColor}`}>
                      {item.style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        <span className="truncate pr-2">{item.name}</span>
                        <span className="font-extrabold">{formatBDT(item.amount)} <span className="text-[10px] text-slate-400 font-bold">({item.percentage.toFixed(1)}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.style.color
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* TRANS-LIST STATEMENTS TABLE */}
        <div className="border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-slate-950">
          <div className="p-4 sm:p-5 border-b border-slate-150 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-emerald-500" />
              {t.allTxLabel}
            </h3>
            
            {/* Statement Filter Toggles */}
            <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto self-stretch sm:self-auto">
              {(['all', 'income', 'expense'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 sm:flex-initial px-3.5 py-1.5 text-center text-xs font-extrabold rounded-lg transition-all ${
                    activeTab === tab 
                      ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {tab === 'all' ? (lang === 'bn' ? 'সব' : 'All') : tab === 'income' ? (lang === 'bn' ? 'আয়' : 'Income') : (lang === 'bn' ? 'ব্যয়' : 'Expenses')}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-900/60 text-slate-450 dark:text-slate-500 font-bold border-b border-slate-150 dark:border-slate-800 uppercase tracking-widest">
                  <th className="py-3 px-4">{t.date}</th>
                  <th className="py-3 px-4">{t.category}</th>
                  <th className="py-3 px-4 hidden sm:table-cell">{t.description}</th>
                  <th className="py-3 px-4 hidden sm:table-cell">{t.pmLabel}</th>
                  <th className="py-3 px-4 text-right">{t.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-semibold text-slate-700 dark:text-slate-300">
                {filteredTransactions
                  .filter(t => activeTab === 'all' || t.type === activeTab)
                  .map((tx) => {
                    const isIncome = tx.type === 'income';
                    const catStyle = getCategoryStyle(tx.categoryId, tx.type);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition duration-150">
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {new Date(tx.date).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${catStyle.bgColor} ${catStyle.textColor}`}>
                              {catStyle.icon}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{getCategoryName(tx.categoryId)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 truncate max-w-[150px] hidden sm:table-cell">
                          {tx.description || <span className="opacity-30 italic">-</span>}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap hidden sm:table-cell text-slate-500 dark:text-slate-400">
                          {getPaymentMethodName(tx.paymentMethodId)}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-black whitespace-nowrap ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isIncome ? '+' : '-'}{formatBDT(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                {filteredTransactions.filter(t => activeTab === 'all' || t.type === activeTab).length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 px-4 text-center text-slate-400 font-extrabold italic">
                      {t.noRecord}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PRINT ONLY STAMP AND SEAL AT THE BOTTOM OF PDF STATEMENT */}
        <div className="hidden pdf-only mt-12 pt-6 border-t border-dashed border-slate-300 flex justify-between items-center px-4">
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-4 border-double border-emerald-600 flex items-center justify-center text-emerald-600 text-center text-[8px] font-black uppercase rotate-[-12deg] tracking-tight mb-2 p-1">
              <span>{t.officialSeal}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-500">{t.officialSeal}</p>
          </div>
          <div className="text-center w-40">
            <div className="h-10 border-b border-slate-300 flex items-end justify-center pb-1 text-slate-400 text-xs italic">
              Shahin Alom
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-2">{t.authorizedSignature}</p>
          </div>
        </div>

      </div>

      {/* Global CSS Inject to safely hide seal on screen but display inside generated PDFs and override oklch colors for html2canvas compatibility */}
      <style>{`
        .pdf-only { display: none !important; }
        @media print {
          .pdf-only { display: flex !important; }
        }
        #pdf-canvas .pdf-only {
          display: ${isExporting ? 'flex !important' : 'none !important'};
        }

        /* Override Tailwind CSS v4 oklch variables within the PDF container to avoid html2canvas crash */
        #pdf-canvas, #pdf-canvas * {
          --color-white: #ffffff !important;
          --color-black: #000000 !important;
          
          --color-slate-50: #f8fafc !important;
          --color-slate-100: #f1f5f9 !important;
          --color-slate-150: #eef2f6 !important;
          --color-slate-200: #e2e8f0 !important;
          --color-slate-300: #cbd5e1 !important;
          --color-slate-400: #94a3b8 !important;
          --color-slate-450: #7e8e9f !important;
          --color-slate-500: #64748b !important;
          --color-slate-600: #475569 !important;
          --color-slate-700: #334155 !important;
          --color-slate-800: #1e293b !important;
          --color-slate-900: #0f172a !important;
          --color-slate-950: #020817 !important;

          --color-gray-50: #f9fafb !important;
          --color-gray-100: #f3f4f6 !important;
          --color-gray-200: #e5e7eb !important;
          --color-gray-300: #d1d5db !important;
          --color-gray-400: #9ca3af !important;
          --color-gray-500: #6b7280 !important;
          --color-gray-600: #4b5563 !important;
          --color-gray-700: #374151 !important;
          --color-gray-800: #1f2937 !important;
          --color-gray-900: #111827 !important;
          --color-gray-950: #030712 !important;

          --color-zinc-50: #fafafa !important;
          --color-zinc-100: #f4f4f5 !important;
          --color-zinc-200: #e4e4e7 !important;
          --color-zinc-300: #d4d4d8 !important;
          --color-zinc-400: #a1a1aa !important;
          --color-zinc-500: #71717a !important;
          --color-zinc-600: #52525b !important;
          --color-zinc-700: #3f3f46 !important;
          --color-zinc-800: #27272a !important;
          --color-zinc-900: #18181b !important;
          --color-zinc-950: #09090b !important;

          --color-emerald-50: #ecfdf5 !important;
          --color-emerald-100: #d1fae5 !important;
          --color-emerald-200: #a7f3d0 !important;
          --color-emerald-300: #6ee7b7 !important;
          --color-emerald-400: #34d399 !important;
          --color-emerald-500: #10b981 !important;
          --color-emerald-600: #059669 !important;
          --color-emerald-700: #047857 !important;
          --color-emerald-800: #065f46 !important;
          --color-emerald-900: #064e3b !important;
          --color-emerald-950: #022c22 !important;

          --color-green-50: #f0fdf4 !important;
          --color-green-100: #dcfce7 !important;
          --color-green-200: #bbf7d0 !important;
          --color-green-300: #86efac !important;
          --color-green-400: #4ade80 !important;
          --color-green-500: #22c55e !important;
          --color-green-600: #16a34a !important;
          --color-green-700: #15803d !important;
          --color-green-800: #166534 !important;
          --color-green-900: #14532d !important;
          --color-green-950: #052e16 !important;

          --color-rose-50: #fff1f2 !important;
          --color-rose-100: #ffe4e6 !important;
          --color-rose-200: #fecdd3 !important;
          --color-rose-300: #fda4af !important;
          --color-rose-400: #fb7185 !important;
          --color-rose-500: #f43f5e !important;
          --color-rose-600: #e11d48 !important;
          --color-rose-700: #be123c !important;
          --color-rose-800: #9f1239 !important;
          --color-rose-900: #881337 !important;
          --color-rose-950: #4c0519 !important;

          --color-red-50: #fef2f2 !important;
          --color-red-100: #fee2e2 !important;
          --color-red-200: #fecaca !important;
          --color-red-300: #fca5a5 !important;
          --color-red-400: #f87171 !important;
          --color-red-500: #ef4444 !important;
          --color-red-600: #dc2626 !important;
          --color-red-700: #b91c1c !important;
          --color-red-800: #991b1b !important;
          --color-red-900: #7f1d1d !important;
          --color-red-950: #450a0a !important;

          --color-blue-50: #eff6ff !important;
          --color-blue-100: #dbeafe !important;
          --color-blue-200: #bfdbfe !important;
          --color-blue-300: #93c5fd !important;
          --color-blue-400: #60a5fa !important;
          --color-blue-500: #3b82f6 !important;
          --color-blue-600: #2563eb !important;
          --color-blue-700: #1d4ed8 !important;
          --color-blue-800: #1e40af !important;
          --color-blue-900: #1e3a8a !important;
          --color-blue-950: #172554 !important;

          --color-indigo-50: #e0e7ff !important;
          --color-indigo-100: #c7d2fe !important;
          --color-indigo-200: #a5b4fc !important;
          --color-indigo-300: #818cf8 !important;
          --color-indigo-400: #6366f1 !important;
          --color-indigo-500: #4f46e5 !important;
          --color-indigo-600: #4338ca !important;
          --color-indigo-700: #3730a3 !important;
          --color-indigo-800: #312e81 !important;
          --color-indigo-900: #1e1b4b !important;
          --color-indigo-950: #0f172a !important;

          --color-amber-50: #fffbeb !important;
          --color-amber-100: #fef3c7 !important;
          --color-amber-200: #fde68a !important;
          --color-amber-300: #fcd34d !important;
          --color-amber-400: #fbbf24 !important;
          --color-amber-500: #f59e0b !important;
          --color-amber-600: #d97706 !important;
          --color-amber-700: #b45309 !important;
          --color-amber-800: #92400e !important;
          --color-amber-900: #78350f !important;
          --color-amber-950: #451a03 !important;

          --color-orange-50: #fff7ed !important;
          --color-orange-100: #ffedd5 !important;
          --color-orange-200: #fed7aa !important;
          --color-orange-300: #fdba74 !important;
          --color-orange-400: #fb923c !important;
          --color-orange-500: #f97316 !important;
          --color-orange-600: #ea580c !important;
          --color-orange-700: #c2410c !important;
          --color-orange-800: #9a3412 !important;
          --color-orange-900: #7c2d12 !important;
          --color-orange-950: #431407 !important;

          --color-teal-50: #f0fdfa !important;
          --color-teal-100: #ccfbf1 !important;
          --color-teal-200: #99f6e4 !important;
          --color-teal-300: #5eead4 !important;
          --color-teal-400: #2dd4bf !important;
          --color-teal-500: #14b8a6 !important;
          --color-teal-600: #0d9488 !important;
          --color-teal-700: #0f766e !important;
          --color-teal-800: #115e59 !important;
          --color-teal-900: #134e4a !important;
          --color-teal-950: #042f2e !important;

          --color-cyan-50: #ecfeff !important;
          --color-cyan-100: #cffafe !important;
          --color-cyan-200: #a5f3fc !important;
          --color-cyan-300: #67e8f9 !important;
          --color-cyan-400: #22d3ee !important;
          --color-cyan-500: #06b6d4 !important;
          --color-cyan-600: #0891b2 !important;
          --color-cyan-700: #0e7490 !important;
          --color-cyan-800: #155e75 !important;
          --color-cyan-900: #164e63 !important;
          --color-cyan-950: #083344 !important;

          --color-purple-50: #faf5ff !important;
          --color-purple-100: #f3e8ff !important;
          --color-purple-200: #e9d5ff !important;
          --color-purple-300: #d8b4fe !important;
          --color-purple-400: #c084fc !important;
          --color-purple-500: #a855f7 !important;
          --color-purple-600: #9333ea !important;
          --color-purple-700: #7e22ce !important;
          --color-purple-800: #6b21a8 !important;
          --color-purple-900: #581c87 !important;
          --color-purple-950: #3b0764 !important;

          --color-pink-50: #fdf2f8 !important;
          --color-pink-100: #fce7f3 !important;
          --color-pink-200: #fbcfe8 !important;
          --color-pink-300: #f9a8d4 !important;
          --color-pink-400: #f472b6 !important;
          --color-pink-500: #ec4899 !important;
          --color-pink-600: #db2777 !important;
          --color-pink-700: #be185d !important;
          --color-pink-800: #9d174d !important;
          --color-pink-900: #831843 !important;
          --color-pink-950: #500724 !important;

          --color-violet-50: #f5f3ff !important;
          --color-violet-100: #ede9fe !important;
          --color-violet-200: #ddd6fe !important;
          --color-violet-300: #c4b5fd !important;
          --color-violet-400: #a78bfa !important;
          --color-violet-500: #8b5cf6 !important;
          --color-violet-600: #7c3aed !important;
          --color-violet-700: #6d28d9 !important;
          --color-violet-800: #5b21b6 !important;
          --color-violet-900: #4c1d95 !important;
          --color-violet-950: #2e1065 !important;

          --color-fuchsia-50: #fdf4ff !important;
          --color-fuchsia-100: #fae8ff !important;
          --color-fuchsia-200: #f5d0fe !important;
          --color-fuchsia-300: #f0abfc !important;
          --color-fuchsia-400: #e879f9 !important;
          --color-fuchsia-500: #d946ef !important;
          --color-fuchsia-600: #c026d3 !important;
          --color-fuchsia-700: #a21caf !important;
          --color-fuchsia-800: #86198f !important;
          --color-fuchsia-900: #701a75 !important;
          --color-fuchsia-950: #4a044e !important;
        }
      `}</style>

    </div>
  );
}
