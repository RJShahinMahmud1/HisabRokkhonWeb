import { collection, doc, addDoc, onSnapshot, updateDoc, getDoc, setDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';

export interface CallData {
  id?: string;
  conversationId: string;
  callerId: string;
  calleeId: string;
  type: 'audio' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'rejected' | 'missed';
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  createdAt: any;
}

export const subscribeToIncomingCalls = (userId: string, onCall: (call: CallData) => void) => {
  const q = query(
    collection(db, 'calls'),
    where('calleeId', '==', userId),
    where('status', '==', 'ringing')
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added' || change.type === 'modified') {
        onCall({ id: change.doc.id, ...change.doc.data() } as CallData);
      }
    });
  });
};

export const startCall = async (conversationId: string, callerId: string, calleeId: string, type: 'audio' | 'video') => {
  const callDoc = await addDoc(collection(db, 'calls'), {
    conversationId,
    callerId,
    calleeId,
    type,
    status: 'ringing',
    createdAt: serverTimestamp()
  });
  return callDoc.id;
};

export const subscribeToCall = (callId: string, onUpdate: (call: CallData) => void) => {
  return onSnapshot(doc(db, 'calls', callId), (snapshot) => {
    if (snapshot.exists()) {
      onUpdate({ id: snapshot.id, ...snapshot.data() } as CallData);
    }
  });
};

export const setCallOffer = async (callId: string, offer: RTCSessionDescriptionInit) => {
  await updateDoc(doc(db, 'calls', callId), { offer });
};

export const setCallAnswer = async (callId: string, answer: RTCSessionDescriptionInit) => {
  await updateDoc(doc(db, 'calls', callId), { answer, status: 'connected' });
};

export const updateCallStatus = async (callId: string, status: CallData['status']) => {
  await updateDoc(doc(db, 'calls', callId), { status });
};

export const addIceCandidate = async (callId: string, role: 'caller' | 'callee', candidate: RTCIceCandidateInit) => {
  const candidatesCollection = collection(db, 'calls', callId, `${role}Candidates`);
  await addDoc(candidatesCollection, candidate);
};

export const subscribeToIceCandidates = (callId: string, role: 'caller' | 'callee', onCandidate: (candidate: RTCIceCandidateInit) => void) => {
  const candidatesCollection = collection(db, 'calls', callId, `${role}Candidates`);
  return onSnapshot(candidatesCollection, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        onCandidate(change.doc.data() as RTCIceCandidateInit);
      }
    });
  });
};
