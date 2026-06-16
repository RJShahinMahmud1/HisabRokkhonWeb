import React, { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, User as UserIcon } from 'lucide-react';

interface UserListModalProps {
  userIds: string[];
  title: string;
  onClose: () => void;
  onUserClick: (userId: string) => void;
}

export function UserListModal({ userIds, title, onClose, onUserClick }: UserListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const userDocs = await Promise.all(
        userIds.map(id => getDoc(doc(db, 'publicProfiles', id)))
      );
      
      const loadedUsers = userDocs
        .filter(d => d.exists())
        .map(d => ({ id: d.id, ...d.data() }));
        
      setUsers(loadedUsers);
      setLoading(false);
    };

    if (userIds.length > 0) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [userIds]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 space-y-3 flex-1">
          {loading ? (
             <div className="text-center text-slate-500 dark:text-slate-400 py-8">Loading...</div>
          ) : users.length === 0 ? (
             <div className="text-center text-slate-500 dark:text-slate-400 py-8">No users found</div>
          ) : (
            users.map(u => (
              <div 
                key={u.id}
                onClick={() => onUserClick(u.id)}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition"
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">{u.name}</div>
                  {u.username && <div className="text-xs text-slate-500 truncate">@{u.username}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
