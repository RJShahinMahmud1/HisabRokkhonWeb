import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import { subscribeToNotifications, markNotificationRead } from '../../lib/socialService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Bell, Heart, MessageSquare, UserPlus } from 'lucide-react';

export function NotificationsView() {
  const { user, lang } = useAppStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  const t = {
    title: lang === 'hi' ? 'सूचनाएं' : lang === 'bn' ? 'বিজ্ঞপ্তি (Notifications)' : 'Notifications',
    like: lang === 'hi' ? 'ने आपके पोस्ट को पसंद किया' : lang === 'bn' ? 'আপনার পোস্টে লাইক দিয়েছেন' : 'liked your post',
    comment: lang === 'hi' ? 'ने आपके पोस्ट पर टिप्पणी की' : lang === 'bn' ? 'আপনার পোস্টে কমেন্ট করেছেন' : 'commented on your post',
    follow: lang === 'hi' ? 'ने आपका अनुसरण करना शुरू किया' : lang === 'bn' ? 'আপনাকে ফলো করেছেন' : 'started following you',
    empty: lang === 'hi' ? 'कोई सूचना नहीं' : lang === 'bn' ? 'কোনো নোটিফিকেশন নেই' : 'No notifications',
  };

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.id, (notifs) => {
      setNotifications(notifs);

      // fetch missing profiles
      notifs.forEach(n => {
        if (!profiles[n.senderId]) {
          getDoc(doc(db, 'publicProfiles', n.senderId)).then(snap => {
            if (snap.exists()) {
              setProfiles(prev => ({ ...prev, [n.senderId]: snap.data() }));
            }
          });
        }
      });
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="p-4 bg-white dark:bg-slate-950 min-h-full">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t.title}</h2>
      <div className="space-y-3">
        {notifications.map(n => {
          const profile = profiles[n.senderId];
          const isRead = n.read;
          const timeStr = n.createdAt ? new Date(n.createdAt.toMillis()).toLocaleString(lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

          let icon = <Bell className="w-5 h-5 text-blue-500" />;
          let text = '';
          if (n.type === 'like') {
            icon = <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
            text = t.like;
          } else if (n.type === 'comment') {
            icon = <MessageSquare className="w-5 h-5 text-blue-500" />;
            text = t.comment;
          } else if (n.type === 'follow') {
            icon = <UserPlus className="w-5 h-5 text-green-500" />;
            text = t.follow;
          }

          return (
            <div 
              key={n.id} 
              onClick={() => { if (!isRead) markNotificationRead(n.id); }}
              className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition ${isRead ? 'bg-slate-50 dark:bg-slate-900/40' : 'bg-blue-50 dark:bg-blue-900/30'}`}
            >
               <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                     {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{profile?.name?.[0]}</div>}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-950 rounded-full p-1 border-2 border-white dark:border-slate-950">
                     {icon}
                  </div>
               </div>
               <div className="flex-1">
                  <p className="text-sm text-slate-800 dark:text-gray-200">
                     <span className="font-bold">{profile?.name || 'User'}</span> {text}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{timeStr}</p>
               </div>
            </div>
          );
        })}
        {notifications.length === 0 && <div className="text-center py-10 text-slate-500">{t.empty}</div>}
      </div>
    </div>
  );
}
