import React, { useState } from 'react';
import { useAppStore } from '../store';
import { formatBDT } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Target, TrendingUp } from 'lucide-react';

export function SavingsView() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal } = useAppStore();
  
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [depositAmount, setDepositAmount] = useState('');
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">সঞ্চয়</h2>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">নতুন লক্ষ্য যোগ করুন</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text" required
                  value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                  placeholder="লক্ষ্যের নাম (উদাঃ হজ্ব, ল্যাপটপ)"
                />
              </div>
              <div>
                <input
                  type="number" required min="0"
                  value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                  placeholder="লক্ষ্যমাত্রা (৳)"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={deadline} onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 hover:bg-blue-700 font-bold transition flex items-center justify-center w-full md:w-auto"
            >
              <Plus className="w-5 h-5 mr-2" /> যোগ করুন
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 mt-8">
        {savingsGoals.length > 0 ? savingsGoals.map(goal => {
          const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
          
          return (
            <Card key={goal.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-2xl text-blue-600 dark:text-blue-400">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">{goal.name}</h4>
                      {goal.deadline && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">
                          সময়সীমা: {new Date(goal.deadline).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric'})}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-slate-900 dark:text-white">{formatBDT(goal.savedAmount)}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">লক্ষ্য: {formatBDT(goal.targetAmount)}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-3 mb-4 overflow-hidden border border-white/50 dark:border-slate-600/50">
                  <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">{progress.toFixed(1)}% সম্পন্ন</span>
                  
                  {activeGoalId === goal.id ? (
                    <form onSubmit={(e) => handleDeposit(e, goal.id)} className="flex items-center space-x-2">
                      <input 
                        type="number" required min="1"
                        placeholder="জমা (৳)"
                        value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-28 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900"
                      />
                      <button type="submit" className="text-sm font-bold px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-md transition text-slate-900">সংরক্ষণ</button>
                      <button type="button" onClick={() => setActiveGoalId(null)} className="text-sm font-bold px-4 py-2 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl transition">বাতিল</button>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setActiveGoalId(goal.id)}
                      className="text-sm flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-2 rounded-xl transition"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" /> টাকা জমা দিন
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-4">কোনো সঞ্চয়ের লক্ষ্য নেই</p>
        )}
      </div>
    </div>
  );
}
