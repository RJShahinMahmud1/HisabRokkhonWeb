import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store';
import { subscribeToNewsfeed, createPost, deletePost, toggleLike, SocialPost, subscribeToUserReactions } from '../../lib/socialService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Heart, MessageSquare, Trash2, Send, Image as ImageIcon, X, ThumbsUp, Search, User, EyeOff } from 'lucide-react';
import { searchUsers, PublicProfile } from '../../lib/chatService';
import { PostComments } from './PostComments';
import { compressImage } from '../../lib/utils';
import { ReactionsListModal } from '../../components/ReactionsListModal';

export function NewsfeedView({ onViewProfile }: { onViewProfile?: (userId: string) => void } = {}) {
  const { user, lang } = useAppStore();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [showReactionsForPostId, setShowReactionsForPostId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [newPostContent, setNewPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleReactionTouchStart = (postId: string) => {
    timerRef.current = setTimeout(() => {
      setActiveReactionPostId(postId);
    }, 400); // 400ms long press
  };

  const handleReactionTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    const handleGlobalClick = () => {
      if (activeReactionPostId) setActiveReactionPostId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [activeReactionPostId]);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingUsers, setMatchingUsers] = useState<PublicProfile[]>([]);
  const [searchActiveTab, setSearchActiveTab] = useState<'posts' | 'people'>('posts');
  const [searchingUsersNow, setSearchingUsersNow] = useState(false);
  const [hiddenPosts, setHiddenPosts] = useState<Set<string>>(new Set());

  // Debounced user search
  useEffect(() => {
    if (!searchQuery) {
      setMatchingUsers([]);
      return;
    }
    
    setSearchingUsersNow(true);
    const triggerSearch = async () => {
      try {
        const results = await searchUsers(searchQuery, user?.id || '');
        setMatchingUsers(results);
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setSearchingUsersNow(false);
      }
    };

    const timer = setTimeout(() => {
      triggerSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user?.id]);

  // Filter posts
  const filteredPosts = posts.filter(post => {
    if (hiddenPosts.has(post.id)) return false;
    const contentMatch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const authorProfile = profiles[post.authorId];
    const nameMatch = authorProfile?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const usernameMatch = authorProfile?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return contentMatch || nameMatch || usernameMatch;
  });

  const shownPosts = searchQuery ? filteredPosts : posts.filter(post => !hiddenPosts.has(post.id));

  const handleHidePost = (postId: string) => {
    setHiddenPosts(prev => new Set(prev).add(postId));
  };

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
    setActiveReactionPostId(null);
    await toggleLike(postId, user.id, authorId, type);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 pb-20 min-h-screen">
      {/* Dynamic Search Header */}
      <div className="bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-xl px-4 py-3 shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-20">
        <div className="relative max-w-2xl mx-auto">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'bn' ? 'পোস্ট বা বন্ধু খুঁজুন...' : 'Search posts or friends...'}
            className="w-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 pl-10 pr-10 py-2.5 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/30 border border-transparent focus:border-blue-500/50 transition-all text-[15px] font-medium"
            id="newsfeed_search_input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              id="clear_search_btn"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Search Results Filter Tabs */}
        {searchQuery && (
          <div className="flex justify-center gap-6 mt-3 border-t border-slate-100/50 dark:border-slate-800/50 pt-3 select-none max-w-2xl mx-auto">
            <button
              onClick={() => setSearchActiveTab('posts')}
              className={`pb-1.5 text-sm font-bold transition-all relative ${
                searchActiveTab === 'posts'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
              id="search_tab_posts_btn"
            >
              {lang === 'bn' ? `পোস্টসমূহ (${filteredPosts.length})` : `Posts (${filteredPosts.length})`}
              {searchActiveTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setSearchActiveTab('people')}
              className={`pb-1.5 text-sm font-bold transition-all relative ${
                searchActiveTab === 'people'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
              id="search_tab_people_btn"
            >
              {lang === 'bn' ? `বন্ধু/মানুষ (${matchingUsers.length})` : `Friends/People (${matchingUsers.length})`}
              {searchActiveTab === 'people' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
              )}
            </button>
          </div>
        )}
      </div>
      {/* Create Post (only when not searching) */}
      {!searchQuery && (
      <div className="bg-white dark:bg-slate-950 px-4 py-4 shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 mb-3">
        <form onSubmit={handleCreatePost} className="flex flex-col gap-3 max-w-2xl mx-auto">
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
      )}

      {/* Feed / Search Results */}
      <div className="flex flex-col gap-2">
        {loading && <div className="text-center text-slate-500 py-10 animate-pulse">{t.loading}</div>}

        {/* If searching people/friends */}
        {searchQuery && searchActiveTab === 'people' && !loading && (
          <div className="p-2 space-y-2">
            {searchingUsersNow ? (
              <div className="text-center text-slate-500 py-6 animate-pulse">
                {lang === 'bn' ? 'খোঁজা হচ্ছে...' : 'Searching...'}
              </div>
            ) : matchingUsers.length === 0 ? (
              <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500">
                {lang === 'bn' ? 'কোনো বন্ধু পাওয়া যায়নি!' : 'No friends found!'}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 divide-y divide-slate-100 dark:divide-slate-900">
                {matchingUsers.map((item) => (
                  <div
                    key={item.uid}
                    onClick={() => onViewProfile?.(item.uid)}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer rounded-xl transition"
                    id={`search_profile_item_${item.uid}`}
                  >
                    <div className="w-11 h-11 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-150 dark:border-slate-800">
                      {item.avatarUrl ? (
                        <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-[14px] truncate leading-tight">
                        {item.name}
                      </h4>
                      {item.username && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">
                          @{item.username}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProfile?.(item.uid);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-full transition"
                      id={`view_searched_profile_${item.uid}`}
                    >
                      {lang === 'bn' ? 'প্রোফাইল' : 'Profile'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Regular Posts or Searched Posts list */}
        {(!searchQuery || searchActiveTab === 'posts') && !loading && shownPosts.map(post => {
          const profile = profiles[post.authorId];
          const isOwnPost = user?.id === post.authorId;
          const timeStr = post.createdAt ? new Date(post.createdAt.toMillis()).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Just now';

          return (
            <div key={post.id} className="bg-white dark:bg-slate-950 pt-3 pb-2 shadow-sm border-t border-b border-slate-300 dark:border-slate-800">
               <div className="flex justify-between items-start px-3 mb-2">
                   <div 
                       onClick={() => onViewProfile?.(post.authorId)}
                       className="flex items-center gap-3 cursor-pointer group"
                   >
                       <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 group-hover:opacity-95 transition-opacity">
                           {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">{profile?.name?.[0]}</div>}
                       </div>
                       <div>
                           <h4 className="font-bold text-slate-900 dark:text-white group-hover:underline">{profile?.name || 'User'}</h4>
                           <span className="text-xs text-slate-500">{timeStr}</span>
                       </div>
                   </div>
                   <div className="flex gap-2">
                       {!isOwnPost && (
                           <button onClick={() => handleHidePost(post.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 transition">
                               <EyeOff className="w-4 h-4" />
                           </button>
                       )}
                       {isOwnPost && (
                           <button onClick={() => handleDeletePost(post.id)} className="text-slate-400 hover:text-rose-500 p-2">
                               <Trash2 className="w-4 h-4" />
                           </button>
                       )}
                   </div>
               </div>

               <p className="text-slate-900 dark:text-slate-200 whitespace-pre-wrap px-3 text-[15px]">{post.content}</p>

               {post.imageUrl && (
                 <div className="mt-3">
                   <img src={post.imageUrl} alt="Post" className="w-full h-auto max-h-96 object-cover" />
                 </div>
               )}

               <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 pb-2 px-3 border-b border-slate-200 dark:border-slate-800 mt-1 select-none">
                     <div 
                         onClick={() => post.likesCount > 0 && setShowReactionsForPostId(post.id)}
                         className={`flex items-center gap-1.5 ${post.likesCount > 0 ? 'cursor-pointer hover:underline hover:text-blue-600 dark:hover:text-blue-400' : ''}`}
                         id={`reaction_summary_trigger_${post.id}`}
                     >
                        {post.likesCount > 0 ? (
                            <div className="flex items-center">
                                <div className="flex -space-x-1 mr-1.5">
                                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white shadow-sm border border-white dark:border-slate-900 z-[3]">👍</div>
                                    <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white shadow-sm border border-white dark:border-slate-900 z-[2]">❤️</div>
                                    <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-[10px] text-white shadow-sm border border-white dark:border-slate-900 z-[1]">😲</div>
                                </div>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{post.likesCount}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-slate-400">
                                <span>👍</span>
                                <span className="font-bold">0</span>
                            </div>
                        )}
                    </div>
                    <div className="font-bold text-slate-500 dark:text-slate-400">
                        {post.commentsCount || 0} {lang === 'bn' ? 'কমেন্ট' : 'comments'}
                    </div>
                </div>

                <div className="flex gap-2 pt-2 px-3 pb-2 select-none">
                    <div className="relative group flex-1">
                        <div className={`absolute bottom-full left-0 mb-2 w-max ${activeReactionPostId === post.id ? 'flex' : 'hidden group-hover:flex'} bg-white dark:bg-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.15)] rounded-full px-2 py-1 gap-1.5 border border-slate-200 dark:border-slate-700 z-10 transition-all duration-200 scale-100 origin-bottom`}>
                            <button onClick={(e) => { e.stopPropagation(); handleSetReaction(post.id, post.authorId, 'like'); }} className="p-1.5 hover:scale-130 hover:-translate-y-1.5 transition-all text-2xl" id="react_btn_like">👍</button>
                            <button onClick={(e) => { e.stopPropagation(); handleSetReaction(post.id, post.authorId, 'love'); }} className="p-1.5 hover:scale-130 hover:-translate-y-1.5 transition-all text-2xl" id="react_btn_love">❤️</button>
                            <button onClick={(e) => { e.stopPropagation(); handleSetReaction(post.id, post.authorId, 'wow'); }} className="p-1.5 hover:scale-130 hover:-translate-y-1.5 transition-all text-2xl" id="react_btn_wow">😲</button>
                            <button onClick={(e) => { e.stopPropagation(); handleSetReaction(post.id, post.authorId, 'haha'); }} className="p-1.5 hover:scale-130 hover:-translate-y-1.5 transition-all text-2xl" id="react_btn_haha">😂</button>
                            <button onClick={(e) => { e.stopPropagation(); handleSetReaction(post.id, post.authorId, 'angry'); }} className="p-1.5 hover:scale-130 hover:-translate-y-1.5 transition-all text-2xl" id="react_btn_angry">😡</button>
                        </div>
                        <button 
                            onTouchStart={() => handleReactionTouchStart(post.id)}
                            onTouchEnd={handleReactionTouchEnd}
                            onTouchCancel={handleReactionTouchEnd}
                            onContextMenu={(e) => {
                                if (('ontouchstart' in window) || navigator.maxTouchPoints > 0) {
                                    e.preventDefault();
                                }
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (activeReactionPostId === post.id) {
                                    setActiveReactionPostId(null);
                                    e.preventDefault();
                                    return;
                                }
                                handleSetReaction(post.id, post.authorId, 'like');
                            }}
                            className={`w-full flex justify-center items-center gap-2 py-2 px-4 rounded-full transition-all font-bold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 shadow-sm ${userReactions[post.id] === 'love' ? 'text-rose-500' : userReactions[post.id] ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300'}`}
                            id="like_pill_btn"
                        >
                            {userReactions[post.id] === 'like' && <span className="text-base select-none">👍</span>}
                            {userReactions[post.id] === 'love' && <span className="text-base select-none">❤️</span>}
                            {userReactions[post.id] === 'wow' && <span className="text-base select-none">😲</span>}
                            {userReactions[post.id] === 'haha' && <span className="text-base select-none">😂</span>}
                            {userReactions[post.id] === 'angry' && <span className="text-base select-none">😡</span>}
                            {!userReactions[post.id] && <ThumbsUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />}
                            <span>{post.likesCount || 0}</span>
                        </button>
                    </div>
                    <button 
                        onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                        className="flex-1 flex justify-center items-center gap-2 py-2 px-4 rounded-full transition-all font-bold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 shadow-sm"
                        id="comment_pill_btn"
                    >
                        <MessageSquare className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>{post.commentsCount || 0}</span>
                    </button>
                </div>

                {showComments[post.id] && (
                   <PostComments postId={post.id} postAuthorId={post.authorId} onUserClick={onViewProfile} />
               )}
            </div>
          );
        })}
        {!loading && (!searchQuery || searchActiveTab === 'posts') && shownPosts.length === 0 && (
          <div className="text-center text-slate-500 py-12 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 m-2">
            {lang === 'bn' ? 'কোনো পোস্ট পাওয়া যায়নি' : 'No posts match your search'}
          </div>
        )}
      </div>

      {showReactionsForPostId && (
        <ReactionsListModal
          postId={showReactionsForPostId}
          onClose={() => setShowReactionsForPostId(null)}
          onUserClick={onViewProfile}
        />
      )}
    </div>
  );
}
