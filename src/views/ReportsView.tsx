import React from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Receipt } from 'lucide-react';

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

  const monthName = lang === 'bn' ? monthNamesBn[currentMonth] : monthNamesEn[currentMonth];

  // Map category IDs to names
  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Unknown';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold overflow-hidden">
             <div className="text-xl">৳</div>
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-slate-900 dark:text-white leading-tight">আমার হিসাব অ্যাপ</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">ডেভেলপার : মাহির আহমেদ</p>
          </div>
        </div>

        <div className="mb-8 border-b-2 border-slate-100 dark:border-slate-800 pb-6">
           <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
             মাসিক রিপোর্ট - {monthName} {currentYear}
           </h2>
           <p className="text-xs text-slate-500">
             রিপোর্ট তৈরির তারিখ: {lang === 'bn' ? `${monthName} ${currentDate.getDate()}ই, ${currentYear}` : `${monthName} ${currentDate.getDate()}, ${currentYear}`}
           </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-12">
          <div className="border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30 rounded-xl p-4 sm:p-5">
             <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">মোট আয়</p>
             <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{formatBDT(totalIncome).replace('৳', '৳ ')}</p>
          </div>
          <div className="border border-rose-100 bg-rose-50/50 dark:bg-rose-900/10 dark:border-rose-900/30 rounded-xl p-4 sm:p-5">
             <p className="text-xs font-semibold text-rose-800 dark:text-rose-400 mb-1">মোট খরচ</p>
             <p className="text-2xl font-bold text-rose-600 dark:text-rose-500">{formatBDT(totalExpense).replace('৳', '৳ ')}</p>
          </div>
          <div className="border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30 rounded-xl p-4 sm:p-5">
             <p className="text-xs font-semibold text-blue-800 dark:text-blue-400 mb-1">বাকি টাকা</p>
             <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{formatBDT(balance).replace('৳', '৳ ')}</p>
          </div>
        </div>

        {/* Income Table */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-500 mb-3 ml-1">আয় হিসাব</h3>
          <div className="overflow-x-auto rounded-lg border border-emerald-200 dark:border-emerald-900/50">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-emerald-500 text-white">
                  <th className="px-4 py-3 font-semibold border-r border-emerald-600 last:border-r-0 whitespace-nowrap">তারিখ</th>
                  <th className="px-4 py-3 font-semibold border-r border-emerald-600 last:border-r-0 w-1/2">বিবরণ</th>
                  <th className="px-4 py-3 font-semibold border-r border-emerald-600 last:border-r-0 text-right whitespace-nowrap">টাকার পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                {incomeTransactions.length > 0 ? (
                  incomeTransactions.map((t, idx) => (
                    <tr key={t.id} className={idx % 2 === 0 ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'bg-white dark:bg-slate-900'}>
                      <td className="px-4 py-3 border-b border-r border-emerald-100 dark:border-emerald-900/30 text-slate-700 dark:text-slate-300">{t.date}</td>
                      <td className="px-4 py-3 border-b border-r border-emerald-100 dark:border-emerald-900/30 text-slate-700 dark:text-slate-300">{t.description || '-'}</td>
                      <td className="px-4 py-3 border-b border-r border-emerald-100 dark:border-emerald-900/30 text-right font-medium text-emerald-600 dark:text-emerald-500">+{formatBDT(t.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center border-b border-emerald-100 dark:border-emerald-900/30 text-slate-500">কোন রেকর্ড নেই</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Table */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-rose-600 dark:text-rose-500 mb-3 ml-1">ব্যয় হিসাব</h3>
          <div className="overflow-x-auto rounded-lg border border-rose-200 dark:border-rose-900/50">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-[#e74c3c] text-white">
                  <th className="px-4 py-3 font-semibold border-r border-[#c0392b] last:border-r-0 whitespace-nowrap">তারিখ</th>
                  <th className="px-4 py-3 font-semibold border-r border-[#c0392b] last:border-r-0 whitespace-nowrap">ক্যাটাগরি</th>
                  <th className="px-4 py-3 font-semibold border-r border-[#c0392b] last:border-r-0 w-1/2">বিবরণ</th>
                  <th className="px-4 py-3 font-semibold border-r border-[#c0392b] last:border-r-0 text-right whitespace-nowrap">টাকার পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                {expenseTransactions.length > 0 ? (
                  expenseTransactions.map((t, idx) => (
                    <tr key={t.id} className={idx % 2 === 0 ? 'bg-rose-50/30 dark:bg-rose-900/10' : 'bg-white dark:bg-slate-900'}>
                      <td className="px-4 py-3 border-b border-r border-rose-100 dark:border-rose-900/30 text-slate-700 dark:text-slate-300">{t.date}</td>
                      <td className="px-4 py-3 border-b border-r border-rose-100 dark:border-rose-900/30 text-slate-700 dark:text-slate-300">{getCategoryName(t.categoryId)}</td>
                      <td className="px-4 py-3 border-b border-r border-rose-100 dark:border-rose-900/30 text-slate-700 dark:text-slate-300">{t.description || '-'}</td>
                      <td className="px-4 py-3 border-b border-r border-rose-100 dark:border-rose-900/30 text-right font-medium text-rose-600 dark:text-rose-400">-{formatBDT(t.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center border-b border-rose-100 dark:border-rose-900/30 text-slate-500">কোন রেকর্ড নেই</td>
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
