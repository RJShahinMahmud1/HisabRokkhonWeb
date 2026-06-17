import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Target, TrendingUp, Edit2, Trash2, X } from 'lucide-react';

export function SavingsView() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, lang } = useAppStore();
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [depositAmount, setDepositAmount] = useState('');
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  // States for editing a goal
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTargetAmount, setEditTargetAmount] = useState('');
  const [editSavedAmount, setEditSavedAmount] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const t = {
    savings: lang === 'hi' ? 'बचत' : lang === 'bn' ? 'সঞ্চয়' : 'Savings',
    addNewGoal: lang === 'hi' ? 'नया लक्ष्य जोड़ें' : lang === 'bn' ? 'নতুন লক্ষ্য যোগ করুন' : 'Add New Goal',
    goalNamePlaceholder: lang === 'hi' ? 'लक्ष्य का नाम (उदा: लैपटॉप)' : lang === 'bn' ? 'লক্ষ্যের নাম (উদাঃ হজ্ব, ল্যাপটপ)' : 'Goal Name (e.g., Laptop)',
    targetAmountPlaceholder: lang === 'hi' ? 'लक्ष्य राशि (৳)' : lang === 'bn' ? 'লক্ষ্যমাত্রা (৳)' : 'Target Amount (৳)',
    addBtn: lang === 'hi' ? 'जोड़ें' : lang === 'bn' ? 'যোগ করুন' : 'Add Goal',
    editGoal: lang === 'hi' ? 'लक्ष्य संपादित करें' : lang === 'bn' ? 'লক্ষ্য সম্পাদন করুন' : 'Edit Goal',
    goalNameLabel: lang === 'hi' ? 'लक्ष्य का नाम' : lang === 'bn' ? 'লক্ষ্যের নাম' : 'Goal Name',
    targetAmountLabel: lang === 'hi' ? 'लक्ष्य मात्रा (৳)' : lang === 'bn' ? 'লক্ষ্যমাত্রা (৳)' : 'Target Amount (৳)',
    savedAmountLabel: lang === 'hi' ? 'बचाई गई राशि (৳)' : lang === 'bn' ? 'সংরক্ষিত পরিমাণ (৳)' : 'Saved Amount (৳)',
    deadlineLabel: lang === 'hi' ? 'समय सीमा' : lang === 'bn' ? 'সময়সীমা' : 'Deadline',
    cancel: lang === 'hi' ? 'रद्द करें' : lang === 'bn' ? 'বাতিল' : 'Cancel',
    saveBtn: lang === 'hi' ? 'सहेजें' : lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save',
    edit: lang === 'hi' ? 'संपादित करें' : lang === 'bn' ? 'এডিট' : 'Edit',
    deleteLabel: lang === 'hi' ? 'हटाएं' : lang === 'bn' ? 'মুছুন' : 'Delete',
    confirm: lang === 'hi' ? 'पक्का?' : lang === 'bn' ? 'নিশ্চিত?' : 'Confirm?',
    yes: lang === 'hi' ? 'हाँ' : lang === 'bn' ? 'হ্যাঁ' : 'Yes',
    no: lang === 'hi' ? 'नहीं' : lang === 'bn' ? 'না' : 'No',
    goalLabel: lang === 'hi' ? 'लक्ष्य:' : lang === 'bn' ? 'লক্ষ্য:' : 'Goal:',
    noDeadline: lang === 'hi' ? 'कोई समय सीमा निर्धारित नहीं' : lang === 'bn' ? 'কোনো সময়সীমা নির্ধারণ করা নেই' : 'No deadline specified',
    completedText: lang === 'hi' ? 'पूरा हुआ' : lang === 'bn' ? 'সম্পন্ন' : 'Completed',
    depositLabel: lang === 'hi' ? 'जमा (৳)' : lang === 'bn' ? 'জমা (৳)' : 'Deposit (৳)',
    depositBtnText: lang === 'hi' ? 'पैसे जमा करें' : lang === 'bn' ? 'টাকা জমা দিন' : 'Deposit Money',
    noGoals: lang === 'hi' ? 'कोई बचत का लक्ष्य नहीं है' : lang === 'bn' ? 'কোনো সঞ্চয়ের লক্ষ্য নেই' : 'No savings goals set yet',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    addSavingsGoal({
      name,
      targetAmount: Number(targetAmount),
      savedAmount: 0,
      deadline: deadline || undefined,
    });

    setName('');
    setTargetAmount('');
    setDeadline('');
  };

  const handleDeposit = (e: React.FormEvent, goalId: string) => {
    e.preventDefault();
    if (!depositAmount || !goalId) return;

    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    updateSavingsGoal({ ...goal, savedAmount: goal.savedAmount + Number(depositAmount) });
    setDepositAmount('');
    setActiveGoalId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t.savings}</h2>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t.addNewGoal}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text" required
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                  placeholder={t.goalNamePlaceholder}
                />
              </div>
              <div>
                <input
                  type="number" required min="0"
                  value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                  placeholder={t.targetAmountPlaceholder}
                />
              </div>
              <div>
                <input
                  type="date"
                  value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 hover:bg-blue-700 font-bold transition flex items-center justify-center w-full md:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" /> {t.addBtn}
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-8">
        {savingsGoals.length > 0 ? savingsGoals.map(goal => {
          const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
          
          if (editingGoalId === goal.id) {
            return (
              <Card key={goal.id}>
                <CardContent className="p-4 sm:p-6">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateSavingsGoal({
                        id: goal.id,
                        name: editName,
                        targetAmount: Number(editTargetAmount),
                        savedAmount: Number(editSavedAmount),
                        deadline: editDeadline || undefined
                      });
                      setEditingGoalId(null);
                    }} 
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                      <h4 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-blue-500" /> {t.editGoal}
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setEditingGoalId(null)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-500 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.goalNameLabel}</label>
                        <input 
                          type="text" required
                          value={editName} onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.targetAmountLabel}</label>
                        <input 
                          type="number" required min="0"
                          value={editTargetAmount} onChange={(e) => setEditTargetAmount(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.savedAmountLabel}</label>
                        <input 
                          type="number" required min="0"
                          value={editSavedAmount} onChange={(e) => setEditSavedAmount(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t.deadlineLabel}</label>
                        <input 
                          type="date"
                          value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button 
                        type="button" 
                        onClick={() => setEditingGoalId(null)} 
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/10 transition"
                      >
                        {t.saveBtn}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={goal.id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-2xl text-blue-600 dark:text-blue-400 mt-1 shrink-0">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">{goal.name}</h4>
                      {goal.deadline ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 tracking-wide mt-0.5">
                          {lang === 'hi' ? `समय सीमा: ${new Date(goal.deadline).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric'})}` : lang === 'bn' ? `সময়সীমা: ${new Date(goal.deadline).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric'})}` : `Deadline: ${new Date(goal.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}`}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 dark:text-slate-500">{t.noDeadline}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingGoalId(goal.id);
                          setEditName(goal.name);
                          setEditTargetAmount(String(goal.targetAmount));
                          setEditSavedAmount(String(goal.savedAmount));
                          setEditDeadline(goal.deadline || '');
                        }} 
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> {t.edit}
                      </button>
                      {deleteConfirmId === goal.id ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 p-1 rounded-lg">
                          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold px-1">{t.confirm}</span>
                          <button 
                            onClick={() => {
                              deleteSavingsGoal(goal.id);
                              setDeleteConfirmId(null);
                            }}
                            className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-bold hover:bg-rose-700 transition"
                          >
                            {t.yes}
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(null)}
                            className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                          >
                            {t.no}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setDeleteConfirmId(goal.id)} 
                          className="px-2.5 py-1 text-xs bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> {t.deleteLabel}
                        </button>
                      )}
                    </div>
                    <div className="text-right mt-1">
                      <p className="font-bold text-xl text-slate-900 dark:text-white">{formatBDT(goal.savedAmount)}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{t.goalLabel} {formatBDT(goal.targetAmount)}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-3 mb-4 overflow-hidden border border-white/50 dark:border-slate-600/50">
                  <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">{progress.toFixed(1)}% {t.completedText}</span>
                  
                  {activeGoalId === goal.id ? (
                    <form onSubmit={(e) => handleDeposit(e, goal.id)} className="flex items-center space-x-2">
                      <input 
                        type="number" required min="1"
                        placeholder={t.depositLabel}
                        value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-28 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                      />
                      <button type="submit" className="text-sm font-bold px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md transition">{t.saveBtn}</button>
                      <button type="button" onClick={() => setActiveGoalId(null)} className="text-sm font-bold px-3 sm:px-4 py-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl transition">{t.cancel}</button>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setActiveGoalId(goal.id)}
                      className="text-sm flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 sm:px-4 py-2 rounded-xl transition"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" /> {t.depositBtnText}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4">{t.noGoals}</p>
        )}
      </div>
    </div>
  );
}
