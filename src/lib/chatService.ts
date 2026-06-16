import { collection, query, where, orderBy, onSnapshot, getDocs, addDoc, updateDoc, doc, serverTimestamp, setDoc, limit, getDoc, DocumentData } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface PublicProfile {
  uid: string;
  name: string;
  username?: string;
  email: string;
  avatarUrl: string;
  isOnline: boolean;
  lastSeen: any;
  updatedAt: any;
}

export const checkUsernameUnique = async (username: string): Promise<boolean> => {
  if (!username) return false;
  const q = query(collection(db, 'publicProfiles'), where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export interface Conversation {
  id: string;
  participants: string[];
  lastMessageText: string;
  lastMessageSenderId: string;
  lastMessageTime: any;
  unreadCount: Record<string, number>;
  typingUsers: Record<string, boolean>;
  createdAt: any;
  updatedAt: any;
  deletedFor?: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  status: 'sent' | 'delivered' | 'seen';
  createdAt: any;
  isEdited?: boolean;
  editedAt?: any;
  isDeletedForEveryone?: boolean;
  deletedFor?: string[];
  reactions?: Record<string, string>;
}

export const subscribeToConversations = (userId: string, callback: (convs: Conversation[]) => void) => {
  if (!userId) return () => {};
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
    // Sort locally to avoid requiring composite index
    convs.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
      const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
      return timeB - timeA;
    });
    callback(convs);
  }, (error) => {});
};

export const subscribeToMessages = (conversationId: string, callback: (msgs: Message[]) => void) => {
  if (!conversationId) return () => {};
  const q = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(msgs);
  }, (error) => {});
};

export const subscribeToAllUsers = (currentUserId: string, callback: (profiles: PublicProfile[]) => void) => {
  const q = query(collection(db, 'publicProfiles'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const profiles = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as PublicProfile));
    callback(profiles.filter(p => p.uid !== currentUserId));
  }, (error) => {});
};

export const searchUsers = async (searchTerm: string, currentUserId: string): Promise<PublicProfile[]> => {
  const q = query(collection(db, 'publicProfiles'), limit(100)); // increased limit to 100
  const snapshot = await getDocs(q);
  const profiles = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as PublicProfile));
  
  if (!searchTerm) {
    return profiles.filter(p => p.uid !== currentUserId);
  }

  const lowerTerm = searchTerm.toLowerCase();
  return profiles.filter(p => 
    p.uid !== currentUserId && 
    (p.name?.toLowerCase().includes(lowerTerm) || p.email?.toLowerCase().includes(lowerTerm))
  );
};

export const getOrCreateConversation = async (currentUserId: string, otherUserId: string): Promise<string> => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', currentUserId)
  );
  const snapshot = await getDocs(q);
  const existing = snapshot.docs.find(d => {
    const data = d.data();
    return data.participants.includes(otherUserId) && data.participants.length === 2;
  });

  if (existing) {
    return existing.id;
  }

  const newRef = await addDoc(collection(db, 'conversations'), {
    participants: [currentUserId, otherUserId],
    lastMessageText: '',
    lastMessageSenderId: '',
    lastMessageTime: serverTimestamp(),
    unreadCount: {
      [currentUserId]: 0,
      [otherUserId]: 0
    },
    typingUsers: {
      [currentUserId]: false,
      [otherUserId]: false
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return newRef.id;
};

export const sendMessage = async (conversationId: string, senderId: string, otherUserId: string, text: string) => {
  // 1. Add Message
  await addDoc(collection(db, `conversations/${conversationId}/messages`), {
    conversationId,
    senderId,
    text,
    status: 'sent',
    createdAt: serverTimestamp()
  });

  // 2. Update Conversation
  // Get current unread to increment
  const convRef = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convRef);
  let otherUnread = 0;
  let currentDeletedFor: string[] = [];
  if(convSnap.exists()){
      const d = convSnap.data() as Conversation;
      otherUnread = (d.unreadCount && d.unreadCount[otherUserId]) || 0;
      currentDeletedFor = d.deletedFor || [];
  }
  
  const updatedDeletedFor = currentDeletedFor.filter(id => id !== senderId && id !== otherUserId);

  await updateDoc(convRef, {
    lastMessageText: text,
    lastMessageSenderId: senderId,
    lastMessageTime: serverTimestamp(),
    [`unreadCount.${otherUserId}`]: otherUnread + 1,
    deletedFor: updatedDeletedFor,
    updatedAt: serverTimestamp()
  });
};

export const markMessagesAsSeen = async (conversationId: string, currentUserId: string, messages: Message[]) => {
  // Reset unread count for current user
  try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        [`unreadCount.${currentUserId}`]: 0
      });
      // Updating messages to 'seen' requires batch or just skipping it for now since we rely on unreadCount
      // To properly do seen status, we will just update messages where status != 'seen' and sender != currentUser
      for (const m of messages) {
          if (m.senderId !== currentUserId && m.status !== 'seen') {
              await updateDoc(doc(db, `conversations/${conversationId}/messages/${m.id}`), {
                  status: 'seen'
              });
          }
      }
  } catch(e) {
      console.log("Error marking as seen", e);
  }
};

export const setTypingStatus = async (conversationId: string, userId: string, isTyping: boolean) => {
    try {
        await updateDoc(doc(db, 'conversations', conversationId), {
            [`typingUsers.${userId}`]: isTyping
        });
    } catch(e){}
};

// Global Presence
export const updateUserPresence = async (userId: string, isOnline: boolean) => {
    try {
        await setDoc(doc(db, 'publicProfiles', userId), {
            isOnline,
            lastSeen: serverTimestamp()
        }, { merge: true });
    } catch(e){}
};

export const editMessage = async (conversationId: string, messageId: string, text: string) => {
  await updateDoc(doc(db, `conversations/${conversationId}/messages/${messageId}`), {
    text,
    isEdited: true,
    editedAt: serverTimestamp(),
  });
};

export const deleteMessageForEveryone = async (conversationId: string, messageId: string) => {
  await updateDoc(doc(db, `conversations/${conversationId}/messages/${messageId}`), {
    text: 'এই মেসেজটি ডিলিট করা হয়েছে',
    isDeletedForEveryone: true,
  });
};

export const deleteMessageForMe = async (conversationId: string, messageId: string, userId: string, message: Message) => {
  const currentDeletedFor = message.deletedFor || [];
  await updateDoc(doc(db, `conversations/${conversationId}/messages/${messageId}`), {
    deletedFor: [...currentDeletedFor, userId],
  });
};

export const toggleMessageReaction = async (conversationId: string, messageId: string, userId: string, emoji: string, currentReactions: Record<string, string> = {}) => {
  const newReactions = { ...currentReactions };
  if (newReactions[userId] === emoji) {
    delete newReactions[userId];
  } else {
    newReactions[userId] = emoji;
  }
  
  await updateDoc(doc(db, `conversations/${conversationId}/messages/${messageId}`), {
    reactions: newReactions
  });
};

export const deleteConversationHistory = async (conversationId: string, userId: string, conv: Conversation) => {
  const currentDeletedFor = conv.deletedFor || [];
  if (!currentDeletedFor.includes(userId)) {
      await updateDoc(doc(db, 'conversations', conversationId), {
        deletedFor: [...currentDeletedFor, userId]
      });
  }
};
