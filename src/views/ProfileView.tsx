import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Camera, Lock, Share2, LogOut, Download, Upload, MapPin, Image as ImageIcon, Send, Trash2, Database, Key, X } from 'lucide-react';
import { updateUserPassword } from '../lib/firebase';

export function ProfileView() {
  const { user, updateProfile, logout, importState, addPost, deletePost, posts } = useAppStore();

  const [editName, setEditName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [editCoverUrl, setEditCoverUrl] = useState(user?.coverUrl || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editLocation, setEditLocation] = useState(user?.location || '');
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const [showBackupModal, setShowBackupModal] = useState(false);

  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editName, avatar, editCoverUrl, editBio, editLocation);
    alert('প্রোফাইল আপডেট হয়েছে!');
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      alert('বর্তমান পাসওয়ার্ড প্রদান করুন।');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      alert('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।');
      return;
    }
    
    setPasswordUpdating(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      alert('পাসওয়ার্ড সফলভাবে আপডেট হয়েছে!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
         alert('বর্তমান পাসওয়ার্ড ভুল।');
      } else if (error.code === 'auth/requires-recent-login') {
         alert('নিরাপত্তার কারণে পুনরায় লগইন করে আবার চেষ্টা করুন।');
      } else {
         alert('ত্রুটি: ' + (error.message || 'কিছু একটা ভুল হয়েছে'));
      }
    } finally {
      setPasswordUpdating(false);
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

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditCoverUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPostImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() && !postImage) return;
    addPost({
      content: postContent,
      imageUrl: postImage,
      createdAt: new Date().toISOString()
    });
    setPostContent('');
    setPostImage('');
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
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      {/* Cover and Avatar Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="relative h-48 sm:h-64 bg-slate-200 dark:bg-slate-700">
          {user?.coverUrl ? (
             <img src={user.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          )}
        </div>
        
        <div className="px-4 sm:px-6 pb-6 text-center sm:text-left">
          <div className="relative flex justify-center sm:justify-start -mt-16 sm:-mt-20 mb-4">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-800 bg-blue-100 dark:bg-blue-900 overflow-hidden flex items-center justify-center">
               {user?.avatarUrl ? (
                 <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{user?.name?.charAt(0) || 'U'}</span>
               )}
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</h2>
            {user?.bio && <p className="text-slate-600 dark:text-slate-300">{user.bio}</p>}
            {user?.location && (
              <div className="flex items-center justify-center sm:justify-start gap-1 text-slate-500 dark:text-slate-400 text-sm mt-2">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Section */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 overflow-hidden flex items-center justify-center">
                 {user?.avatarUrl ? (
                   <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="font-bold text-blue-600 dark:text-blue-400">{user?.name?.charAt(0) || 'U'}</span>
                 )}
              </div>
              <div className="flex-1 space-y-3">
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="আপনার মনে কি আছে?"
                  className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border-none px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white resize-none outline-none shadow-inner"
                  rows={3}
                />
                
                {postImage && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={postImage} alt="Post Preview" className="w-full max-h-64 object-cover" />
                    <button 
                      type="button"
                      onClick={() => setPostImage('')}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-blue-600 dark:text-blue-400 font-semibold px-3 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition">
                    <ImageIcon className="w-5 h-5" />
                    <span>ছবি যুক্ত করুন</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePostImageUpload} />
                  </label>
                  
                  <button 
                    type="submit" 
                    disabled={!postContent.trim() && !postImage}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <span>পোস্ট করুন</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Posts Timeline */}
      {posts && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 overflow-hidden flex items-center justify-center">
                       {user?.avatarUrl ? (
                         <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                         <span className="font-bold text-blue-600 dark:text-blue-400">{user?.name?.charAt(0) || 'U'}</span>
                       )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deletePost(post.id)}
                    className="text-slate-400 hover:text-rose-500 transition p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {post.content && (
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{post.content}</p>
                )}
                
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 mt-3">
                    <img src={post.imageUrl} alt="Post" className="w-full h-auto max-h-96 object-cover" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Existing Settings Section Header */}
      <div className="flex items-center justify-between pt-8 mb-4 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">প্রোফাইল সেটিংস</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowBackupModal(true)} className="flex items-center justify-center p-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition" title="ডাটা ব্যাকআপ ও রিস্টোর">
            <Database className="w-5 h-5" />
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <Share2 className="w-4 h-4" />
            <span>শেয়ার</span>
          </button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>প্রোফাইল আপডেট</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="flex flex-col space-y-4">
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
                <div className="flex-1 relative">
                  <div className="h-12 w-full rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-sm font-semibold text-slate-500 overflow-hidden relative">
                    {editCoverUrl ? <img src={editCoverUrl} alt="Cover" className="w-full h-full object-cover" /> : 'কভার ছবি যুক্ত করুন'}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-slate-800 text-white rounded-full p-1.5 cursor-pointer hover:bg-slate-900 shadow-xl border-2 border-white dark:border-slate-800">
                    <Camera className="w-3 h-3" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageUpload} />
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                />
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="আপনার সম্পর্কে কিছু লিখুন (Bio)"
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm resize-none"
                  rows={2}
                />
                <input 
                  type="text" 
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="আপনার ঠিকানা (Location)"
                  className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
              <button 
                type="button" 
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
              >
                <Key className="w-4 h-4" />
                পাসওয়ার্ড পরিবর্তন করুন
              </button>
            </div>
            
            <button type="submit" className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition">
              তথ্য সংরক্ষণ করুন
            </button>
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

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" />
                ডাটা ব্যাকআপ ও রিস্টোর
              </h3>
              <button 
                onClick={() => setShowBackupModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-600 transition outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={handleExport}
                  className="flex flex-col items-center justify-center gap-2 py-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-2xl font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition border border-emerald-200 dark:border-emerald-800/50"
                >
                  <Download className="w-6 h-6 mb-1" />
                  ডাটা ব্যাকআপ
                  <span className="text-xs font-normal opacity-80">(Export)</span>
                </button>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".json"
                    onChange={(e) => { handleImport(e); setShowBackupModal(false); }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="ডাটা রিস্টোর করুন"
                  />
                  <button 
                    className="w-full flex flex-col items-center justify-center gap-2 py-4 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-2xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition border border-blue-200 dark:border-blue-800/50"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    ডাটা রিস্টোর
                    <span className="text-xs font-normal opacity-80">(Import)</span>
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                অফলাইনে ডাটা সংরক্ষণের জন্য ব্যাকআপ তৈরি করুন অথবা পূর্বের ব্যাকআপ ফাইল থেকে রিস্টোর করুন।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                পাসওয়ার্ড পরিবর্তন
              </h3>
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-600 transition outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4">
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="বর্তমান পাসওয়ার্ড"
                      className="w-full pl-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড"
                      className="w-full pl-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="কনফার্ম পাসওয়ার্ড"
                      className="w-full pl-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 px-3 sm:px-4 py-2.5 sm:py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={passwordUpdating || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {passwordUpdating ? 'আপডেট হচ্ছে...' : 'পরিবর্তন করুন'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
