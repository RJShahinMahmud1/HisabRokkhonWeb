import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import { subscribeToNewsfeed, createPost, deletePost, toggleLike, SocialPost, subscribeToUserReactions } from '../../lib/socialService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Heart, MessageSquare, Trash2, Send, Image as ImageIcon, X } from 'lucide-react';
import { PostComments } from './PostComments';
import { compressImage } from '../../lib/utils';

export function NewsfeedView() {
  const { user, lang } = useAppStore();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [newPostContent, setNewPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const t = {
    whatsOnYourMind: lang === 'bn' ? 'আপনার মনে কি আছে?' : 'What\'s on your mind?',
    post: lang === 'bn' ? 'পোস্ট করুন' : 'Post',
    deleteConfirm: lang === 'bn' ? 'পোস্টটি মুছে ফেলতে চান?' : 'Want to delete this post?',
    noPosts: lang === 'bn' ? 'কোনো पोस्ट নেই' : 'No posts yet',
    like: lang === 'bn' ? 'লাইক' : 'Like',
    comment: lang === 'bn' ? 'কমেন্ট' : 'Comment',
    loading: lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...',
  };

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToNewsfeed((fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoading(false);
      
      // Fetch missing profiles
      fetchedPosts.forEach(post => {
        if (!profiles[post.authorId]) {
          getDoc(doc(db, 'publicProfiles', post.authorId)).then(snap => {
            if (snap.exists()) {
              setProfiles(prev => ({ ...prev, [post.authorId]: snap.data() }));
            }
          }).catch(err => console.error(err));
        }
      });
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToUserReactions(user.id, (reactions) => {
      setUserReactions(reactions);
    });
    return () => unsub();
  }, [user?.id]);

  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file, 500, 500);
      setPostImage(compressed);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newPostContent.trim() && !postImage)) return;
    await createPost(user.id, newPostContent.trim(), postImage);
    setNewPostContent('');
    setPostImage('');
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm(t.deleteConfirm)) {
      await deletePost(postId);
    }
  };

  const handleSetReaction = async (postId: string, authorId: string, type: 'like'|'love'|'wow'|'haha'|'angry') => {
    if (!user) return;
    await toggleLike(postId, user.id, authorId, type);
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 pb-20 min-h-screen">
      {/* Create Post */}
      <div className="bg-white dark:bg-slate-950 px-4 py-3 shadow-sm border-b border-slate-300 dark:border-slate-800 mb-2">
        <form onSubmit={handleCreatePost} className="flex flex-col gap-2">
          <div className="flex gap-2">
             <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-300">
                 {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{user?.name?.[0]}</div>}
             </div>
             <div className="flex-1">
               <textarea
                 value={newPostContent}
                 onChange={(e) => setNewPostContent(e.target.value)}
                 placeholder={t.whatsOnYourMind}
                 className="w-full bg-transparent p-2 outline-none resize-none text-slate-900 dark:text-slate-100 placeholder-slate-500 text-[15px]"
                 rows={2}
               ></textarea>
               {postImage && (
                 <div className="relative mt-2">
                   <img src={postImage} alt="Post Preview" className="w-full max-h-64 object-cover rounded-xl" />
                   <button 
                     type="button" 
                     onClick={() => setPostImage('')}
                     className="absolute top-2 right-2 bg-slate-900/50 text-white p-1 rounded-full hover:bg-slate-900 transition"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               )}
             </div>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-2">
             <label className="cursor-pointer text-slate-500 hover:text-blue-500 transition-colors p-2 flex items-center gap-1.5 font-medium text-sm">
               <ImageIcon className="w-5 h-5" />
               Photo
               <input type="file" className="hidden" accept="image/*" onChange={handlePostImageUpload} />
             </label>
             <button disabled={!newPostContent.trim() && !postImage} className="bg-blue-600 text-white px-4 py-1.5 rounded font-bold text-sm flex items-center gap-1.5 hover:bg-blue-700 transition disabled:opacity-50">
               <span>{t.post}</span>
             </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-2">
        {loading && <div className="text-center text-slate-500 py-10 animate-pulse">{t.loading}</div>}
        {!loading && posts.map(post => {
          const profile = profiles[post.authorId];
          const isOwnPost = user?.id === post.authorId;
          const timeStr = post.createdAt ? new Date(post.createdAt.toMillis()).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Just now';

          return (
            <div key={post.id} className="bg-white dark:bg-slate-950 pt-3 pb-2 shadow-sm border-t border-b border-slate-300 dark:border-slate-800">
               <div className="flex justify-between items-start px-3 mb-2">
                   <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                           {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{profile?.name?.[0]}</div>}
                       </div>
                       <div>
                           <h4 className="font-bold text-slate-900 dark:text-white">{profile?.name || 'User'}</h4>
                           <span className="text-xs text-slate-500">{timeStr}</span>
                       </div>
                   </div>
                   {isOwnPost && (
                       <button onClick={() => handleDeletePost(post.id)} className="text-slate-400 hover:text-rose-500 p-2">
                           <Trash2 className="w-4 h-4" />
                       </button>
                   )}
               </div>

               <p className="text-slate-900 dark:text-slate-200 whitespace-pre-wrap px-3 text-[15px]">{post.content}</p>

               {post.imageUrl && (
                 <div className="mt-3">
                   <img src={post.imageUrl} alt="Post" className="w-full h-auto max-h-96 object-cover" />
                 </div>
               )}

               <div className="flex items-center justify-between text-xs text-slate-500 pt-2 pb-2 px-3 border-b border-slate-200 dark:border-slate-800 mt-1">
                   <div className="flex items-center gap-4">
                       <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-rose-500" /> {post.likesCount || 0}</span>
                       <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-blue-500" /> {post.commentsCount || 0}</span>
                   </div>
               </div>

               <div className="flex gap-1 pt-1 px-1">
                   <div className="relative group flex-1">
                       <div className="absolute bottom-full left-0 mb-2 w-max hidden group-hover:flex bg-white dark:bg-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-full px-2 py-1 gap-1 border border-slate-100 dark:border-slate-700 z-10 transition-all duration-200">
                           <button onClick={() => handleSetReaction(post.id, post.authorId, 'like')} className="p-2 hover:scale-125 hover:-translate-y-1 transition-all text-2xl" title="Like">👍</button>
                           <button onClick={() => handleSetReaction(post.id, post.authorId, 'love')} className="p-2 hover:scale-125 hover:-translate-y-1 transition-all text-2xl" title="Love">❤️</button>
                           <button onClick={() => handleSetReaction(post.id, post.authorId, 'wow')} className="p-2 hover:scale-125 hover:-translate-y-1 transition-all text-2xl" title="Wow">😲</button>
                           <button onClick={() => handleSetReaction(post.id, post.authorId, 'haha')} className="p-2 hover:scale-125 hover:-translate-y-1 transition-all text-2xl" title="Haha">😂</button>
                           <button onClick={() => handleSetReaction(post.id, post.authorId, 'angry')} className="p-2 hover:scale-125 hover:-translate-y-1 transition-all text-2xl" title="Angry">😡</button>
                       </div>
                       <button 
                           onClick={() => handleSetReaction(post.id, post.authorId, 'like')}
                           className={`w-full flex justify-center items-center gap-1.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-sm transition font-semibold text-sm ${userReactions[post.id] === 'love' ? 'text-rose-500' : userReactions[post.id] ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}
                       >
                           {userReactions[post.id] === 'like' && <span className="text-lg">👍</span>}
                           {userReactions[post.id] === 'love' && <span className="text-lg">❤️</span>}
                           {userReactions[post.id] === 'wow' && <span className="text-lg">😲</span>}
                           {userReactions[post.id] === 'haha' && <span className="text-lg">😂</span>}
                           {userReactions[post.id] === 'angry' && <span className="text-lg">😡</span>}
                           {!userReactions[post.id] && <Heart className="w-4 h-4" />}
                           <span>{userReactions[post.id] ? userReactions[post.id].charAt(0).toUpperCase() + userReactions[post.id].slice(1) : t.like}</span>
                       </button>
                   </div>
                   <button 
                       onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                       className="flex-1 flex justify-center items-center gap-1.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-sm transition font-semibold text-sm text-slate-600 dark:text-slate-400"
                   >
                       <MessageSquare className="w-4 h-4" /> {t.comment}
                   </button>
               </div>

               {showComments[post.id] && (
                   <PostComments postId={post.id} postAuthorId={post.authorId} />
               )}
            </div>
          );
        })}
        {!loading && posts.length === 0 && <div className="text-center text-slate-500 py-10">{t.noPosts}</div>}
      </div>
    </div>
  );
}
