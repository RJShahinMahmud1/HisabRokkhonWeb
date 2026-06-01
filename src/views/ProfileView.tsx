import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Camera, Lock, Share2, LogOut, Download, Upload, Mail } from 'lucide-react';
import { updateUserEmail } from '../lib/firebase';

export function ProfileView() {
  const { user, updateProfile, logout, importState } = useAppStore();

  const [editName, setEditName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [emailUpdating, setEmailUpdating] = useState(false);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editName, avatar);
    alert('প্রোফাইল আপডেট হয়েছে!');
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || newEmail === user?.email) return;
    
    setEmailUpdating(true);
    try {
      await updateUserEmail(newEmail);
      alert('ইমেইল সফলভাবে আপডেট হয়েছে!');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
         alert('নিরাপত্তার কারণে পুনরায় লগইন করে আবার চেষ্টা করুন।');
      } else {
         alert('ত্রুটি: ' + (error.message || 'কিছু একটা ভুল হয়েছে'));
      }
    } finally {
      setEmailUpdating(false);
    }
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

  const handleExport = () => {
    const rawData = localStorage.getItem('hisab_rokkhok_data');
    if (rawData) {
      const blob = new Blob([rawData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hisab_rokkhok_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert("কোন ডাটা পাওয়া যায়নি!");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
         if (importState(content)) {
           alert("ডাটা সফলভাবে রিস্টোর হয়েছে!");
         } else {
           alert("ভুল ফাইল ফরম্যাট!");
         }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
          <CardTitle>ইমেইল পরিবর্তন</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="নতুন ইমেইল এড্রেস"
                className="w-full pl-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={emailUpdating || newEmail === user?.email}
              className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {emailUpdating ? 'আপডেট হচ্ছে...' : 'ইমেইল সংরক্ষণ করুন'}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ডাটা ব্যাকআপ ও রিস্টোর</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-2xl font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition border border-emerald-200 dark:border-emerald-800/50"
            >
              <Download className="w-5 h-5" />
              ডাটা ব্যাকআপ (Export)
            </button>
            <div className="relative">
              <input 
                type="file" 
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="ডাটা রিস্টোর করুন"
              />
              <button 
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-2xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition border border-blue-200 dark:border-blue-800/50"
              >
                <Upload className="w-5 h-5" />
                ডাটা রিস্টোর (Import)
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
            অফলাইনে ডাটা সংরক্ষণের জন্য ব্যাকআপ তৈরি করুন অথবা পূর্বের ব্যাকআপ ফাইল থেকে রিস্টোর করুন।
          </p>
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
