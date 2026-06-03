import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Send, User as UserIcon, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: any;
}

export function MessagesView({ onBack }: { onBack: () => void }) {
  const { user, lang } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'global_messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'global_messages'), {
        senderId: user.id,
        senderName: user.name,
        text: newMessage,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] pb-24">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'মেসেজিং' : 'Messaging'}
          </h2>
        </div>
      </div>

      <Card className="flex-1 flex flex-col mb-4 overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-4 overflow-hidden h-full">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                {lang === 'bn' ? 'এখনো কোনো মেসেজ নেই...' : 'No messages yet...'}
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl p-3 ${msg.senderId === user?.id ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700'}`}>
                    {msg.senderId !== user?.id && <div className="text-xs font-semibold mb-1 opacity-70">{msg.senderName}</div>}
                    <div>{msg.text}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={lang === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'}
              className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="p-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 disabled:opacity-50 transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
