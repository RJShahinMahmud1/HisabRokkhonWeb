import { collection, addDoc, serverTimestamp, updateDoc, doc, getDocs, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const reportPost = async (postId: string, postOwnerId: string, reporterId: string, reason: string) => {
  try {
    await addDoc(collection(db, 'reports'), {
      postId,
      postOwnerId,
      reporterId,
      reason,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error reporting post:', error);
    throw error;
  }
};

export const fetchReports = async () => {
    try {
        const snap = await getDocs(collection(db, 'reports'));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
};

export const fetchUsersList = async () => {
    try {
        const snap = await getDocs(collection(db, 'publicProfiles'));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

export const dismissReport = async (reportId: string) => {
    try {
        await updateDoc(doc(db, 'reports', reportId), {
            status: 'dismissed'
        });
    } catch (error) {
        console.error('Error dismissing report:', error);
        throw error;
    }
};

export const resolveReport = async (reportId: string) => {
    try {
        await updateDoc(doc(db, 'reports', reportId), {
            status: 'resolved'
        });
    } catch (error) {
        console.error('Error resolving report:', error);
        throw error;
    }
};

export const deletePostByAdmin = async (userId: string, postId: string) => {
    try {
        const userRef = doc(db, 'publicProfiles', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            const posts = userSnap.data().posts || [];
            await setDoc(userRef, {
                posts: posts.filter((p: any) => p.id !== postId)
            }, { merge: true });
        }
    } catch(error) {
        console.error('Error deleting post:', error);
        throw error;
    }
};

export const setUserBanStatus = async (userId: string, banned: boolean) => {
    try {
        await setDoc(doc(db, 'publicProfiles', userId), { banned }, { merge: true });
        await setDoc(doc(db, 'userStates', userId), { 
            stateStr: JSON.stringify({ user: { banned }}) 
        }, { merge: true });
    } catch (error) {
        console.error('Error setting ban status:', error);
        throw error;
    }
};

export const setUserMessageStatus = async (userId: string, messagesDisabled: boolean) => {
    try {
        await setDoc(doc(db, 'publicProfiles', userId), { messagesDisabled }, { merge: true });
    } catch (error) {
        console.error('Error setting message status:', error);
        throw error;
    }
};
