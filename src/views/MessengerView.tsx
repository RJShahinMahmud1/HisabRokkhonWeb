import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Search, Send, User as UserIcon, ArrowLeft, Check, CheckCheck, MessageCircle, MoreVertical } from 'lucide-react';
import { 
  subscribeToConversations, 
  subscribeToMessages, 
  subscribeToAllUsers,
  getOrCreateConversation, 
  sendMessage, 
  markMessagesAsSeen, 
  setTypingStatus, 
  updateUserPresence,
  Conversation,
  Message,
  PublicProfile
} from '../lib/chatService';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function MessengerView({ onBack, onViewProfile }: { onBack: () => void, onViewProfile?: (uid: string) => void }) {
  const { user, lang, isDark } = useAppStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, PublicProfile>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');
  
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Global presence effect
  useEffect(() => {
    if (!user) return;
    updateUserPresence(user.id, true);
    
    const handleBeforeUnload = () => {
        updateUserPresence(user.id, false);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
        updateUserPresence(user.id, false);
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.id, setConversations);
    return () => unsub();
  }, [user]);

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show notification for new unread messages
  const prevUnreadRef = useRef<Record<string, number>>({});
  useEffect(() => {
    if (!user || !('Notification' in window) || Notification.permission !== 'granted') return;
    
    conversations.forEach(c => {
      const currentUnread = c.unreadCount?.[user.id] || 0;
      const prevUnread = prevUnreadRef.current[c.id] || 0;
      
      if (currentUnread > prevUnread && c.id !== activeConvId) {
        // Find other user name
        const otherPid = c.participants.find(p => p !== user.id);
        const name = otherPid && profiles[otherPid] ? profiles[otherPid].name : 'Someone';
        
        const notif = new Notification(`New message from ${name}`, {
          body: c.lastMessageText || 'Sent a new message',
        });
        
        notif.onclick = () => {
          window.focus();
          setActiveConvId(c.id);
        };
      }
      
      prevUnreadRef.current[c.id] = currentUnread;
    });
  }, [conversations, user, activeConvId, profiles]);

  // Sync profiles for all participants in conversations
  useEffect(() => {
    const unsubs: (() => void)[] = [];
    const neededUids = new Set<string>();
    
    conversations.forEach(c => {
      c.participants.forEach(p => {
        if (!profiles[p]) neededUids.add(p);
      });
    });
    
    neededUids.forEach(uid => {
      const unsub = onSnapshot(doc(db, 'publicProfiles', uid), (snap) => {
        if(snap.exists()) {
           setProfiles(prev => ({...prev, [uid]: {uid, ...snap.data()} as PublicProfile}));
        }
      }, (error) => {});
      unsubs.push(unsub);
    });
    
    return () => unsubs.forEach(u => u());
  }, [conversations]);

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConvId || !user) return;
    const unsub = subscribeToMessages(activeConvId, (msgs) => {
        setMessages(msgs);
        markMessagesAsSeen(activeConvId, user.id, msgs);
    });
    return () => unsub();
  }, [activeConvId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // Real-time all users / search
  useEffect(() => {
    if (!user) return;
    
    // Subscribe to all users real-time to get created/deleted users immediately
    const unsub = subscribeToAllUsers(user.id, (users) => {
        if (!searchTerm) {
            setSearchResults(users);
        } else {
            const lowerTerm = searchTerm.toLowerCase();
            setSearchResults(users.filter(p => 
                (p.name?.toLowerCase().includes(lowerTerm) || p.email?.toLowerCase().includes(lowerTerm) || p.username?.toLowerCase().includes(lowerTerm))
            ));
        }
    });
    
    return () => unsub();
  }, [searchTerm, user]);

  const handleSelectUser = async (otherUid: string) => {
    if(!user) return;
    const convId = await getOrCreateConversation(user.id, otherUid);
    setActiveConvId(convId);
    setSearchTerm('');
    setActiveTab('chats');
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const otherUserId = activeConv?.participants.find(p => p !== user?.id);
  const otherProfile = otherUserId ? profiles[otherUserId] : null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConvId || !user || !otherUserId) return;
    
    const msgText = text.trim();
    setText('');
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTypingStatus(activeConvId, user.id, false);
    setIsTyping(false);
    
    await sendMessage(activeConvId, user.id, otherUserId, msgText);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!activeConvId || !user) return;
    
    if (!isTyping) {
        setIsTyping(true);
        setTypingStatus(activeConvId, user.id, true);
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setTypingStatus(activeConvId, user.id, false);
    }, 2000);
  };

  const formatTime = (ts: any) => {
      if(!ts) return '';
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex h-[calc(100vh-2rem)] pb-24 overflow-hidden rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'} shadow-xl`}>
      {/* LEFT SIDEBAR - List */}
      <div className={`w-full md:w-80 border-r ${isDark ? 'border-slate-800' : 'border-slate-200'} flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
        
        <div className={`p-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'} flex items-center gap-3`}>
          <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition md:hidden">
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Chats</h2>
        </div>

        <div className="p-3 pb-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-full text-sm outline-none ${isDark ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-slate-100 text-slate-900 placeholder-slate-400'} focus:ring-2 focus:ring-blue-500/50`}
            />
          </div>
          
          {!searchTerm && (
            <div className="flex mt-3 gap-2">
               <button onClick={() => setActiveTab('chats')} className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition ${activeTab === 'chats' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>Chats</button>
               <button onClick={() => setActiveTab('users')} className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition ${activeTab === 'users' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>All Users</button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto mt-2">
            {searchTerm || activeTab === 'users' ? (
                <div className="px-2">
                    {searchResults.map(p => (
                        <div key={p.uid} onClick={() => handleSelectUser(p.uid)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-50'}`}>
                           <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                               {p.avatarUrl ? <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{p.name?.[0]}</div>}
                           </div>
                           <div>
                               <p className="font-semibold text-slate-900 dark:text-white text-sm">{p.name || 'Unknown'}</p>
                               {p.username && <p className="text-xs text-slate-500">@{p.username}</p>}
                           </div>
                        </div>
                    ))}
                    {searchResults.length === 0 && <p className="text-center text-sm text-slate-500 mt-4">No users found</p>}
                </div>
            ) : (
                <div className="px-2 space-y-1">
                    {conversations.map(c => {
                        const otherPid = c.participants.find(p => p !== user?.id);
                        const profile = otherPid ? profiles[otherPid] : null;
                        const unread = (user?.id && c.unreadCount?.[user.id] > 0) ? c.unreadCount[user.id] : 0;
                        const otherIsTyping = otherPid ? c.typingUsers?.[otherPid] : false;

                        return (
                           <div key={c.id} onClick={() => setActiveConvId(c.id)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${activeConvId === c.id ? (isDark ? 'bg-blue-900/30' : 'bg-blue-50') : (isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-50')}`}>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                                        {profile?.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{profile?.name?.[0]}</div>}
                                    </div>
                                    {profile?.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full"></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">{profile?.name || 'Unknown User'}</h3>
                                        {c.lastMessageTime && <span className="text-xs text-slate-500">{formatTime(c.lastMessageTime)}</span>}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-sm truncate ${unread > 0 ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                            {otherIsTyping ? <span className="text-blue-500 italic">Typing...</span> : c.lastMessageText || 'No messages yet'}
                                        </p>
                                        {unread > 0 && (
                                            <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 ml-2">
                                                {unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                           </div>
                        )
                    })}
                </div>
            )}
        </div>
      </div>

      {/* RIGHT SIDEBAR - Chat Room */}
      <div className={`flex-1 flex flex-col ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
        {activeConvId && otherProfile ? (
            <>
                {/* Chat Header */}
                <div className={`px-4 lg:px-6 py-3 lg:py-4 border-b ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-white'} flex justify-between items-center z-10 shadow-sm backdrop-blur-md`}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveConvId(null)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden lg:hidden">
                            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                        </button>
                        <div 
                           className="flex items-center gap-3 cursor-pointer p-1 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                           onClick={() => onViewProfile && onViewProfile(otherProfile.uid)}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                                    {otherProfile.avatarUrl ? <img src={otherProfile.avatarUrl} alt={otherProfile.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{otherProfile.name?.[0]}</div>}
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{otherProfile.name}</h3>
                                    {otherProfile.username && <span className="text-xs text-slate-500 font-normal">@{otherProfile.username}</span>}
                                </div>
                                <p className="text-xs text-slate-500">
                                    {activeConv?.typingUsers?.[otherProfile.uid] ? (
                                        <span className="text-blue-500">Typing...</span>
                                    ) : (
                                        otherProfile.isOnline ? <span className="text-green-500">Active now</span> : 'Offline'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-[#0f172a]' : 'bg-[#F0F2F5]'}`}>
                    {messages.map((msg, idx) => {
                        const isMe = msg.senderId === user?.id;
                        const showAvatar = !isMe && (idx === messages.length - 1 || messages[idx + 1]?.senderId !== msg.senderId);
                        
                        return (
                            <div key={msg.id} className={`flex gap-2 w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className="w-8 shrink-0 flex items-end">
                                        {showAvatar && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                                                {otherProfile.avatarUrl ? <img src={otherProfile.avatarUrl} alt="" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500">{otherProfile.name?.[0]}</div>}
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className={`flex flex-col max-w-[70%] lg:max-w-[60%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className={`px-4 py-2.5 shadow-sm text-[15px] ${isMe ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' : (isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900') + ' rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700'}`}>
                                        <p className="break-words">{msg.text}</p>
                                    </div>
                                    {isMe && (
                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                                            {formatTime(msg.createdAt)}
                                            {msg.status === 'sent' && <Check className="w-3 h-3" />}
                                            {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-slate-400" />}
                                            {msg.status === 'seen' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 border-t ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}>
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={text}
                            onChange={handleTextChange}
                            placeholder="Type a message..."
                            className={`flex-1 rounded-full px-4 py-2.5 outline-none ${isDark ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-slate-100 text-slate-900 placeholder-slate-500'} focus:ring-2 focus:ring-blue-500/50`}
                        />
                        <button type="submit" disabled={!text.trim()} className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 shrink-0">
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </>
        ) : (
            <div className={`flex-1 flex flex-col items-center justify-center text-center p-8 ${isDark ? 'bg-[#0f172a]' : 'bg-[#F0F2F5]'}`}>
                <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <MessageCircle className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Messenger</h3>
                <p className="text-slate-500 max-w-sm">Select a user from the left or search to start a new conversation.</p>
            </div>
        )}
      </div>
    </div>
  );
}
