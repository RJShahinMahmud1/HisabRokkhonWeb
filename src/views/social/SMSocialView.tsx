import React, { useState, useEffect } from 'react';
import { Home, Users, MessageCircle, Bell, User as UserIcon } from 'lucide-react';
import { ProfileView } from '../ProfileView';
import { MessengerView } from '../MessengerView';
import { NewsfeedView } from './NewsfeedView';
import { FollowersView } from './FollowersView';
import { NotificationsView } from './NotificationsView';

export function SMSocialView({ initialProfileId, onViewProfile }: { initialProfileId?: string | null, onViewProfile?: (uid: string) => void }) {
  const [activeTab, setActiveTab] = useState<'newsfeed' | 'followers' | 'notifications' | 'profile'>('newsfeed');

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
          onClick={() => setActiveTab('notifications')} 
          className={`flex-1 flex justify-center py-2 transition-colors ${activeTab === 'notifications' ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg'}`}
        >
          <Bell className={`w-6 h-6 ${activeTab === 'notifications' ? 'fill-current' : ''}`} />
        </button>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`flex-1 flex justify-center py-2 transition-colors ${activeTab === 'profile' ? 'text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg'}`}
        >
          <UserIcon className={`w-6 h-6 ${activeTab === 'profile' ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-2xl mx-auto w-full min-h-full">
            {activeTab === 'newsfeed' && <NewsfeedView onViewProfile={handleSelectProfile} />}
            {activeTab === 'followers' && <FollowersView onViewProfile={handleSelectProfile} />}
            {activeTab === 'notifications' && <NotificationsView onViewProfile={handleSelectProfile} />}
            {activeTab === 'profile' && <ProfileView profileId={initialProfileId} onBack={() => setActiveTab('newsfeed')} onViewProfile={handleSelectProfile} />}
        </div>
      </div>
    </div>
  );
}
