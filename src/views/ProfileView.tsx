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

    </div>
  );
}
