import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Camera, Lock, Share2, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ProfileView() {
  const { user, updateProfile, logout } = useAppStore();

  const [editName, setEditName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('নতুন পাসওয়ার্ড দুটি মিলছে না!');
      return;
    }
    
    if (!currentPassword || !password || !user?.email) {
      alert('সব তথ্য সঠিকভাবে দিন।');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });
    
    if (signInError) {
      alert('বর্তমান পাসওয়ার্ড ভুল হয়েছে!');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      alert('ত্রুটি: ' + error.message);
    } else {
      alert('পাসওয়ার্ড আপডেট করা হয়েছে!');
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleShare = () => {
    const url = 'https://web2apkpro.com/public_download.php?project_id=16843&token=8a30c7ab7a';
    if (navigator.share) {
      navigator.share({
        title: 'হিসাব রক্ষক',
        text: 'আমাদের হিসাব রক্ষক অ্যাপটি ব্যবহার করে দেখুন।',
        url: url,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(url);
      alert('ডাউনলোড লিংক কপি করা হয়েছে!');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">প্রোফাইল</h2>
        <button onClick={handleShare} className="flex items-center gap-2 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-4 py-2 rounded-xl font-bold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition">
          <Share2 className="w-5 h-5" />
          <span>শেয়ার করুন</span>
        </button>
      </div>

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
          <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-3">
            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড"
                  className="w-full pl-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড"
                  className="w-full pl-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড রি-টাইপ করুন"
                  className="w-full pl-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                />
              </div>
              <button type="submit" className="w-full py-2.5 sm:py-3 px-6 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-bold hover:bg-slate-900 dark:hover:bg-slate-600 transition shadow-sm">
                পাসওয়ার্ড আপডেট করুন
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <button 
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3.5 mt-6 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-2xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition border border-rose-100 dark:border-rose-900/50"
      >
        <LogOut className="w-5 h-5" />
        লগআউট করুন
      </button>
    </div>
  );
}
