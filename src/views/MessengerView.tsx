import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { Search, Send, User as UserIcon, ArrowLeft, Check, CheckCheck, MessageCircle, MoreVertical, MoreHorizontal, Edit3, Trash2, Smile, X, MessageSquareOff, CornerUpLeft, Image as ImageIcon, Mic, Play, Pause, Square, Video, Phone } from 'lucide-react';
import { 
  subscribeToConversations, 
  subscribeToMessages, 
  subscribeToAllUsers,
  getOrCreateConversation, 
  sendMessage, 
  markMessagesAsSeen, 
  setTypingStatus, 
  updateUserPresence,
  editMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
  deleteConversationHistory,
  toggleMessageReaction,
  Conversation,
  Message,
  PublicProfile
} from '../lib/chatService';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { CallData, subscribeToIncomingCalls, startCall, updateCallStatus } from '../lib/callService';
import { CallScreen } from '../components/CallScreen';

function VoiceMessagePlayer({ src, duration: initialDuration, isMe }: { src: string, duration?: number, isMe: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.log("Audio play error", err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.MouseEvent, index: number, total: number) => {
    e.stopPropagation();
    if (!audioRef.current || duration === 0) return;
    const clickPercent = index / total;
    const newTime = clickPercent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatAudioDuration = (secs: number) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Waveform bars
  const waveformBars = [10, 16, 24, 14, 8, 20, 28, 16, 22, 12, 26, 18, 10, 16, 24, 14, 20, 12, 18, 8, 14, 22, 16, 10];

  return (
    <div className="flex items-center gap-3 py-1.5 px-1 min-w-[210px] md:min-w-[240px]">
      <button 
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all active:scale-90 hover:scale-105 shadow ${
          isMe 
            ? 'bg-white text-blue-600 hover:bg-slate-50' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex flex-col flex-1 gap-1">
        <div className="flex items-end gap-[3px] h-8 pt-1 select-none">
          {waveformBars.map((height, idx) => {
            const barProgress = (idx / waveformBars.length) * duration;
            const isPlayed = currentTime >= barProgress;
            return (
              <div 
                key={idx}
                onClick={(e) => handleSeek(e, idx, waveformBars.length)}
                style={{ height: `${(height / 30) * 100}%` }}
                className={`w-[3px] rounded-full cursor-pointer transition-colors duration-150 ${
                  isPlayed 
                    ? (isMe ? 'bg-white' : 'bg-blue-600 dark:bg-blue-400') 
                    : (isMe ? 'bg-blue-300/50' : 'bg-slate-200 dark:bg-slate-700')
                }`}
              />
            );
          })}
        </div>

        <div className={`flex justify-between text-[10px] font-semibold ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
          <span>{formatAudioDuration(currentTime)}</span>
          <span>{formatAudioDuration(duration)}</span>
        </div>
      </div>
    </div>
  );
}

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
  
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [showConvOptions, setShowConvOptions] = useState(false);
  const [messageMenuId, setMessageMenuId] = useState<string | null>(null);

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [micError, setMicError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingDurationRef = useRef<number>(0);

  // Calling states
  const [incomingCall, setIncomingCall] = useState<CallData | null>(null);
  const [activeCall, setActiveCall] = useState<{ call: CallData, isCaller: boolean } | null>(null);

  // Subscribe to incoming calls
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToIncomingCalls(user.id, (call) => {
       if (call.status === 'ringing') {
          setIncomingCall(call);
       } else if (call.status === 'ended' || call.status === 'missed' || call.status === 'rejected') {
          setIncomingCall(null);
       }
    });
    return () => unsub();
  }, [user]);

  const handleStartCall = async (type: 'audio' | 'video') => {
      if (!user || !activeConvId || !otherUserId) return;
      try {
         const callId = await startCall(activeConvId, user.id, otherUserId, type);
         setActiveCall({
             call: { id: callId, conversationId: activeConvId, callerId: user.id, calleeId: otherUserId, type, status: 'ringing', createdAt: new Date() },
             isCaller: true
         });
      } catch(e) {
         console.error('Call failed', e);
         alert(lang === 'bn' ? 'কল করতে সমস্যা হয়েছে!' : 'Failed to start call!');
      }
  };

  const handleAcceptCall = async () => {
      if (!incomingCall || !incomingCall.id) return;
      setActiveCall({ call: incomingCall, isCaller: false });
      setIncomingCall(null);
      // Status to connected will be handled by CallScreen when answer is generated
  };

  const handleRejectCall = async () => {
      if (!incomingCall || !incomingCall.id) return;
      await updateCallStatus(incomingCall.id, 'rejected');
      setIncomingCall(null);
  };


  if (user?.messagesDisabled) {
      return (
          <div className="flex h-full pb-24 items-center justify-center p-4">
               <div className="bg-orange-50 dark:bg-orange-900/20 p-8 rounded-3xl text-center max-w-sm border border-orange-200 dark:border-orange-900/30 shadow-xl">
                    <MessageSquareOff className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Messaging Disabled</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Your messaging capabilities have been temporarily disabled by an administrator.</p>
                    <button onClick={onBack} className="mt-6 text-orange-600 font-semibold text-sm">Go Back</button>
               </div>
          </div>
      );
  }

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

  const cancelEdit = () => {
      setEditingMsgId(null);
      setText('');
  };

  const handleEditClick = (msg: Message) => {
      setEditingMsgId(msg.id);
      setText(msg.text);
      setMessageMenuId(null);
  };

  const handleDeleteForMe = async (msg: Message) => {
      if(!user || !activeConvId) return;
      await deleteMessageForMe(activeConvId, msg.id, user.id, msg);
      setMessageMenuId(null);
  };

  const handleDeleteForEveryone = async (msg: Message) => {
      if(!activeConvId) return;
      await deleteMessageForEveryone(activeConvId, msg.id);
      setMessageMenuId(null);
  };

  const handleReaction = async (msg: Message, emoji: string) => {
      if(!user || !activeConvId) return;
      await toggleMessageReaction(activeConvId, msg.id, user.id, emoji, msg.reactions);
      setMessageMenuId(null);
  };

  const handleDeleteConvHistory = async () => {
      if(!user || !activeConvId || !activeConv) return;
      if (confirm('আপনি কি এই চ্যাট হিস্ট্রি ডিলিট করতে চান?')) {
          await deleteConversationHistory(activeConvId, user.id, activeConv);
          setActiveConvId(null);
          setShowConvOptions(false);
      }
  };

  const checkCanEdit = (msg: Message) => {
      if (msg.senderId !== user?.id) return false;
      if (msg.isDeletedForEveryone) return false;
      
      const msgTime = msg.createdAt?.toMillis ? msg.createdAt.toMillis() : Date.now();
      const now = Date.now();
      const diffMins = (now - msgTime) / (1000 * 60);
      
      if (msg.status === 'seen') {
          return diffMins <= 5;
      } else {
          return diffMins <= 15;
      }
  };

  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 800;
            if (width > maxDim || height > maxDim) {
                if (width > height) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                setSelectedImage(compressedBase64);
            }
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !user || !otherUserId) return;
    
    const msgText = text.trim();
    if (!msgText && !selectedImage) return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTypingStatus(activeConvId, user.id, false);
    setIsTyping(false);
    
    let replyPayload: any = undefined;
    if (replyingTo) {
        replyPayload = {
            id: replyingTo.id,
            text: replyingTo.text,
            senderId: replyingTo.senderId,
            senderName: replyingTo.senderId === user.id ? 'You' : (otherProfile?.name || 'Someone'),
            imageUrl: replyingTo.imageUrl || ''
        };
    }

    setText('');
    setSelectedImage(null);
    setReplyingTo(null);
    
    if (editingMsgId) {
       await editMessage(activeConvId, editingMsgId, msgText);
       setEditingMsgId(null);
    } else {
       await sendMessage(activeConvId, user.id, otherUserId, msgText, selectedImage || undefined, replyPayload);
    }
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

  // Cleanup recording resources on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
          if (mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          }
        } catch(e) {}
      }
    };
  }, []);

  const startRecording = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      let options = { mimeType: 'audio/webm' };
      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (err) {
        // Fallback for Safari/iOS
        recorder = new MediaRecorder(stream);
      }
      
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop stream tracks to turn off mic light
        stream.getTracks().forEach(track => track.stop());

        const durationSecs = recordingDurationRef.current;
        if (durationSecs < 1) {
          return; // Ignore extremely short recordings
        }

        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        
        // Convert Blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          if (activeConvId && user && otherUserId) {
            await sendMessage(
              activeConvId, 
              user.id, 
              otherUserId, 
              '', 
              undefined, 
              undefined, 
              base64Audio, 
              durationSecs
            );
          }
        };
      };

      // Reset & Start timer
      setRecordingDuration(0);
      recordingDurationRef.current = 0;
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const next = prev + 1;
          recordingDurationRef.current = next;
          return next;
        });
      }, 1000);

      recorder.start(250);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      setMicError(true);
    }
  };

  const stopRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    
    mediaRecorderRef.current.stop();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
  };

  const cancelRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!mediaRecorderRef.current) return;
    
    // Clear chunks so onstop does not save
    audioChunksRef.current = [];
    mediaRecorderRef.current.stop();
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
    setRecordingDuration(0);
    recordingDurationRef.current = 0;
  };

  const formatTime = (ts: any) => {
      if(!ts) return '';
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-1 min-h-[500px] sm:min-h-[600px] overflow-hidden rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'} shadow-xl`}>
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
                    {conversations.filter(c => !user?.id || !c.deletedFor?.includes(user.id)).map(c => {
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
                    <div className="relative flex items-center gap-1">
                        <button onClick={() => handleStartCall('audio')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-blue-500">
                           <Phone className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleStartCall('video')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-blue-500">
                           <Video className="w-5 h-5" />
                        </button>
                        <button onClick={() => setShowConvOptions(!showConvOptions)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500">
                           <MoreVertical className="w-5 h-5" />
                        </button>
                        {showConvOptions && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-100 dark:border-slate-800 py-1 z-50">
                                <button onClick={handleDeleteConvHistory} className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Delete chat history
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages Area */}
                <div 
                    className={`flex-1 overflow-y-auto p-4 space-y-4 relative ${isDark ? 'bg-[#0f172a]' : 'bg-[#F0F2F5]'} ${isDragging ? 'ring-4 ring-blue-500/40' : ''}`} 
                    onClick={() => setMessageMenuId(null)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {isDragging && (
                       <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center border-4 border-dashed border-blue-500/40 rounded-xl z-30 pointer-events-none">
                           <div className="bg-white dark:bg-slate-900 rounded-2xl px-6 py-4 shadow-xl text-center space-y-2 animate-bounce">
                               <ImageIcon className="w-8 h-8 text-blue-500 mx-auto" />
                               <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">এখানে ছবি ড্রপ করুন</p>
                           </div>
                       </div>
                    )}
                    {messages.filter(msg => !user || !msg.deletedFor?.includes(user.id)).map((msg, idx, arr) => {
                        const isMe = msg.senderId === user?.id;
                        const showAvatar = !isMe && (idx === arr.length - 1 || arr[idx + 1]?.senderId !== msg.senderId);
                        const canEdit = checkCanEdit(msg);
                        
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
                                <div id={`msg-${msg.id}`} className={`flex flex-col relative max-w-[70%] lg:max-w-[60%] ${isMe ? 'items-end' : 'items-start'} group/bubble transition-transform`}>
                                    {msg.replyTo && !msg.isDeletedForEveryone && (
                                        <div 
                                            onClick={() => {
                                                const el = document.getElementById(`msg-${msg.replyTo?.id}`);
                                                if (el) {
                                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                    el.classList.add('ring-4', 'ring-blue-500/50', 'rounded-2xl', 'scale-105');
                                                    setTimeout(() => el.classList.remove('ring-4', 'ring-blue-500/50', 'rounded-2xl', 'scale-105'), 1200);
                                                }
                                            }}
                                            className={`mb-1 px-3 py-1.5 text-xs rounded-xl flex flex-col cursor-pointer transition-all duration-200 border-l-2 max-w-full ${
                                                isMe 
                                                    ? 'bg-blue-900/40 text-blue-100 hover:bg-blue-900/60 border-blue-400 self-end' 
                                                    : 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-300 hover:bg-slate-300/60 border-slate-400 self-start'
                                            }`}
                                        >
                                            <span className="font-semibold text-[10px] text-blue-500 dark:text-blue-400">
                                                Replying to {msg.replyTo.senderName || 'Someone'}
                                            </span>
                                            <span className="truncate max-w-[180px] break-all opacity-85">
                                                {msg.replyTo.imageUrl ? '📷 Photo' : msg.replyTo.text}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`group flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`px-4 py-2.5 shadow-sm text-[15px] ${msg.isDeletedForEveryone ? 'italic opacity-60 ' : ''}${isMe ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' : (isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900') + ' rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700'}`}>
                                            {!msg.isDeletedForEveryone && msg.imageUrl && (
                                                <div className="mb-2 max-w-xs overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/50">
                                                    <img 
                                                        src={msg.imageUrl} 
                                                        alt="Message attachment" 
                                                        className="max-h-64 object-contain rounded-xl w-full hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                                                        onClick={() => {
                                                            const win = window.open();
                                                            if (win) {
                                                                win.document.write(`<img src="${msg.imageUrl}" style="max-width:100%; max-height:100vh; display:block; margin:auto; background:#111;" />`);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {!msg.isDeletedForEveryone && msg.audioUrl ? (
                                                <VoiceMessagePlayer src={msg.audioUrl} duration={msg.audioDuration} isMe={isMe} />
                                            ) : (
                                                <p className="break-words">{msg.text}</p>
                                            )}
                                        </div>
                                        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); setMessageMenuId(messageMenuId === msg.id ? null : msg.id); }} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {messageMenuId === msg.id && (
                                            <div onClick={(e) => e.stopPropagation()} className={`absolute z-20 top-full ${isMe ? 'right-0' : 'left-0'} mt-1 w-48 bg-white dark:bg-slate-900 shadow-xl rounded-xl border border-slate-100 dark:border-slate-800 py-1`}>
                                                <div className="flex justify-around p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                                                    {['👍','❤️','😂','😲','😢','🙏'].map(emoji => (
                                                        <button key={emoji} onClick={() => handleReaction(msg, emoji)} className="hover:scale-125 transition">
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                                {!msg.isDeletedForEveryone && (
                                                    <button onClick={() => { setReplyingTo(msg); setMessageMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 mb-1">
                                                        <CornerUpLeft className="w-4 h-4 text-blue-500" /> Reply
                                                    </button>
                                                )}
                                                {canEdit && (
                                                    <button onClick={() => handleEditClick(msg)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2">
                                                        <Edit3 className="w-4 h-4" /> Edit Message
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteForMe(msg)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2">
                                                    <Trash2 className="w-4 h-4" /> Delete for me
                                                </button>
                                                {isMe && !msg.isDeletedForEveryone && (
                                                    <button onClick={() => handleDeleteForEveryone(msg)} className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition flex items-center gap-2">
                                                        <Trash2 className="w-4 h-4" /> Delete for everyone
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                        <div className={`mt-1 flex -space-x-1 `}>
                                            <div className="bg-white dark:bg-slate-800 rounded-full px-1.5 py-0.5 text-xs shadow border border-slate-100 dark:border-slate-700 border-2">
                                                {Array.from(new Set(Object.values(msg.reactions))).join('')}
                                            </div>
                                        </div>
                                    )}

                                    {isMe && (
                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                                            {formatTime(msg.createdAt)}
                                            {msg.isEdited && <span className="italic ml-1">(edited)</span>}
                                            {msg.status === 'sent' && <Check className="w-3 h-3 ml-1" />}
                                            {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 text-slate-400 ml-1" />}
                                            {msg.status === 'seen' && <CheckCheck className="w-3 h-3 text-blue-500 ml-1" />}
                                        </div>
                                    )}
                                    {!isMe && (
                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                                            {formatTime(msg.createdAt)}
                                            {msg.isEdited && <span className="italic ml-1">(edited)</span>}
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
                    {editingMsgId && (
                        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 mb-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Edit3 className="w-4 h-4" /> Editing message
                            </div>
                            <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {replyingTo && (
                        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-955/40 rounded-lg px-4 py-2 mb-2 border border-blue-100 dark:border-blue-900/40 animate-in slide-in-from-bottom-2 duration-200">
                            <div className="flex flex-col text-xs text-slate-600 dark:text-slate-300">
                                <span className="font-semibold text-blue-500 flex items-center gap-1">
                                    <CornerUpLeft className="w-3 h-3" /> Replying to {replyingTo.senderId === user?.id ? 'Yourself' : otherProfile?.name}
                                </span>
                                <span className="truncate max-w-[240px] opacity-85 italic">
                                    {replyingTo.imageUrl ? '📷 Photo' : replyingTo.text}
                                </span>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {selectedImage && (
                        <div className="relative inline-block p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-[120px] animate-in zoom-in-95 duration-200 mb-3">
                            <img src={selectedImage} alt="Selected preview" className="w-24 h-24 object-cover rounded-lg" />
                            <button onClick={() => setSelectedImage(null)} className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow shadow-rose-900/50 transition">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {isRecording ? (
                        <div className="flex items-center justify-between bg-rose-50/80 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-full px-4 py-2 animate-pulse">
                            <div className="flex items-center gap-3 text-sm text-rose-600 dark:text-rose-400 font-medium">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                                </span>
                                <span className="font-semibold">
                                    {lang === 'bn' 
                                      ? `ভয়েস রেকর্ড হচ্ছে... ${recordingDuration} সে.` 
                                      : `Recording voice... ${recordingDuration}s`}
                                </span>
                                {/* Mini animated audio wave */}
                                <div className="flex gap-[2px] items-end h-4 pb-1">
                                    <div className="w-[2px] h-2.5 bg-rose-500 rounded animate-bounce" style={{ animationDuration: '0.6s' }} />
                                    <div className="w-[2px] h-4 bg-rose-500 rounded animate-bounce" style={{ animationDuration: '0.4s' }} />
                                    <div className="w-[2px] h-1.5 bg-rose-500 rounded animate-bounce" style={{ animationDuration: '0.8s' }} />
                                    <div className="w-[2px] h-3 bg-rose-500 rounded animate-bounce" style={{ animationDuration: '0.5s' }} />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={cancelRecording}
                                    title={lang === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <button 
                                    type="button"
                                    onClick={stopRecording}
                                    title={lang === 'bn' ? 'পাঠান' : 'Send'}
                                    className="p-2.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition active:scale-95 flex items-center justify-center shadow shadow-rose-950/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                id="chat-image-picker"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) processImage(file);
                                }}
                            />
                            <label 
                                htmlFor="chat-image-picker" 
                                title={lang === 'bn' ? "ছবি যুক্ত করুন" : "Attach Image"}
                                className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-500 hover:text-blue-500 transition shrink-0"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </label>

                            <button 
                                type="button"
                                onClick={startRecording}
                                title={lang === 'bn' ? "ভয়েস মেসেজ রেকর্ড করুন" : "Record voice message"}
                                className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-500 transition shrink-0"
                            >
                                <Mic className="w-5 h-5" />
                            </button>

                            <input
                                type="text"
                                value={text}
                                onChange={handleTextChange}
                                placeholder={selectedImage ? (lang === 'bn' ? "ছবির সাথে ক্যাপশন লিখুন..." : "Type caption with photo...") : (lang === 'bn' ? "মেসেজ লিখুন..." : "Type a message...")}
                                className={`flex-1 rounded-full px-4 py-2.5 outline-none ${isDark ? 'bg-slate-900 text-white placeholder-slate-500' : 'bg-slate-100 text-slate-900 placeholder-slate-500'} focus:ring-2 focus:ring-blue-500/50`}
                            />
                            <button 
                                type="submit" 
                                disabled={!text.trim() && !selectedImage} 
                                className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 shrink-0"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    )}
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

      {micError && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setMicError(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              id="close_mic_error_btn"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Mic className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {lang === 'bn' ? 'মাইক্রোফোন অনুমতি প্রয়োজন' : 'Microphone Permission Required'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              {lang === 'bn' 
                ? "প্রিভিউ ফ্রেমের ভেতরে মাইক্রোফোন ব্যবহারের অনুমতি পাওয়া যায়নি। এটি সমাধান করতে অনুগ্রহ করে আপনার স্ক্রিনের উপরে ডান কোণায় থাকা 'Open in New Tab' বাটনে ক্লিক করে অ্যাপটি নতুন ট্যাবে খুলুন অথবা ব্রাউজারের অ্যাড্রেস বার থেকে মাইক্রোফোন ব্যবহারের অনুমতি দিন।" 
                : "Microphone access was denied or could not be initiated in this frame. To resolve this, please click 'Open in New Tab' in the top-right corner to open the app directly, or grant microphone permission in your browser address bar settings."}
            </p>
            <button 
              onClick={() => setMicError(false)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl active:scale-95 transition"
              id="dismiss_mic_error_btn"
            >
              {lang === 'bn' ? 'ঠিক আছে' : 'Got it'}
            </button>
          </div>
        </div>
      )}

      {/* Incoming Call Dialog */}
      {incomingCall && !activeCall && (
         <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center relative animate-in zoom-in-95 duration-200">
                 <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 mb-4 overflow-hidden shadow-inner">
                     {profiles[incomingCall.callerId]?.avatarUrl ? (
                         <img src={profiles[incomingCall.callerId].avatarUrl} alt="Caller" className="w-full h-full object-cover" />
                     ) : (
                         <span className="text-2xl font-bold text-slate-500 flex items-center justify-center h-full">{profiles[incomingCall.callerId]?.name?.[0] || '?'}</span>
                     )}
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                     {profiles[incomingCall.callerId]?.name || 'Unknown User'}
                 </h3>
                 <p className="text-slate-500 mb-8 font-medium">
                     Incoming {incomingCall.type === 'video' ? 'Video' : 'Voice'} Call...
                 </p>
                 <div className="flex items-center justify-center gap-6">
                     <button 
                         onClick={handleRejectCall}
                         className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition shadow-lg shadow-rose-900/50 hover:scale-105 active:scale-95"
                     >
                         <Phone className="w-7 h-7 rotate-[135deg]" />
                     </button>
                     <button 
                         onClick={handleAcceptCall}
                         className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition shadow-lg shadow-green-900/50 hover:scale-105 active:scale-95 animate-pulse"
                     >
                         {incomingCall.type === 'video' ? <Video className="w-7 h-7" /> : <Phone className="w-7 h-7" />}
                     </button>
                 </div>
             </div>
         </div>
      )}

      {/* Active Call Screen */}
      {activeCall && (
          <CallScreen 
             call={activeCall.call} 
             isCaller={activeCall.isCaller} 
             onClose={() => setActiveCall(null)} 
             otherUserName={activeCall.isCaller ? profiles[activeCall.call.calleeId]?.name : profiles[activeCall.call.callerId]?.name}
             otherUserAvatar={activeCall.isCaller ? profiles[activeCall.call.calleeId]?.avatarUrl : profiles[activeCall.call.callerId]?.avatarUrl}
          />
      )}
    </div>
  );
}
