import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMMUNITY_BUILDS } from '../data/hardwareData';
import { Heart, MessageSquare, Bookmark, Share2, Wrench, X, User } from 'lucide-react';

export default function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(COMMUNITY_BUILDS);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentsMap, setCommentsMap] = useState({
    'build-obsidian': [
      { user: 'RigMaster', text: 'This cable management is absolutely perfect. What custom combs did you use?' },
      { user: 'VoltHunter', text: 'Stunning RGB configuration! The Phanteks NV7 fits the triple slot Strix so cleanly.' }
    ],
    'build-stealth-amd': [
      { user: 'AMD_Fanboy', text: '7800X3D + 7900XTX is the absolute sweet spot for 1440p high-refresh gaming.' }
    ]
  });

  const handleLike = (id) => {
    setPosts(prev =>
      prev.map(post => {
        if (post.id === id) {
          const likedKey = `liked_${id}`;
          const isLiked = localStorage.getItem(likedKey);
          if (isLiked) {
            localStorage.removeItem(likedKey);
            return { ...post, likes: post.likes - 1 };
          } else {
            localStorage.setItem(likedKey, 'true');
            return { ...post, likes: post.likes + 1 };
          }
        }
        return post;
      })
    );
  };

  const handleClone = (specs) => {
    // Map specifications to builder format
    // specs are names, we need to map them to PRODUCTS objects
    import('../data/hardwareData').then(({ PRODUCTS }) => {
      const mappedBuild = {
        cpu: PRODUCTS.find(p => p.name === specs.cpu) || null,
        gpu: PRODUCTS.find(p => p.name === specs.gpu) || null,
        ram: PRODUCTS.find(p => p.name === specs.ram) || null,
        motherboard: PRODUCTS.find(p => p.name === specs.motherboard) || null,
        ssd: PRODUCTS.find(p => p.name === specs.storage) || null,
        psu: PRODUCTS.find(p => p.name === specs.psu) || null,
        case: PRODUCTS.find(p => p.name === specs.case) || null,
        cooler: PRODUCTS.find(p => p.name === specs.cooler) || null
      };
      localStorage.setItem('forge_current_build', JSON.stringify(mappedBuild));
      navigate('/builder');
    });
  };

  const openComments = (post) => {
    setSelectedPost(post);
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      user: 'You',
      text: commentInput.trim()
    };

    setCommentsMap(prev => ({
      ...prev,
      [selectedPost.id]: [...(prev[selectedPost.id] || []), newComment]
    }));

    // Update comment count on post card
    setPosts(prev =>
      prev.map(post =>
        post.id === selectedPost.id ? { ...post, comments: post.comments + 1 } : post
      )
    );

    setCommentInput('');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen">
      {/* Title */}
      <div className="mb-8 border-b border-white/5 pb-6 text-left">
        <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Enthusiasts Arena</span>
        <h1 className="text-3xl font-black text-white mt-1">Community Showcase</h1>
        <p className="text-slate-400 text-xs mt-2">Get inspired by builds curated by gamers, developers, and hardware customizers worldwide.</p>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="glass-panel rounded-3xl overflow-hidden flex flex-col hover:border-blue-500/30 transition-all duration-300 shadow-xl"
          >
            {/* Image banner */}
            <div className="h-64 relative bg-[#0F172A] overflow-hidden border-b border-white/5">
              <img
                src={post.imageUrl}
                alt={post.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
              
              <div className="absolute bottom-4 left-4 text-left">
                <span className="text-[10px] text-blue-450 uppercase tracking-widest font-mono">Build Rig</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{post.name}</h3>
                <p className="text-xs text-slate-300 mt-1">Shared by @{post.creator}</p>
              </div>

              <div className="absolute bottom-4 right-4 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/25">
                Est: ${post.budget.toFixed(2)}
              </div>
            </div>

            {/* Specs Summary */}
            <div className="p-6 flex-grow flex flex-col justify-between text-left">
              <div className="space-y-2 text-xs text-slate-400">
                <h4 className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Configuration Specs</h4>
                <p className="truncate">CPU: <strong className="text-slate-200">{post.specs.cpu}</strong></p>
                <p className="truncate">GPU: <strong className="text-slate-200">{post.specs.gpu}</strong></p>
                <p className="truncate">Motherboard: <strong className="text-slate-200">{post.specs.motherboard}</strong></p>
                <p className="truncate">Case: <strong className="text-slate-200">{post.specs.case}</strong></p>
              </div>

              {/* Action row */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() => openComments(post)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>{post.comments} Comments</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleClone(post.specs)}
                    className="bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Clone Rig
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comments Drawer / Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
          <div className="relative bg-[#1E293B] border border-white/10 max-w-lg w-full rounded-2xl p-6 text-left shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Rig Comments</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">@{selectedPost.creator}'s {selectedPost.name}</p>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar text-xs">
              {(commentsMap[selectedPost.id] || []).length === 0 ? (
                <p className="text-slate-500 text-center py-6">No comments posted yet. Be the first!</p>
              ) : (
                (commentsMap[selectedPost.id] || []).map((comment, i) => (
                  <div key={i} className="bg-[#0F172A] border border-white/5 p-3 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <User className="w-3.5 h-3.5" />
                      <span>{comment.user}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5">{comment.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Form */}
            <form onSubmit={handlePostComment} className="flex border-t border-white/5 pt-4 mt-4">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Post a comment..."
                className="flex-1 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase px-4 py-2 rounded-xl cursor-pointer"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
