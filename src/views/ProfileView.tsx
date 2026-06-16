import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Camera, Lock, Share2, LogOut, Download, Upload, MapPin, Image as ImageIcon, Send, Trash2, Database, Key, X, ArrowLeft, Heart, MessageCircle, UserPlus, UserMinus, MessageSquare } from 'lucide-react';
import { updateUserPassword, db } from '../lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { ProfileSetupWizard } from '../components/ProfileSetupWizard';
import { PublicProfile } from '../lib/chatService';
import { toggleReaction, addComment, toggleFollow } from '../lib/socialService';
import { UserListModal } from '../components/UserListModal';

export function ProfileView({ profileId, onBack, onViewProfile }: { profileId?: string | null, onBack?: () => void, onViewProfile?: (uid: string) => void }) {
  const { user, updateProfile, logout, importState, addPost, deletePost, posts } = useAppStore();

  const isOwnProfile = !profileId || profileId === user?.id;

  const [publicUser, setPublicUser] = useState<any>(null);
  const [loadingPublic, setLoadingPublic] = useState(true);

  const activeProfileId = profileId || user?.id;

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
    }
  }, [activeProfileId]);

  const displayUser = isOwnProfile ? { ...user, ...publicUser } : publicUser;
  const displayPosts = publicUser?.posts || (isOwnProfile ? posts : []);

  const [editName, setEditName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatarUrl || '');
  const [editCoverUrl, setEditCoverUrl] = useState(user?.coverUrl || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editLocation, setEditLocation] = useState(user?.location || '');
  const [editDesignation, setEditDesignation] = useState(user?.designation || '');
  const [editEducation, setEditEducation] = useState(user?.education || '');
  const [editHobbies, setEditHobbies] = useState(user?.hobbies || '');
  const [editDob, setEditDob] = useState(user?.dob || '');
  const [followers, setFollowers] = useState(user?.followers || 1000);
  const [following, setFollowing] = useState(user?.following || 486);
  
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'photos'>('posts');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [showCommentsFor, setShowCommentsFor] = useState<Record<string, boolean>>({});

  const handleToggleLike = async (postId: string) => {
    if (!user || !activeProfileId) return;
    await toggleReaction(activeProfileId, postId, user.id, '❤️');
  };

  const handlePostComment = async (postId: string) => {
    if (!user || !activeProfileId) return;
    const text = commentText[postId]?.trim();
    if (!text) return;
    await addComment(activeProfileId, postId, user.id, text);
    setCommentText(prev => ({ ...prev, [postId]: '' }));
  };

  const handleToggleFollow = async () => {
     if (!user || !displayUser?.id) return;
     const isFollowing = displayUser.followersCount?.includes(user.id);
     await toggleFollow(user.id, displayUser.id, isFollowing);
  };
  
  const [showEditModal, setShowEditModal] = useState(false);
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
    updateProfile({ 
      name: editName, 
      avatarUrl: avatar, 
      coverUrl: editCoverUrl, 
      bio: editBio, 
      location: editLocation,
      designation: editDesignation,
      education: editEducation,
      hobbies: editHobbies,
      dob: editDob,
      followers: followers,
      following: following
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

  const compressImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
             if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
             }
          } else {
             if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
             }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.5));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
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

  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 500, 500);
      setPostImage(compressed);
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
    const url = 'https://hisab-rokkhok-xi.vercel.app';
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
      return <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div></div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto bg-white dark:bg-slate-900 min-h-screen">
       {/* Top Bar for Back button if looking at other profile */}
       {!isOwnProfile && onBack && (
           <div className="flex items-center p-4 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-20 border-b border-slate-100 dark:border-slate-800">
               <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-800 dark:text-white">
                   <ArrowLeft className="w-5 h-5" />
               </button>
               <h1 className="ml-2 font-bold text-lg text-slate-900 dark:text-white">{displayUser?.name || 'Profile'}</h1>
           </div>
       )}

      {/* Cover and Avatar Section */}
      <div className="bg-white dark:bg-slate-900 pb-4">
        <div className="relative h-48 sm:h-64 bg-slate-200 dark:bg-slate-700">
          {displayUser?.coverUrl ? (
             <img src={displayUser.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-gradient-to-r from-rose-400 to-orange-500"></div>
          )}
          {isOwnProfile && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-md text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition"
              >
                <Camera className="w-5 h-5" />
              </button>
          )}
        </div>
        
        <div className="px-4 sm:px-6">
          <div className="relative flex justify-start -mt-16 sm:-mt-20 mb-3">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900 overflow-hidden flex items-center justify-center shadow-sm">
                 {displayUser?.avatarUrl ? (
                   <img src={displayUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{displayUser?.name?.charAt(0) || 'U'}</span>
                 )}
              </div>
              {isOwnProfile && (
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="absolute bottom-2 right-2 bg-slate-200 dark:bg-slate-700 p-2 rounded-full border-2 border-white dark:border-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{displayUser?.name || 'User'}</h2>
            {displayUser?.username && <p className="text-sm font-medium text-slate-500">@{displayUser.username}</p>}
            {displayUser?.designation && <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{displayUser.designation}</p>}
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
              <button 
                onClick={() => displayUser?.followersCount?.length > 0 && setShowFollowersModal(true)} 
                className="hover:text-slate-900 dark:hover:text-slate-200 transition"
              >
                {displayUser?.followersCount?.length || 0} followers
              </button>
              <span>•</span>
              <button 
                onClick={() => displayUser?.followingCount?.length > 0 && setShowFollowingModal(true)} 
                className="hover:text-slate-900 dark:hover:text-slate-200 transition"
              >
                {displayUser?.followingCount?.length || 0} following
              </button>
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            {displayUser?.bio && <p className="text-slate-800 dark:text-slate-200">{displayUser.bio}</p>}
          </div>

          <div className="mt-6 flex gap-3">
             {isOwnProfile ? (
                 <>
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Dashboard
                    </button>
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <div className="w-5 h-5 flex items-center justify-center text-lg leading-none mb-0.5">+</div>
                      Edit profile
                    </button>
                 </>
             ) : (
                 <>
                    <button onClick={handleToggleFollow} className={`flex-1 py-2 rounded-lg font-semibold transition shadow-sm ${displayUser?.followersCount?.includes(user?.id) ? 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                       {displayUser?.followersCount?.includes(user?.id) ? 'আনফোলো করুন' : 'ফোলো করুন'}
                    </button>
                    <button onClick={onBack} className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold transition">মেসেজ দিন</button>
                 </>
             )}
          </div>

          <div className="mt-6 border-b border-slate-200 dark:border-slate-800 flex gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`pb-3 transition ${activeTab === 'posts' ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
            >Posts</button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`pb-3 transition ${activeTab === 'about' ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
            >About</button>
            <button 
              onClick={() => setActiveTab('photos')}
              className={`pb-3 transition ${activeTab === 'photos' ? 'border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'hover:text-slate-800 dark:hover:text-slate-200'}`}
            >Photos</button>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-white dark:bg-slate-900 px-4 sm:px-6 space-y-6 hidden sm:block">
        {/* We can hide this on very small mobile, but let's keep it visible since it's the requested ui */}
      </div>

      {activeTab === 'about' && (
      <div className="px-4 sm:px-6 space-y-6">
        {/* Personal details */}
        <div>
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal details</h3>
             {isOwnProfile && <button onClick={() => setShowEditModal(true)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><Camera className="w-5 h-5"/></button>}
           </div>
           <div className="space-y-4">
             {displayUser?.location && (
               <div className="flex gap-4 items-start">
                 <MapPin className="w-6 h-6 text-slate-500 mt-0.5" />
                 <span className="text-slate-800 dark:text-slate-200 text-lg">{displayUser.location}</span>
               </div>
             )}
             {displayUser?.dob && (
               <div className="flex gap-4 items-start">
                 <svg className="w-6 h-6 text-slate-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>
                 <span className="text-slate-800 dark:text-slate-200 text-lg">{displayUser.dob}</span>
               </div>
             )}
           </div>
        </div>

        {/* Education */}
        {displayUser?.education && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Education</h3>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                 <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{displayUser?.education}</p>
              </div>
            </div>
          </div>
        )}

        {/* Hobbies */}
        {displayUser?.hobbies && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hobbies</h3>
            </div>
            <div className="flex gap-4 items-start">
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              <p className="text-lg text-slate-900 dark:text-white font-medium">{displayUser.hobbies}</p>
            </div>
          </div>
        )}
      </div>
      )}

      {activeTab === 'posts' && (
        <div className="px-0 sm:px-0 space-y-6">
      {/* Create Post Section */}
      {isOwnProfile && (
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 overflow-hidden flex items-center justify-center">
                 {displayUser?.avatarUrl ? (
                   <img src={displayUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="font-bold text-blue-600 dark:text-blue-400">{displayUser?.name?.charAt(0) || 'U'}</span>
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
      )}

      {/* Posts Timeline */}
      {displayPosts && displayPosts.length > 0 && (
        <div className="space-y-4">
          {displayPosts.map((post: any) => (
            <Card key={post.id}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 overflow-hidden flex items-center justify-center">
                       {displayUser?.avatarUrl ? (
                         <img src={displayUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                       ) : (
                         <span className="font-bold text-blue-600 dark:text-blue-400">{displayUser?.name?.charAt(0) || 'U'}</span>
                       )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{displayUser?.name || 'User'}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  {isOwnProfile && (
                     <button 
                       onClick={() => deletePost(post.id)}
                       className="text-slate-400 hover:text-rose-500 transition p-2"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  )}
                </div>
                
                {post.content && (
                  <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{post.content}</p>
                )}
                
                {post.imageUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 mt-3">
                    <img src={post.imageUrl} alt="Post" className="w-full h-auto max-h-96 object-cover" />
                  </div>
                )}
                
                {/* Interactions */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3">
                    {post.reactions && Object.keys(post.reactions).length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3 px-2">
                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full shadow-sm text-xs border border-white dark:border-slate-700">❤️</span>
                            <span>{Object.keys(post.reactions).length}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => handleToggleLike(post.id)}
                            className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl transition font-semibold ${user && post.reactions?.[user.id] ? 'text-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        >
                            <Heart className={`w-5 h-5 ${user && post.reactions?.[user.id] ? 'fill-current' : ''}`} />
                            <span>Like</span>
                        </button>
                        <button 
                            onClick={() => setShowCommentsFor(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                            className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-xl transition font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span>Comment {post.comments?.length ? `(${post.comments.length})` : ''}</span>
                        </button>
                    </div>

                    {showCommentsFor[post.id] && (
                        <div className="mt-4 space-y-3">
                            <div className="flex gap-2">
                                <input 
                                   type="text"
                                   placeholder="মন্তব্য লিখুন..."
                                   value={commentText[post.id] || ''}
                                   onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                   className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2 border-none outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-sm"
                                />
                                <button
                                   onClick={() => handlePostComment(post.id)}
                                   disabled={!commentText[post.id]?.trim()}
                                   className="bg-blue-600 text-white p-2.5 rounded-xl disabled:opacity-50"
                                >
                                   <Send className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {post.comments && post.comments.length > 0 && (
                                <div className="space-y-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    {post.comments.map((comment: any) => (
                                        <div key={comment.id} className="flex gap-2 text-sm">
                                            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-2">
                                                <span className="font-semibold block text-slate-900 dark:text-white text-[13px] mb-0.5">{comment.userId === user?.id ? (user?.name) : 'User'}</span>
                                                <p className="text-slate-700 dark:text-slate-300">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
      )}

      {activeTab === 'photos' && (
        <div className="grid grid-cols-3 gap-1 sm:gap-2">
          {displayPosts?.filter((p: any) => p.imageUrl).length === 0 ? (
             <div className="col-span-3 text-center py-12 text-slate-500">
               <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
               <p>কোনো ফটো নেই</p>
             </div>
          ) : (
            displayPosts?.filter((p: any) => p.imageUrl).map((post: any) => (
              <div key={post.id} className="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden relative cursor-pointer group">
                <img src={post.imageUrl} alt="User Upload" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              </div>
            ))
          )}
        </div>
      )}

      {isOwnProfile && (
        <>
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

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <Key className="w-5 h-5" />
              পাসওয়ার্ড পরিবর্তন করুন
            </button>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-2xl font-bold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition border border-rose-100 dark:border-rose-900/50"
            >
              <LogOut className="w-5 h-5" />
              লগআউট করুন
            </button>
          </div>
        </>
      )}

      {/* Follow / Following Modals */}
      {showFollowersModal && (
        <UserListModal 
          userIds={displayUser?.followersCount || []}
          title="Followers"
          onClose={() => setShowFollowersModal(false)}
          onUserClick={(uid) => {
             setShowFollowersModal(false);
             onViewProfile?.(uid);
          }}
        />
      )}
      
      {showFollowingModal && (
        <UserListModal 
          userIds={displayUser?.followingCount || []}
          title="Following"
          onClose={() => setShowFollowingModal(false)}
          onUserClick={(uid) => {
             setShowFollowingModal(false);
             onViewProfile?.(uid);
          }}
        />
      )}
      
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[150] flex flex-col justify-end sm:items-center sm:justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl overflow-hidden w-full max-w-lg shadow-xl animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Edit Profile
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-600 transition outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <form id="editProfileForm" onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col items-center space-y-4 mb-4">
                    <div className="w-full space-y-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Cover Photo</p>
                      <div className="h-32 w-full rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center relative overflow-hidden">
                        {editCoverUrl ? <img src={editCoverUrl} alt="Cover" className="w-full h-full object-cover" /> : <span className="text-sm text-slate-500">No cover photo</span>}
                        <label className="absolute bottom-2 right-2 bg-slate-800 text-white rounded-full p-2 cursor-pointer shadow-md hover:bg-slate-900">
                          <Camera className="w-4 h-4" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageUpload} />
                        </label>
                      </div>
                    </div>
                    <div className="w-full space-y-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Profile Picture</p>
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                            {avatar ? (
                              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{editName.charAt(0) || 'U'}</span>
                            )}
                          </div>
                          <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 shadow-md">
                            <Camera className="w-4 h-4 text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Name"
                      className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none"
                    />
                    <input 
                      type="text" 
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      placeholder="Designation (e.g. Digital creator)"
                      className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none"
                    />
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Bio"
                      className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none resize-none"
                      rows={2}
                    />
                    <input 
                      type="text" 
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Location"
                      className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none"
                    />
                    <input 
                      type="text" 
                      value={editEducation}
                      onChange={(e) => setEditEducation(e.target.value)}
                      placeholder="Education (e.g. Syed Abul Hossain College)"
                      className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none"
                    />
                    <input 
                      type="text" 
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      placeholder="Date of Birth"
                      className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none"
                    />
                    <input 
                      type="text" 
                      value={editHobbies}
                      onChange={(e) => setEditHobbies(e.target.value)}
                      placeholder="Hobbies (e.g. Web Development · Cricket)"
                      className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/50 dark:text-white outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                  <button 
                    type="button" 
                    onClick={() => { setShowEditModal(false); setShowPasswordModal(true); }}
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                  >
                    <Key className="w-4 h-4" />
                    Change Password
                  </button>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
               <button form="editProfileForm" type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
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
