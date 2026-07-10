import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Card, CardContent } from '../components/ui/Card';
import { Camera, Lock, Share2, LogOut, Download, Upload, MapPin, Database, Key, X, ArrowLeft, Calendar, GraduationCap, Heart, User, Sparkles } from 'lucide-react';
import { updateUserPassword, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ProfileSetupWizard } from '../components/ProfileSetupWizard';
import { compressImage } from '../lib/utils';

export function ProfileView({ profileId, onBack }: { profileId?: string | null, onBack?: () => void, onViewProfile?: (uid: string) => void }) {
  const { user, updateProfile, logout, importState, lang } = useAppStore();

  const isOwnProfile = !profileId || profileId === user?.id;
  const activeProfileId = profileId || user?.id;

  const [publicUser, setPublicUser] = useState<any>(null);
  const [loadingPublic, setLoadingPublic] = useState(true);

  useEffect(() => {
    if (activeProfileId) {
       const unsubscribe = onSnapshot(doc(db, 'publicProfiles', activeProfileId), (snap) => {
           if (snap.exists()) {
               setPublicUser({ ...snap.data(), id: snap.id });
           } else {
               setPublicUser(null);
           }
           setLoadingPublic(false);
       });
       return () => unsubscribe();
    } else {
       setLoadingPublic(false);
    }
  }, [activeProfileId]);

  const displayUser = isOwnProfile ? { ...user, ...publicUser } : publicUser;

  const [editName, setEditName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editHobbies, setEditHobbies] = useState('');
  const [editDob, setEditDob] = useState('');

  // Sync edit state when displayUser changes
  useEffect(() => {
    if (displayUser) {
      setEditName(displayUser.name || '');
      setAvatar(displayUser.avatarUrl || '');
      setEditCoverUrl(displayUser.coverUrl || '');
      setEditBio(displayUser.bio || '');
      setEditLocation(displayUser.location || '');
      setEditDesignation(displayUser.designation || '');
      setEditEducation(displayUser.education || '');
      setEditHobbies(displayUser.hobbies || '');
      setEditDob(displayUser.dob || '');
    }
  }, [displayUser?.id, showEditModalState()]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Helper to know if modal was toggled
  function showEditModalState() {
     return showEditModal;
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ 
      name: editName, 
      avatarUrl: avatar, 
      coverUrl: editCoverUrl, 
      bio: editBio, 
      location: editLocation,
      designation: editDesignation,
      education: editEducation,
      hobbies: editHobbies,
      dob: editDob
    });
    alert('প্রোফাইল আপডেট হয়েছে!');
    setShowEditModal(false);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 200, 200);
      setAvatar(compressed);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 600, 600);
      setEditCoverUrl(compressed);
    }
  };

  const handleShare = () => {
    const url = window.location.origin;
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

  if (isOwnProfile && (!user || !user.profileSetupCompleted)) {
      return <ProfileSetupWizard onComplete={() => {}} />;
  }

  if (loadingPublic) {
      return (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-xl mx-auto bg-slate-50 dark:bg-slate-950 min-h-screen pb-12">
      {/* Top Bar with Back button */}
      <div className="flex items-center justify-between p-4 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-800 dark:text-white mr-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="font-bold text-lg text-slate-900 dark:text-white">
            {isOwnProfile ? (lang === 'bn' ? 'আমার প্রোফাইল' : 'My Profile') : (displayUser?.name || 'Profile')}
          </h1>
        </div>
        {isOwnProfile && (
          <div className="flex gap-1">
            <button onClick={() => setShowBackupModal(true)} className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="ডাটা ব্যাকআপ ও রিস্টোর">
              <Database className="w-5 h-5" />
            </button>
            <button onClick={handleShare} className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition" title="শেয়ার">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Cover and Avatar Section */}
      <Card className="overflow-hidden border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl">
        <div className="relative h-40 sm:h-48 bg-slate-200 dark:bg-slate-800">
          {displayUser?.coverUrl ? (
             <img src={displayUser.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-blue-500"></div>
          )}
          {isOwnProfile && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-800/95 p-2 rounded-full shadow-md text-slate-800 dark:text-slate-200 hover:scale-105 active:scale-95 transition"
              >
                <Camera className="w-4 h-4" />
              </button>
          )}
        </div>
        
        <div className="px-4 sm:px-6 pb-6 relative">
          {/* Avatar Positioned hanging over cover */}
          <div className="relative flex justify-start -mt-12 sm:-mt-16 mb-4">
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-50 dark:bg-emerald-950/40 overflow-hidden flex items-center justify-center shadow-md">
                 {displayUser?.avatarUrl ? (
                   <img src={displayUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{displayUser?.name?.charAt(0) || 'U'}</span>
                 )}
              </div>
              {isOwnProfile && (
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="absolute bottom-1 right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-900 hover:scale-105 transition shadow"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              {displayUser?.name || 'User'}
            </h2>
            {displayUser?.username && <p className="text-sm font-medium text-slate-500">@{displayUser.username}</p>}
            {displayUser?.designation && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                <Sparkles className="w-4 h-4" />
                {displayUser.designation}
              </p>
            )}
            {displayUser?.bio && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 italic">
                "{displayUser.bio}"
              </p>
            )}
          </div>

          {isOwnProfile && (
            <div className="mt-5">
              <button 
                onClick={() => setShowEditModal(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 rounded-2xl transition flex items-center justify-center gap-2 text-sm"
              >
                <span>প্রোফাইল সম্পাদন করুন</span>
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Personal Details Section */}
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl">
        <CardContent className="p-5 sm:p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-500" />
            <span>{lang === 'bn' ? 'ব্যক্তিগত বিবরণ' : 'Personal Details'}</span>
          </h3>

          <div className="grid grid-cols-1 gap-4 text-sm">
            {displayUser?.location && (
              <div className="flex gap-3 items-center text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{lang === 'bn' ? 'স্থান' : 'Location'}</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{displayUser.location}</p>
                </div>
              </div>
            )}

            {displayUser?.education && (
              <div className="flex gap-3 items-center text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{lang === 'bn' ? 'শিক্ষা' : 'Education'}</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{displayUser.education}</p>
                </div>
              </div>
            )}

            {displayUser?.dob && (
              <div className="flex gap-3 items-center text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{lang === 'bn' ? 'জন্ম তারিখ' : 'Date of Birth'}</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{displayUser.dob}</p>
                </div>
              </div>
            )}

            {displayUser?.hobbies && (
              <div className="flex gap-3 items-center text-slate-700 dark:text-slate-300">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{lang === 'bn' ? 'শখ' : 'Hobbies'}</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{displayUser.hobbies}</p>
                </div>
              </div>
            )}

            {!displayUser?.location && !displayUser?.education && !displayUser?.dob && !displayUser?.hobbies && (
              <div className="text-center py-6 text-slate-400">
                <p>{lang === 'bn' ? 'কোন তথ্য প্রদান করা হয়নি।' : 'No details provided yet.'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Control Settings */}
      {isOwnProfile && (
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              {lang === 'bn' ? 'নিরাপত্তা ও নিয়ন্ত্রণ সেটিংস' : 'Security & Control'}
            </h3>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold transition border border-slate-100 dark:border-slate-800/50"
              >
                <Key className="w-4 h-4 text-emerald-500" />
                <span>পাসওয়ার্ড পরিবর্তন করুন</span>
              </button>

              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-2xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition border border-rose-100/50 dark:border-rose-900/50"
              >
                <LogOut className="w-4 h-4" />
                <span>লগআউট করুন</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[150] flex flex-col justify-end sm:items-center sm:justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden w-full max-w-lg shadow-xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Edit Profile
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-600 transition outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <form id="editProfileForm" onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col items-center space-y-4 mb-4">
                    <div className="w-full space-y-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cover Photo</p>
                      <div className="h-32 w-full rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center relative overflow-hidden">
                        {editCoverUrl ? <img src={editCoverUrl} alt="Cover" className="w-full h-full object-cover" /> : <span className="text-sm text-slate-500">No cover photo</span>}
                        <label className="absolute bottom-2 right-2 bg-slate-800 text-white rounded-full p-2 cursor-pointer shadow-md hover:bg-slate-900">
                          <Camera className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageUpload} />
                        </label>
                      </div>
                    </div>
                    <div className="w-full space-y-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Profile Picture</p>
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                            {avatar ? (
                              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{editName.charAt(0) || 'U'}</span>
                            )}
                          </div>
                          <label className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-2 cursor-pointer hover:bg-emerald-600 shadow-md">
                            <Camera className="w-4 h-4 text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Name</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Name"
                        className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500/50 dark:text-white outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Designation</label>
                      <input 
                        type="text" 
                        value={editDesignation}
                        onChange={(e) => setEditDesignation(e.target.value)}
                        placeholder="Designation (e.g. Digital creator)"
                        className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500/50 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Bio</label>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Bio"
                        className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500/50 dark:text-white outline-none resize-none"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Location</label>
                      <input 
                        type="text" 
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="Location"
                        className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500/50 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Education</label>
                      <input 
                        type="text" 
                        value={editEducation}
                        onChange={(e) => setEditEducation(e.target.value)}
                        placeholder="Education"
                        className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500/50 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Date of Birth</label>
                      <input 
                        type="text" 
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        placeholder="Date of Birth"
                        className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500/50 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 block mb-1">Hobbies</label>
                      <input 
                        type="text" 
                        value={editHobbies}
                        onChange={(e) => setEditHobbies(e.target.value)}
                        placeholder="Hobbies (e.g. Web Development · Cricket)"
                        className="w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500/50 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
               <button form="editProfileForm" type="submit" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition">
                 Save Changes
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
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
            
            <div className="p-5 space-y-4">
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
                    className="w-full h-full flex flex-col items-center justify-center gap-2 py-4 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-2xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition border border-blue-200 dark:border-blue-800/50"
                  >
                    <Upload className="w-6 h-6 mb-1" />
                    ডাটা রিস্টোর
                    <span className="text-xs font-normal opacity-80">(Import)</span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl leading-relaxed">
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
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
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
            
            <div className="p-5">
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="বর্তমান পাসওয়ার্ড"
                      className="w-full pl-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="নতুন পাসওয়ার্ড"
                      className="w-full pl-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="কনফার্ম পাসওয়ার্ড"
                      className="w-full pl-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none shadow-sm"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={passwordUpdating || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition disabled:opacity-70 disabled:cursor-not-allowed mt-2 text-sm shadow-sm"
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
