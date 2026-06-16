import { db } from './firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Post, PostComment } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const toggleFollow = async (currentUserId: string, targetUserId: string, isFollowing: boolean) => {
  const currentUserRef = doc(db, 'publicProfiles', currentUserId);
  const targetUserRef = doc(db, 'publicProfiles', targetUserId);

  try {
    if (isFollowing) {
      await setDoc(currentUserRef, { followingCount: arrayRemove(targetUserId) }, { merge: true });
      await setDoc(targetUserRef, { followersCount: arrayRemove(currentUserId) }, { merge: true });
    } else {
      await setDoc(currentUserRef, { followingCount: arrayUnion(targetUserId) }, { merge: true });
      await setDoc(targetUserRef, { followersCount: arrayUnion(currentUserId) }, { merge: true });
    }
  } catch (error) {
    console.error('Error toggling follow', error);
  }
};

export const subscribeToProfileStats = (userId: string, callback: (stats: any) => void) => {
  return onSnapshot(doc(db, 'publicProfiles', userId), (doc) => {
    if (doc.exists()) {
       const data = doc.data();
       callback({
           followers: data.followersCount?.length || 0,
           following: data.followingCount?.length || 0,
           followersList: data.followersCount || [],
           followingList: data.followingCount || [],
       });
    }
  });
};

export const toggleReaction = async (targetUserId: string, postId: string, userId: string, emoji: string) => {
    const targetRef = doc(db, 'publicProfiles', targetUserId);
    const snap = await getDoc(targetRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const posts: Post[] = data.posts || [];
    
    const updatedPosts = posts.map(p => {
        if (p.id === postId) {
            const reactions = { ...(p.reactions || {}) };
            if (reactions[userId] === emoji) {
                delete reactions[userId];
            } else {
                reactions[userId] = emoji;
            }
            return { ...p, reactions };
        }
        return p;
    });

    await setDoc(targetRef, { posts: updatedPosts }, { merge: true });
};

export const addComment = async (targetUserId: string, postId: string, userId: string, text: string, replyToCommentId?: string) => {
    const targetRef = doc(db, 'publicProfiles', targetUserId);
    const snap = await getDoc(targetRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const posts: Post[] = data.posts || [];
    
    const newComment: PostComment = {
        id: uuidv4(),
        userId,
        text,
        createdAt: new Date().toISOString()
    };

    const updatedPosts = posts.map(p => {
        if (p.id === postId) {
            const comments = [...(p.comments || [])];
            if (replyToCommentId) {
                const commentIndex = comments.findIndex(c => c.id === replyToCommentId);
                if (commentIndex !== -1) {
                    const parentComment = comments[commentIndex];
                    comments[commentIndex] = {
                        ...parentComment,
                        replies: [...(parentComment.replies || []), newComment]
                    };
                }
            } else {
                comments.push(newComment);
            }
            return { ...p, comments };
        }
        return p;
    });

    await setDoc(targetRef, { posts: updatedPosts }, { merge: true });
};
