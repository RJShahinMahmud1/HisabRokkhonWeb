import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { useAppStore } from '../store';

interface ReactionUser {
  userId: string;
  reactionType: 'like' | 'love' | 'wow' | 'haha' | 'angry';
  name?: string;
  avatarUrl?: string;
  username?: string;
}

interface ReactionsListModalProps {
  postId: string;
  onClose: () => void;
  onUserClick?: (userId: string) => void;
}

export function ReactionsListModal({ postId, onClose, onUserClick }: ReactionsListModalProps) {
  const { lang } = useAppStore();
  const [reactions, setReactions] = useState<ReactionUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'userReactions'));
        const activeList: { userId: string; reactionType: string }[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data[postId]) {
            activeList.push({
              userId: docSnap.id,
              reactionType: data[postId],
            });
          }
        });

        const fullList = await Promise.all(
          activeList.map(async (item) => {
            try {
              const profileSnap = await getDoc(doc(db, 'publicProfiles', item.userId));
              if (profileSnap.exists()) {
                const profileData = profileSnap.data();
                return {
                  userId: item.userId,
                  reactionType: item.reactionType as any,
                  name: profileData.name || 'User',
                  avatarUrl: profileData.avatarUrl,
                  username: profileData.username,
                };
              }
            } catch (err) {
              console.error('Error fetching reactions user profile', item.userId, err);
            }
            return {
              userId: item.userId,
              reactionType: item.reactionType as any,
              name: 'User',
            };
          })
        );

        setReactions(fullList);
      } catch (error) {
        console.error('Error loading reactions list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReactions();
  }, [postId]);

  // Compute reaction counts
  const counts = {
    all: reactions.length,
    like: reactions.filter((r) => r.reactionType === 'like').length,
    love: reactions.filter((r) => r.reactionType === 'love').length,
    wow: reactions.filter((r) => r.reactionType === 'wow').length,
    haha: reactions.filter((r) => r.reactionType === 'haha').length,
    angry: reactions.filter((r) => r.reactionType === 'angry').length,
  };

  const reactionTabs = [
    { id: 'all', count: counts.all, emoji: null, label: lang === 'bn' ? 'সব' : 'All' },
    { id: 'like', count: counts.like, emoji: '👍', label: '' },
    { id: 'love', count: counts.love, emoji: '❤️', label: '' },
    { id: 'wow', count: counts.wow, emoji: '😲', label: '' },
    { id: 'haha', count: counts.haha, emoji: '😂', label: '' },
    { id: 'angry', count: counts.angry, emoji: '😡', label: '' },
  ].filter((t) => t.id === 'all' || t.count > 0);

  // Filter items by type
  const displayedReactions = reactions.filter(
    (r) => activeTab === 'all' || r.reactionType === activeTab
  );

  const getEmojiForType = (type: string) => {
    switch (type) {
      case 'like':
        return '👍';
      case 'love':
        return '❤️';
      case 'wow':
        return '😲';
      case 'haha':
        return '😂';
      case 'angry':
        return '😡';
      default:
        return '👍';
    }
  };

  const getBadgeBg = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-blue-600 text-white';
      case 'love':
        return 'bg-rose-500 text-white';
      case 'wow':
        return 'bg-amber-400';
      case 'haha':
        return 'bg-amber-400';
      case 'angry':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center md:p-4">
      <div className="bg-white dark:bg-slate-950 w-full h-full md:max-h-[85vh] md:max-w-md md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header with back icon and title */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition text-slate-800 dark:text-slate-200"
            id="reaction_modal_back_btn"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'রিয়্যাক্ট করেছেন যারা' : 'People who reacted'}
          </h2>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-x-auto scrollbar-none shrink-0 px-2 select-none">
          {reactionTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-3 px-4 border-b-2 font-bold text-sm transition-all shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
                id={`reaction_tab_${tab.id}`}
              >
                {tab.emoji && <span className="text-lg">{tab.emoji}</span>}
                <span>
                  {tab.id === 'all' ? `${tab.label} ` : ''}
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
              </p>
            </div>
          ) : displayedReactions.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-20 font-medium">
              {lang === 'bn' ? 'কেউ রিয়্যাক্ট করেনি এখনও' : 'No reactions yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {displayedReactions.map((reaction) => (
                <div
                  key={reaction.userId}
                  onClick={() => {
                    onUserClick?.(reaction.userId);
                    onClose();
                  }}
                  className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-all active:scale-[0.98] select-none"
                  id={`reacted_user_row_${reaction.userId}`}
                >
                  {/* User Profile Avatar with corner Reaction Badge */}
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                      {reaction.avatarUrl ? (
                        <img
                          src={reaction.avatarUrl}
                          alt={reaction.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                          <UserIcon className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                    </div>
                    {/* Tiny Reaction Symbol Badge pinned to bottom-right edge */}
                    <div
                      className={`absolute bottom-0 right-0 w-5.5 h-5.5 rounded-full flex items-center justify-center text-xs border-2 border-white dark:border-slate-950 shadow-md ${getBadgeBg(
                        reaction.reactionType
                      )}`}
                    >
                      <span>{getEmojiForType(reaction.reactionType)}</span>
                    </div>
                  </div>

                  {/* Name Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {reaction.name}
                    </h4>
                    {reaction.username && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                        @{reaction.username}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
