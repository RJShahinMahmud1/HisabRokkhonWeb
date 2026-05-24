import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Moon, Sun, Plus, Edit2, Trash2, Camera, Mail, Lock } from 'lucide-react';
import { Category, PaymentMethod } from '../types';
import { supabase } from '../lib/supabase';

export function ProfileView() {
  const { 
    isDark, toggleTheme, user, updateProfile,
    categories, addCategory, updateCategory, deleteCategory,
    paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod
  } = useAppStore();

  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');

  const [newPmName, setNewPmName] = useState('');

  const [editName, setEditName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editName, avatar);
    alert('প্রোফাইল আপডেট হয়েছে!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) {
        alert('ত্রুটি: ' + error.message);
      } else {
        alert('ইমেইল আপডেট করা হয়েছে! দয়া করে নতুন ইমেইল ভেরিফাই করুন।');
      }
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        alert('ত্রুটি: ' + error.message);
      } else {
        alert('পাসওয়ার্ড আপডেট করা হয়েছে!');
        setPassword('');
      }
    }
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
    const newName = prompt('নতুন নাম দিন:', c.name);
    if (newName && newName.trim() !== '') {
      updateCategory({ ...c, name: newName.trim() });
    }
  };

  const handleEditPm = (pm: PaymentMethod) => {
    const newName = prompt('নতুন নাম দিন:', pm.name);
    if (newName && newName.trim() !== '') {
      updatePaymentMethod({ ...pm, name: newName.trim() });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-6">প্রোফাইল</h2>

      <Card>
        <CardHeader>
          <CardTitle>প্রোফাইল আপডেট</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl px-4 font-bold text-blue-600 dark:text-blue-400">{editName.charAt(0) || 'U'}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 cursor-pointer hover:bg-blue-700 transition">
                  <Camera className="w-3 h-3 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition">
              তথ্য সংরক্ষণ করুন
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>অ্যাকাউন্ট সিকিউরিটি</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleEmailUpdate} className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ইমেইল পরিবর্তন</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="নতুন ইমেইল"
                  className="w-full pl-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                />
              </div>
              <button type="submit" className="w-full sm:w-auto py-2.5 sm:py-3 px-6 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition shadow-sm">
                পরিবর্তন
              </button>
            </div>
          </form>

          <form onSubmit={handlePasswordUpdate} className="space-y-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">পাসওয়ার্ড পরিবর্তন</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড"
                  className="w-full pl-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                />
              </div>
              <button type="submit" className="w-full sm:w-auto py-2.5 sm:py-3 px-6 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition shadow-sm">
                আপডেট
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white pt-4 pb-2 border-b border-slate-200 dark:border-slate-800">সেটিংস</h2>

      <Card>
        <CardContent className="p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">ডার্ক মোড</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">অ্যাপের থিম পরিবর্তন করুন</p>
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
          <CardTitle>ক্যাটাগরি ম্যানেজমেন্ট</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <select 
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value as any)}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none appearance-none shadow-sm"
            >
              <option value="expense">ব্যয়</option>
              <option value="income">আয়</option>
            </select>
            <input 
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="নতুন ক্যাটাগরি"
              className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
            />
            <button type="submit" className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:bg-blue-700 font-bold transition flex justify-center items-center">
              <Plus className="w-5 h-5 mr-2 sm:mr-0 inline sm:hidden" />
              <span className="sm:hidden font-medium ml-1">যুক্ত করুন</span>
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
                    {c.type === 'income' ? 'আয়' : 'ব্যয়'}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditCategory(c)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition">
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
          <CardTitle>পেমেন্ট মেথড</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPaymentMethod} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <input 
              type="text"
              value={newPmName}
              onChange={(e) => setNewPmName(e.target.value)}
              placeholder="নতুন মেথড (উদাঃ কার্ড)"
              className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
            />
            <button type="submit" className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 hover:bg-blue-700 font-bold transition flex justify-center items-center">
              <Plus className="w-5 h-5 mr-2 sm:mr-0 inline sm:hidden" />
              <span className="sm:hidden font-medium ml-1">যুক্ত করুন</span>
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
                  <button onClick={() => handleEditPm(pm)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition">
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
        হিসাব রক্ষক - সংস্করণ ১.০
      </div>
    </div>
  );
}
