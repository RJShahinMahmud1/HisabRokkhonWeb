import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Moon, Sun, Plus, Edit2, Trash2 } from 'lucide-react';
import { Category, PaymentMethod } from '../types';

export function SettingsView() {
  const { 
    isDark, toggleTheme,
    categories, addCategory, updateCategory, deleteCategory,
    paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    lang
  } = useAppStore();

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newPmName, setNewPmName] = useState('');

  const t = {
    categoryManagement: lang === 'hi' ? 'श्रेणी प्रबंधन' : lang === 'bn' ? 'ক্যাটাগরি ম্যানেজমেন্ট' : 'Category Management',
    darkMode: lang === 'hi' ? 'डार्क मोड' : lang === 'bn' ? 'ডার্ক মোড' : 'Dark Mode',
    changeTheme: lang === 'hi' ? 'ऐप की थीम बदलें' : lang === 'bn' ? 'অ্যাপের থিম পরিবর্তন করুন' : 'Change App Theme',
    income: lang === 'hi' ? 'आय' : lang === 'bn' ? 'আয়' : 'Income',
    expense: lang === 'hi' ? 'व्यय' : lang === 'bn' ? 'ব্যয়' : 'Expense',
    newCategoryPlaceholder: lang === 'hi' ? 'नई श्रेणी' : lang === 'bn' ? 'নতুন ক্যাটাগরি' : 'New Category Name',
    addBtn: lang === 'hi' ? 'जोड़ें' : lang === 'bn' ? 'যুক্ত করুন' : 'Add',
    editPrompt: lang === 'hi' ? 'नया नाम दर्ज करें:' : lang === 'bn' ? 'নতুন নাম দিন:' : 'Enter new name:',
    paymentMethods: lang === 'hi' ? 'भुगतान विधियां' : lang === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Methods',
    newPmPlaceholder: lang === 'hi' ? 'नई विधि (जैसे: कार्ड)' : lang === 'bn' ? 'নতুন মেথড (উদাঃ কার্ড)' : 'New Method (e.g. Card)',
    footerVersion: lang === 'hi' ? 'हिसाब रक्षक - संस्करण १.०' : lang === 'bn' ? 'হিসাব রক্ষক - সংস্করণ ১.০' : 'Hisab Rokkhok - Version 1.0',
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory({ name: newCatName.trim(), type: newCatType, enabled: true });
      setNewCatName('');
    }
  };

  const handleAddPaymentMethod = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPmName.trim()) {
      addPaymentMethod({ name: newPmName.trim(), enabled: true });
      setNewPmName('');
    }
  };

  const toggleCategoryStatus = (c: Category) => {
    updateCategory({ ...c, enabled: !c.enabled });
  };

  const togglePmStatus = (pm: PaymentMethod) => {
    updatePaymentMethod({ ...pm, enabled: !pm.enabled });
  };

  const handleEditCategory = (c: Category) => {
    const newName = prompt(t.editPrompt, c.name);
    if (newName && newName.trim() !== '') {
      updateCategory({ ...c, name: newName.trim() });
    }
  };

  const handleEditPm = (pm: PaymentMethod) => {
    const newName = prompt(t.editPrompt, pm.name);
    if (newName && newName.trim() !== '') {
      updatePaymentMethod({ ...pm, name: newName.trim() });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">{t.categoryManagement}</h2>

      <Card>
        <CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">{t.darkMode}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.changeTheme}</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border border-slate-200 dark:border-slate-600"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.categoryManagement}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <select 
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value as any)}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none appearance-none shadow-sm"
            >
              <option value="expense">{t.expense}</option>
              <option value="income">{t.income}</option>
            </select>
            <input 
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder={t.newCategoryPlaceholder}
              className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
            />
            <button type="submit" className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 font-bold transition flex justify-center items-center">
              <Plus className="w-5 h-5 mr-2 sm:mr-0 inline sm:hidden" />
              <span className="sm:hidden font-medium ml-1">{t.addBtn}</span>
              <Plus className="w-5 h-5 hidden sm:inline" />
            </button>
          </form>

          <div className="space-y-3">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox"
                    checked={c.enabled}
                    onChange={() => toggleCategoryStatus(c)}
                    className="w-5 h-5 text-blue-600 rounded-md focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                  />
                  <span className={`font-bold ${!c.enabled ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                    {c.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${c.type === 'income' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
                    {c.type === 'income' ? t.income : t.expense}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditCategory(c)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition" title={t.editPrompt}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCategory(c.id)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.paymentMethods}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPaymentMethod} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <input 
              type="text"
              value={newPmName}
              onChange={(e) => setNewPmName(e.target.value)}
              placeholder={t.newPmPlaceholder}
              className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
            />
            <button type="submit" className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 hover:bg-blue-700 font-bold transition flex justify-center items-center">
              <Plus className="w-5 h-5 mr-2 sm:mr-0 inline sm:hidden" />
              <span className="sm:hidden font-medium ml-1">{t.addBtn}</span>
              <Plus className="w-5 h-5 hidden sm:inline" />
            </button>
          </form>

          <div className="space-y-3">
            {paymentMethods.map(pm => (
              <div key={pm.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-[20px] border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox"
                    checked={pm.enabled}
                    onChange={() => togglePmStatus(pm)}
                    className="w-5 h-5 text-blue-600 rounded-md focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                  />
                  <span className={`font-bold ${!pm.enabled ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                    {pm.name}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditPm(pm)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition" title={t.editPrompt}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deletePaymentMethod(pm.id)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8 mb-6 font-medium">
        {t.footerVersion}
      </div>
    </div>
  );
}
