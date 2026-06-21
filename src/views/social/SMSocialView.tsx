import React, { useState, useEffect } from 'react';
import { Home, Users, MessageCircle, Bell, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProfileView } from '../ProfileView';
import { MessengerView } from '../MessengerView';
import { NewsfeedView } from './NewsfeedView';
import { FollowersView } from './FollowersView';
import { NotificationsView } from './NotificationsView';
import { useAppStore } from '../../store';
import { subscribeToNotifications } from '../../lib/socialService';

export function SMSocialView({ initialProfileId, onViewProfile }: { initialProfileId?: string | null, onViewProfile?: (uid: string) => void }) {
  const [activeTab, setActiveTab] = useState<'newsfeed' | 'followers' | 'messages' | 'notifications' | 'profile'>('newsfeed');
  const { user } = useAppStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.id, (notifs) => {
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let unsub: (() => void) | null = null;
    let isMounted = true;
    import("firebase/firestore").then(
      ({ query, collection, where, onSnapshot }) => {
        import("../../lib/firebase").then(({ db }) => {
          if (!isMounted) return;
          unsub = onSnapshot(
            query(
              collection(db, "conversations"),
              where("participants", "array-contains", user.id),
            ),
            (snapshot) => {
              let unread = 0;
              snapshot.docs.forEach((doc) => {
                const data = doc.data();
                if (data.unreadCount && data.unreadCount[user.id] > 0) {
                  unread += data.unreadCount[user.id];
                }
              });
              setTotalUnreadMessages(unread);
            },
            (error) => {
              // Ignore silent errors
            },
          );
        });
      },
    );
    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, [user]);

  useEffect(() => {
    if (initialProfileId) {
      setActiveTab('profile');
    }
  }, [initialProfileId]);

  const handleSelectProfile = (uid: string) => {
    setActiveTab('profile');
    onViewProfile?.(uid);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden shadow-xl sm:rounded-2xl w-full">
      {/* Top Navigation Bar - FB Lite Style */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-950 px-2 py-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <button 
          onClick={() => setActiveTab('newsfeed')} 
          className={`flex-1 flex justify-center py-2 transition-colors ${activeTab === 'newsfeed' ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg'}`}
        >
          <Home className={`w-6 h-6 ${activeTab === 'newsfeed' ? 'fill-current' : ''}`} />
        </button>
        <button 
          onClick={() => setActiveTab('followers')} 
          className={`flex-1 flex justify-center py-2 transition-colors ${activeTab === 'followers' ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg'}`}
        >
          <Users className={`w-6 h-6 ${activeTab === 'followers' ? 'fill-current' : ''}`} />
        </button>
        <button 
          onClick={() => setActiveTab('messages')} 
          className={`flex-1 flex justify-center py-2 transition-colors relative ${activeTab === 'messages' ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg'}`}
        >
          <div className="relative">
            <MessageCircle className={`w-6 h-6 ${activeTab === 'messages' ? 'fill-current' : ''}`} />
            {totalUnreadMessages > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold border-2 border-white dark:border-slate-950">
                {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
              </span>
            )}
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('notifications')} 
          className={`flex-1 flex justify-center py-2 transition-colors relative ${activeTab === 'notifications' ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg'}`}
        >
          <div className="relative">
            <Bell className={`w-6 h-6 ${activeTab === 'notifications' ? 'fill-current' : ''}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold border-2 border-white dark:border-slate-950">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`flex-1 flex justify-center py-2 transition-colors ${activeTab === 'profile' ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg'}`}
        >
          <UserIcon className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-full relative overflow-x-hidden">
        <div className="max-w-2xl mx-auto w-full min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full min-h-full"
            >
              {activeTab === 'newsfeed' && <NewsfeedView onViewProfile={handleSelectProfile} />}
              {activeTab === 'followers' && <FollowersView onViewProfile={handleSelectProfile} />}
              {activeTab === 'messages' && <MessengerView onBack={() => setActiveTab('newsfeed')} onViewProfile={handleSelectProfile} />}
              {activeTab === 'notifications' && <NotificationsView onViewProfile={handleSelectProfile} />}
              {activeTab === 'profile' && <ProfileView profileId={initialProfileId} onBack={() => setActiveTab('newsfeed')} onViewProfile={handleSelectProfile} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
