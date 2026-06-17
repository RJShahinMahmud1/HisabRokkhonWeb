import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { fetchComments, addPostComment } from '../../lib/socialService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Send, X } from 'lucide-react';

export function PostComments({ postId, postAuthorId }: { postId: string, postAuthorId: string }) {
    const { user, lang } = useAppStore();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [profiles, setProfiles] = useState<Record<string, any>>({});
    const [replyTo, setReplyTo] = useState<{ id: string, name: string } | null>(null);

    const t = {
        addComment: lang === 'hi' ? 'टिप्पणी लिखें...' : lang === 'bn' ? 'মন্তব্য লিখুন...' : 'Write a comment...',
        reply: lang === 'hi' ? 'उत्तर दें' : lang === 'bn' ? 'রিপ্লাই দিন' : 'Reply',
        replyingTo: lang === 'hi' ? 'को उत्तर दे रहे हैं' : lang === 'bn' ? '-কে রিপ্লাই দিচ্ছেন' : 'Replying to',
    };

    useEffect(() => {
        const unsub = fetchComments(postId, (fetchedComments) => {
            setComments(fetchedComments);
            fetchedComments.forEach(c => {
                if (!profiles[c.authorId]) {
                    getDoc(doc(db, 'publicProfiles', c.authorId)).then(snap => {
                        if (snap.exists()) {
                            setProfiles(prev => ({ ...prev, [c.authorId]: snap.data() }));
                        }
                    });
                }
            });
        });
        return () => unsub();
    }, [postId]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;
        await addPostComment(postId, user.id, newComment.trim(), postAuthorId, replyTo?.id);
        setNewComment('');
        setReplyTo(null);
    };

    const topLevelComments = comments.filter(c => !c.replyToCommentId);
    const getReplies = (commentId: string) => comments.filter(c => c.replyToCommentId === commentId);

    const renderComment = (comment: any, isReply: boolean = false) => {
        const profile = profiles[comment.authorId];
        return (
            <div key={comment.id} className={`flex gap-2 text-sm ${isReply ? 'ml-10 mt-2' : 'mt-4'}`}>
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex justify-center items-center font-bold text-slate-400">{profile?.name?.[0]}</div>}
                </div>
                <div className="flex-1">
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl rounded-tl-sm px-4 py-2 inline-block max-w-full">
                        <span className="font-semibold block text-slate-900 dark:text-white text-[13px] mb-0.5">{profile?.name || 'User'}</span>
                        <p className="text-slate-700 dark:text-slate-300 break-words">{comment.content}</p>
                    </div>
                    {!isReply && (
                        <div className="ml-2 mt-1 flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <button onClick={() => setReplyTo({ id: comment.id, name: profile?.name || 'User' })} className="hover:text-slate-900 dark:hover:text-slate-300 transition">
                                {t.reply}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
            <div className="space-y-1">
                {topLevelComments.map(comment => (
                    <div key={comment.id}>
                        {renderComment(comment)}
                        {getReplies(comment.id).map(reply => renderComment(reply, true))}
                    </div>
                ))}
            </div>

            <form onSubmit={handlePostComment} className="flex flex-col gap-2 relative z-10 w-full mt-2">
                {replyTo && (
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 text-xs px-3 py-1.5 rounded-lg text-slate-500 border border-slate-200 dark:border-slate-700 w-max">
                        <span>{t.replyingTo} <strong className="text-slate-700 dark:text-slate-300">{replyTo.name}</strong></span>
                        <button type="button" onClick={() => setReplyTo(null)} className="p-1 hover:text-slate-900 dark:hover:text-white ml-2"><X className="w-3 h-3" /></button>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t.addComment}
                        className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-2 border-none outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white text-sm"
                    />
                    <button type="submit" disabled={!newComment.trim()} className="p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 transition">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
}
