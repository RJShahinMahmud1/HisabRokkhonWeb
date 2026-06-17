import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import { getDoc, doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { toggleFollow } from '../../lib/socialService';
import { Users, UserPlus, UserCheck } from 'lucide-react';

export function FollowersView() {
  const { user, lang } = useAppStore();
  const [activeTab, setActiveTab] = useState<'followers' | 'following' | 'discover'>('discover');
  const [profileData, setProfileData] = useState<any>(null);
  const [userList, setUserList] = useState<any[]>([]);

  const t = {
    followers: lang === 'hi' ? 'अनुयायी' : lang === 'bn' ? 'ফলোয়ার' : 'Followers',
    following: lang === 'hi' ? 'अनुसरण कर रहे हैं' : lang === 'bn' ? 'ফলোয়িং' : 'Following',
    discover: lang === 'hi' ? 'खोजें' : lang === 'bn' ? 'খুঁজুন' : 'Discover',
    noUsers: lang === 'hi' ? 'कुछ नहीं मिला' : lang === 'bn' ? 'কিছু পাওয়া যায়নি' : 'No users found',
    follow: lang === 'hi' ? 'अनुसरण करें' : lang === 'bn' ? 'ফলো করুন' : 'Follow',
    followingBtn: lang === 'hi' ? 'अनुसरण कर रहे हैं' : lang === 'bn' ? 'ফলোয়িং' : 'Following',
  };

  const fetchProfile = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, 'publicProfiles', user.id));
    if (snap.exists()) {
      setProfileData(snap.data());
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!profileData && activeTab !== 'discover') return;
    
    const fetchUsers = async () => {
      if (activeTab === 'discover') {
         const snap = await getDocs(collection(db, 'publicProfiles'));
         const allUsers: any[] = [];
         snap.forEach(d => {
             if (d.id !== user?.id) {
                 allUsers.push({ id: d.id, ...d.data() });
             }
         });
         // optionally filter out already following
         setUserList(allUsers);
      } else {
          const list = activeTab === 'followers' ? profileData?.followersCount || [] : profileData?.followingCount || [];
          const fetched: any[] = [];
          for (const uid of list) {
            const snap = await getDoc(doc(db, 'publicProfiles', uid));
            if (snap.exists()) {
              fetched.push({ id: uid, ...snap.data() });
            }
          }
          setUserList(fetched);
      }
    };
    fetchUsers();
  }, [profileData, activeTab]);

  const handleToggleFollow = async (targetId: string) => {
    if (!user) return;
    await toggleFollow(user.id, targetId);
    await fetchProfile(); // refresh data
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-950 min-h-full">
      <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 mb-6 overflow-x-auto hide-scrollbar">
         <button onClick={() => setActiveTab('discover')} className={`flex-1 min-w-[100px] py-2 px-3 rounded-md font-semibold text-sm transition ${activeTab === 'discover' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>
            {t.discover}
         </button>
         <button onClick={() => setActiveTab('followers')} className={`flex-1 min-w-[100px] py-2 px-3 rounded-md font-semibold text-sm transition ${activeTab === 'followers' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>
            {t.followers} ({profileData?.followersCount?.length || 0})
         </button>
         <button onClick={() => setActiveTab('following')} className={`flex-1 min-w-[100px] py-2 px-3 rounded-md font-semibold text-sm transition ${activeTab === 'following' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>
            {t.following} ({profileData?.followingCount?.length || 0})
         </button>
      </div>

      <div className="space-y-4">
         {userList.map(u => {
           const isFollowing = profileData?.followingCount?.includes(u.id);

           return (
             <div key={u.id} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                      {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover"/> : <Users className="w-6 h-6 text-slate-400 m-3" />}
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{u.name}</h4>
                      <p className="text-xs text-slate-500">{u.designation || 'No designation'}</p>
                   </div>
                </div>
                
                <button 
                  onClick={() => handleToggleFollow(u.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${isFollowing ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}
                >
                  {isFollowing ? (
                    <><UserCheck className="w-4 h-4" /> {t.followingBtn}</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> {t.follow}</>
                  )}
                </button>
             </div>
           );
         })}
         {userList.length === 0 && <div className="text-center py-10 text-slate-500 font-medium">{t.noUsers}</div>}
      </div>
    </div>
  );
}
