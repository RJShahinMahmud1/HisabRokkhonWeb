import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';

export function LoansView() {
  const { loans, addLoan, updateLoan, deleteLoan, lang } = useAppStore();
  const [type, setType] = useState<'loan_given' | 'loan_taken'>('loan_given');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  const [repayInputs, setRepayInputs] = useState<Record<string, string>>({});

  const t = {
    loansPage: lang === 'hi' ? 'उधार / ऋण' : lang === 'bn' ? 'ধার / দেনা' : 'Loans / Debts',
    typeLabel: lang === 'hi' ? 'प्रकार' : lang === 'bn' ? 'ধরন' : 'Type',
    loanGiven: lang === 'hi' ? 'मैंने किसी को उधार दिया है' : lang === 'bn' ? 'কাউকে ধার দিয়েছি' : 'Loan Given (Leased out)',
    loanTaken: lang === 'hi' ? 'मैंने किसी से उधार लिया है' : lang === 'bn' ? 'কারো থেকে ধার নিয়েছি' : 'Loan Taken (Borrowed)',
    personNameLabel: lang === 'hi' ? 'व्यक्ति का नाम' : lang === 'bn' ? 'ব্যক্তির নাম' : 'Person Name',
    namePlaceholder: lang === 'hi' ? 'नाम' : lang === 'bn' ? 'নাম' : 'Name',
    amountLabel: lang === 'hi' ? 'मात्रा (৳)' : lang === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)',
    dueDateLabel: lang === 'hi' ? 'वापसी की तारीख (वैकल्पिक)' : lang === 'bn' ? 'ফেরতের তারিখ (ঐচ্ছিক)' : 'Due Date (Optional)',
    noteLabel: lang === 'hi' ? 'नोट (वैकल्पिक)' : lang === 'bn' ? 'নোট (ঐচ্ছিক)' : 'Note (Optional)',
    notePlaceholder: lang === 'hi' ? 'विवरण...' : lang === 'bn' ? 'বিস্তারিত...' : 'Details...',
    addBtn: lang === 'hi' ? 'जोड़ें' : lang === 'bn' ? 'যোগ করুন' : 'Add Loan',
    currentLoans: lang === 'hi' ? 'वर्तमान उधार / ऋण' : lang === 'bn' ? 'বর্তমান ধার / দেনা' : 'Current Loans / Debts',
    deleteTitle: lang === 'hi' ? 'हटाएं' : lang === 'bn' ? 'ডিলিট করুন' : 'Delete',
    iReceive: lang === 'hi' ? 'मुझे मिलेगा' : lang === 'bn' ? 'আমি পাবো' : 'I will receive',
    iPay: lang === 'hi' ? 'मेरा कर्ज' : lang === 'bn' ? 'আমার কাছে পাবে' : 'I will pay',
    repaidLabel: lang === 'hi' ? 'भुगतान किया गया: ' : lang === 'bn' ? 'পরিশোধিত: ' : 'Repaid: ',
    dueLabel: lang === 'hi' ? 'शेष: ' : lang === 'bn' ? 'বাকি: ' : 'Remaining: ',
    repayPlaceholder: lang === 'hi' ? 'मात्रा' : lang === 'bn' ? 'পরিমাণ' : 'Amount',
    repayBtn: lang === 'hi' ? 'जमा' : lang === 'bn' ? 'জমা' : 'Repay',
    clearedText: lang === 'hi' ? 'भुगतान किया' : lang === 'bn' ? 'পরিশোধিত' : 'Cleared',
    repaidAllLabel: lang === 'hi' ? 'पूर्ण भुगतान' : lang === 'bn' ? 'সম্পূর্ণ পরিশোধিত' : 'Fully Repaid',
    noLoans: lang === 'hi' ? 'वर्तमान में कोई उधार/ऋण नहीं है' : lang === 'bn' ? 'বর্তমানে কোনো ধার/দেনা নেই' : 'No active loans/debts',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName || !amount) return;

    addLoan({
      type,
      personName,
      amount: Number(amount),
      repaidAmount: 0,
      date: new Date().toISOString().split('T')[0],
      dueDate: dueDate || undefined,
      note,
      status: 'active'
    });

    setPersonName('');
    setAmount('');
    setDueDate('');
    setNote('');
  };

  const activeLoans = loans.filter(l => l.status === 'active');
  const clearedLoans = loans.filter(l => l.status === 'cleared');

  const markCleared = (id: string) => {
    const loan = loans.find(l => l.id === id);
    if (loan) {
      updateLoan({ ...loan, status: 'cleared', repaidAmount: loan.amount });
    }
  };

  const handlePartialRepay = (id: string) => {
    const loan = loans.find(l => l.id === id);
    const repayVal = Number(repayInputs[id]);
    if (loan && repayVal > 0) {
      const newRepaid = (loan.repaidAmount || 0) + repayVal;
      if (newRepaid >= loan.amount) {
        updateLoan({ ...loan, status: 'cleared', repaidAmount: loan.amount });
      } else {
        updateLoan({ ...loan, repaidAmount: newRepaid });
      }
      setRepayInputs(prev => ({ ...prev, [id]: '' }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t.loansPage}</h2>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.typeLabel}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white appearance-none shadow-sm"
                >
                  <option value="loan_given">{t.loanGiven}</option>
                  <option value="loan_taken">{t.loanTaken}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.personNameLabel}</label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white shadow-sm"
                  placeholder={t.namePlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.amountLabel}</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white shadow-sm"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.dueDateLabel}</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.noteLabel}</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none dark:text-white shadow-sm"
                placeholder={t.notePlaceholder}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center items-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-full shadow-md text-sm font-bold text-white transition bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t.addBtn}
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.currentLoans}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeLoans.length > 0 ? (
            activeLoans.map(loan => {
              const repaidPercent = Math.min(((loan.repaidAmount || 0) / loan.amount) * 100, 100);
              const remainingAmount = loan.amount - (loan.repaidAmount || 0);
              const isGiven = loan.type === 'loan_given';

              return (
                <Card 
                  key={loan.id} 
                  className={`border border-slate-100 dark:border-slate-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] border-l-4 ${isGiven ? 'border-l-sky-500 dark:border-l-sky-400' : 'border-l-rose-500 dark:border-l-rose-400'}`}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex justify-between items-start gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-base text-slate-900 dark:text-white leading-tight">{loan.personName}</h4>
                          <button 
                            onClick={() => deleteLoan(loan.id)} 
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900 transition" 
                            title={t.deleteTitle}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${isGiven ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                          {isGiven ? t.iReceive : t.iPay}
                        </span>
                        {loan.note && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800/40 inline-block">{loan.note}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-black text-lg ${isGiven ? 'text-sky-600 dark:text-sky-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {formatBDT(loan.amount)}
                        </p>
                        {loan.dueDate && (
                          <p className="text-[10px] font-bold text-slate-500 flex items-center justify-end mt-1 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/40">
                            <Clock className="w-2.5 h-2.5 mr-1" />
                            {new Date(loan.dueDate).toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar showing how much is repaid */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/50 dark:border-slate-800/50">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-1000 ${isGiven ? 'bg-sky-500' : 'bg-rose-500'}`} 
                          style={{ width: `${repaidPercent}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                      <div>
                        {t.repaidLabel}
                        <span className="font-black text-emerald-600 dark:text-emerald-400 ml-1">{formatBDT(loan.repaidAmount || 0)}</span>
                      </div>
                      <div>
                        {t.dueLabel}
                        <span className="font-black text-rose-500 ml-1">{formatBDT(remainingAmount)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number"
                          min="0"
                          placeholder={t.repayPlaceholder}
                          value={repayInputs[loan.id] || ''}
                          onChange={(e) => setRepayInputs({...repayInputs, [loan.id]: e.target.value})}
                          className="w-20 sm:w-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/50 outline-none dark:text-white font-bold shadow-sm"
                        />
                        <button 
                          onClick={() => handlePartialRepay(loan.id)}
                          disabled={!repayInputs[loan.id]}
                          className="text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 px-3 py-1.5 rounded-xl transition-all shadow-[0_2px_10px_rgba(16,185,129,0.1)]"
                        >
                          {t.repayBtn}
                        </button>
                      </div>
                      <button 
                        onClick={() => markCleared(loan.id)}
                        className="shrink-0 flex items-center text-xs font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 px-3 py-1.5 rounded-xl transition-all border border-emerald-100 dark:border-emerald-900/30"
                        title={t.repaidAllLabel}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        <span>{t.clearedText}</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="col-span-full text-center text-slate-500 dark:text-slate-400 py-4">{t.noLoans}</p>
          )}
        </div>
      </div>
      
      {clearedLoans.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400 mb-4 px-2">{t.clearedText}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
            {clearedLoans.map(loan => (
              <Card key={loan.id}>
                <CardContent className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-300 line-through">{loan.personName}</h4>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" /> {t.clearedText}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {formatBDT(loan.amount)}
                    </span>
                    <button
                      onClick={() => deleteLoan(loan.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition"
                      title={t.deleteTitle}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
