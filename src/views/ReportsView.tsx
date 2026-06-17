import React, { useRef } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Download, TrendingUp } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export function ReportsView() {
  const { transactions, categories, lang } = useAppStore();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const incomeTransactions = currentMonthTransactions.filter(t => t.type === 'income');
  const expenseTransactions = currentMonthTransactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesHi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

  const monthName = lang === 'hi' ? monthNamesHi[currentMonth] : lang === 'bn' ? monthNamesBn[currentMonth] : monthNamesEn[currentMonth];

  const t = {
    downloadPdf: lang === 'hi' ? 'पीडीएफ डाउनलोड करें' : lang === 'bn' ? 'পিডিএফ ডাউনলোড করুন' : 'Download PDF',
    appTitle: lang === 'hi' ? 'हिसाब रक्षक' : lang === 'bn' ? 'হিসাব রক্ষক' : 'Hisab Rokkhok',
    developerLabel: lang === 'hi' ? 'डेवलपर: शाहीन आलम' : lang === 'bn' ? 'ডেভেলপার : শাহীন আলম' : 'Developer: Shaheen Alam',
    monthlyReport: lang === 'hi' ? 'मासिक रिपोर्ट' : lang === 'bn' ? 'মাসিক রিপোর্ট' : 'Monthly Report',
    reportDate: lang === 'hi' ? 'रिपोर्ट निर्माण तिथि: ' : lang === 'bn' ? 'রিপোর্ট তৈরির তারিখ: ' : 'Report Date: ',
    totalIncome: lang === 'hi' ? 'कुल आय' : lang === 'bn' ? 'মোট আয়' : 'Total Income',
    totalExpense: lang === 'hi' ? 'कुल खर्च' : lang === 'bn' ? 'মোট খরচ' : 'Total Expenses',
    balance: lang === 'hi' ? 'शेष राशि' : lang === 'bn' ? 'বাকি টাকা' : 'Net Balance',
    incomeTab: lang === 'hi' ? 'आय विवरण' : lang === 'bn' ? 'আয় হিসাব' : 'Income Statement',
    date: lang === 'hi' ? 'तारीख' : lang === 'bn' ? 'তারিখ' : 'Date',
    description: lang === 'hi' ? 'विवरण' : lang === 'bn' ? 'বিবরণ' : 'Description',
    amount: lang === 'hi' ? 'राशि' : lang === 'bn' ? 'টাকার পরিমাণ' : 'Amount',
    noRecord: lang === 'hi' ? 'कोई रिकॉर्ड नहीं' : lang === 'bn' ? 'কোন রেকর্ড নেই' : 'No records found',
    expenseTab: lang === 'hi' ? 'व्यय विवरण' : lang === 'bn' ? 'ব্যয় হিসাব' : 'Expense Statement',
    category: lang === 'hi' ? 'श्रेणी' : lang === 'bn' ? 'ক্যাটাগরি' : 'Category',
    unknown: lang === 'hi' ? 'अज्ञात' : lang === 'bn' ? 'অজানা' : 'Unknown',
  };

  // Map category IDs to names
  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : t.unknown;
  };

  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    if (!reportRef.current) return;
    
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `monthly_report_${monthName}_${currentYear}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, windowWidth: 1024 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(reportRef.current).save();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex justify-end mb-4">
        <button 
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm transition"
        >
          <Download size={18} />
          <span>{t.downloadPdf}</span>
        </button>
      </div>

      <div ref={reportRef} className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 lg:p-10 shadow-sm border border-slate-100 dark:border-slate-800 break-inside-avoid">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white relative right-1 shadow-sm">
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold font-serif italic pr-2 text-white">৳</span>
                <TrendingUp className="w-5 h-5 absolute right-1 -top-1 opacity-90 text-white" />
             </div>
          </div>
          <div>
            <h1 className="text-[17px] font-extrabold text-[#311B5E] dark:text-indigo-300 leading-tight tracking-tight">{t.appTitle}</h1>
            <p className="text-[11px] text-slate-500 font-semibold tracking-wide mt-0.5">{t.developerLabel}</p>
          </div>
        </div>

        <div className="mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-6">
           <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
             {t.monthlyReport} - {monthName} {currentYear}
           </h2>
           <p className="text-xs text-slate-500">
             {t.reportDate} {lang === 'bn' ? `${monthName} ${currentDate.getDate()}ই, ${currentYear}` : `${monthName} ${currentDate.getDate()}, ${currentYear}`}
           </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-12">
          <div className="border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30 rounded-xl p-4 sm:p-5">
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">{t.totalIncome}</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{formatBDT(totalIncome).replace('৳', '৳ ')}</p>
          </div>
          <div className="border border-rose-100 bg-rose-50/50 dark:bg-rose-900/10 dark:border-rose-900/30 rounded-xl p-4 sm:p-5">
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-400 mb-1">{t.totalExpense}</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-500">{formatBDT(totalExpense).replace('৳', '৳ ')}</p>
          </div>
          <div className="border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30 rounded-xl p-4 sm:p-5">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-400 mb-1">{t.balance}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{formatBDT(balance).replace('৳', '৳ ')}</p>
          </div>
        </div>

        {/* Income Table */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-500 mb-3 ml-1">{t.incomeTab}</h3>
          <div className="overflow-x-auto rounded-lg border border-emerald-200 dark:border-emerald-900/50">
            <table className="w-full min-w-[500px] text-sm text-left border-collapse">
              <thead>
                <tr className="bg-emerald-500 text-white">
                  <th className="px-4 py-3 font-semibold border-r border-emerald-600 last:border-r-0 whitespace-nowrap">{t.date}</th>
                  <th className="px-4 py-3 font-semibold border-r border-emerald-600 last:border-r-0 w-1/2">{t.description}</th>
                  <th className="px-4 py-3 font-semibold border-r border-emerald-600 last:border-r-0 text-right whitespace-nowrap">{t.amount}</th>
                </tr>
              </thead>
              <tbody>
                {incomeTransactions.length > 0 ? (
                  incomeTransactions.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'bg-white dark:bg-slate-900'}>
                      <td className="px-4 py-3 border-b border-r border-emerald-100 dark:border-emerald-900/30 text-slate-700 dark:text-slate-300">{item.date}</td>
                      <td className="px-4 py-3 border-b border-r border-emerald-100 dark:border-emerald-900/30 text-slate-700 dark:text-slate-300">{item.note || '-'}</td>
                      <td className="px-4 py-3 border-b border-r border-emerald-100 dark:border-emerald-900/30 text-right font-medium text-emerald-600 dark:text-emerald-500">+{formatBDT(item.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center border-b border-emerald-100 dark:border-emerald-900/30 text-slate-500">{t.noRecord}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Table */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-rose-600 dark:text-rose-500 mb-3 ml-1">{t.expenseTab}</h3>
          <div className="overflow-x-auto rounded-lg border border-rose-200 dark:border-rose-900/50">
            <table className="w-full min-w-[500px] text-sm text-left border-collapse">
              <thead>
                <tr className="bg-[#e74c3c] text-white">
                  <th className="px-4 py-3 font-semibold border-r border-[#c0392b] last:border-r-0 whitespace-nowrap">{t.date}</th>
                  <th className="px-4 py-3 font-semibold border-r border-[#c0392b] last:border-r-0 whitespace-nowrap">{t.category}</th>
                  <th className="px-4 py-3 font-semibold border-r border-[#c0392b] last:border-r-0 w-1/2">{t.description}</th>
                  <th className="px-4 py-3 font-semibold border-r border-[#c0392b] last:border-r-0 text-right whitespace-nowrap">{t.amount}</th>
                </tr>
              </thead>
              <tbody>
                {expenseTransactions.length > 0 ? (
                  expenseTransactions.map((item, idx) => (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-rose-50/30 dark:bg-rose-900/10' : 'bg-white dark:bg-slate-900'}>
                      <td className="px-4 py-3 border-b border-r border-rose-100 dark:border-rose-900/30 text-slate-700 dark:text-slate-300">{item.date}</td>
                      <td className="px-4 py-3 border-b border-r border-rose-100 dark:border-rose-900/30 text-slate-700 dark:text-slate-300">{getCategoryName(item.categoryId)}</td>
                      <td className="px-4 py-3 border-b border-r border-rose-100 dark:border-rose-900/30 text-slate-700 dark:text-slate-300">{item.note || '-'}</td>
                      <td className="px-4 py-3 border-b border-r border-rose-100 dark:border-rose-900/30 text-right font-medium text-rose-600 dark:text-rose-400">-{formatBDT(item.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center border-b border-rose-100 dark:border-rose-900/30 text-slate-500">{t.noRecord}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
