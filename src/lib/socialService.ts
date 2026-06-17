import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, where, orderBy, onSnapshot, serverTimestamp, getDoc, addDoc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface SocialPost {
    id: string;
    authorId: string;
    content: string;
    imageUrl?: string;
    likesCount: number;
    commentsCount: number;
    createdAt: any;
    reactions?: Record<string, string>; // Backward compat for old reaction UI
}

export const subscribeToNewsfeed = (callback: (posts: SocialPost[]) => void) => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
        const posts: SocialPost[] = [];
        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() } as SocialPost);
        });
        callback(posts);
    }, (error) => {
        console.error("subscribeToNewsfeed error:", error);
    });
};

export const subscribeToUserPosts = (userId: string, callback: (posts: SocialPost[]) => void) => {
    const q = query(collection(db, 'posts'), where('authorId', '==', userId));
    return onSnapshot(q, (snapshot) => {
        const posts: SocialPost[] = [];
        snapshot.forEach(doc => {
            posts.push({ id: doc.id, ...doc.data() } as SocialPost);
        });
        posts.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeB - timeA;
        });
        callback(posts);
    }, (error) => {
        console.error("subscribeToUserPosts error:", error);
    });
};

export const createPost = async (authorId: string, content: string, imageUrl?: string) => {
    await addDoc(collection(db, 'posts'), {
        authorId,
        content,
        imageUrl: imageUrl || null,
        likesCount: 0,
        commentsCount: 0,
        createdAt: serverTimestamp()
    });
};

export const deletePost = async (postId: string) => {
    await deleteDoc(doc(db, 'posts', postId));
};

export const toggleLike = async (postId: string, userId: string, targetAuthorId: string, type: 'like'|'love'|'haha'|'wow'|'angry' = 'like') => {
    const reactionRef = doc(db, 'userReactions', userId);
    const postRef = doc(db, 'posts', postId);

    const reactionDoc = await getDoc(reactionRef);
    const currentReactions = reactionDoc.exists() ? reactionDoc.data() : {};
    const currentReaction = currentReactions[postId];

    if (currentReaction === type) {
        // Toggle off
        const updated = { ...currentReactions };
        delete updated[postId];
        await setDoc(reactionRef, updated);
        await updateDoc(postRef, { likesCount: increment(-1) });
    } else {
        // Toggle on or change
        await setDoc(reactionRef, { ...currentReactions, [postId]: type });
        if (!currentReaction) {
            await updateDoc(postRef, { likesCount: increment(1) });
            
            // Notify
            if (userId !== targetAuthorId) {
                await addDoc(collection(db, 'notifications'), {
                    receiverId: targetAuthorId,
                    senderId: userId,
                    type: 'like',
                    postId,
                    read: false,
                    createdAt: serverTimestamp()
                });
            }
        }
    }
};

export const subscribeToUserReactions = (userId: string, callback: (reactions: Record<string, string>) => void) => {
    return onSnapshot(doc(db, 'userReactions', userId), { includeMetadataChanges: true }, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        } else {
            callback({});
        }
    }, (error) => {
        console.error("subscribeToUserReactions error:", error);
    });
};

export const fetchComments = (postId: string, callback: (comments: any[]) => void) => {
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
        const comments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(comments);
    }, (error) => {
        console.error("fetchComments error:", error);
    });
};

export const addPostComment = async (postId: string, authorId: string, content: string, targetAuthorId: string, replyToCommentId?: string) => {
    await addDoc(collection(db, 'posts', postId, 'comments'), {
        postId,
        authorId,
        content,
        replyToCommentId: replyToCommentId || null,
        createdAt: serverTimestamp()
    });
    await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(1) });

    if (authorId !== targetAuthorId) {
        await addDoc(collection(db, 'notifications'), {
            receiverId: targetAuthorId,
            senderId: authorId,
            type: 'comment',
            postId,
            read: false,
            createdAt: serverTimestamp()
        });
    }
};

export const toggleFollow = async (currentUserId: string, targetUserId: string) => {
    const followId = `${currentUserId}_${targetUserId}`;
    const followRef = doc(db, 'follows', followId);
    const followSnap = await getDoc(followRef);

    if (followSnap.exists()) {
        await deleteDoc(followRef);
        await setDoc(doc(db, 'publicProfiles', currentUserId), { followingCount: arrayRemove(targetUserId) }, { merge: true });
        await setDoc(doc(db, 'publicProfiles', targetUserId), { followersCount: arrayRemove(currentUserId) }, { merge: true });
    } else {
        await setDoc(followRef, {
            followerId: currentUserId,
            followingId: targetUserId,
            createdAt: serverTimestamp()
        });
        await setDoc(doc(db, 'publicProfiles', currentUserId), { followingCount: arrayUnion(targetUserId) }, { merge: true });
        await setDoc(doc(db, 'publicProfiles', targetUserId), { followersCount: arrayUnion(currentUserId) }, { merge: true });

        await addDoc(collection(db, 'notifications'), {
            receiverId: targetUserId,
            senderId: currentUserId,
            type: 'follow',
            read: false,
            createdAt: serverTimestamp()
        });
    }
};

export const subscribeToNotifications = (userId: string, callback: (notifs: any[]) => void) => {
    const q = query(collection(db, 'notifications'), where('receiverId', '==', userId));
    return onSnapshot(q, (snap) => {
        const notifs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        notifs.sort((a, b) => {
            const timeA = (a as any).createdAt?.toMillis() || 0;
            const timeB = (b as any).createdAt?.toMillis() || 0;
            return timeB - timeA;
        });
        callback(notifs);
    }, (error) => {
        console.error("subscribeToNotifications error:", error);
    });
};

export const markNotificationRead = async (notificationId: string) => {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
};
