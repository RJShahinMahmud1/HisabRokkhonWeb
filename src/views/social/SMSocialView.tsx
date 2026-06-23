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
      {/* Top Navigation Bar - Modern & Professional Style */}
      <div className="flex justify-center bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl shrink-0 z-10 sticky top-0 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between w-full max-w-lg px-4 py-2">
          {[
            { id: 'newsfeed', icon: Home },
            { id: 'followers', icon: Users },
            { id: 'messages', icon: MessageCircle, badge: totalUnreadMessages },
            { id: 'notifications', icon: Bell, badge: unreadCount },
            { id: 'profile', icon: UserIcon }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center justify-center p-3 rounded-2xl transition-colors duration-300 group outline-none ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="socialNavIndicator"
                    className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10">
                   <Icon 
                     className={`w-[26px] h-[26px] transition-transform duration-300 ${isActive ? 'fill-current scale-110' : 'scale-100 group-hover:scale-110 group-active:scale-95'}`} 
                     strokeWidth={isActive ? 2 : 1.75} 
                   />
                   {tab.badge ? (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-[4px] bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-white dark:border-[#0B1120] shadow-sm transform transition-all">
                        {tab.badge > 99 ? '99+' : tab.badge}
                      </span>
                   ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 w-full relative overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
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
