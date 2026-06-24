import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMMUNITY_BUILDS, PRODUCTS } from '../data/hardwareData';
import { Heart, MessageSquare, Bookmark, Share2, Wrench, X, User, PlusCircle, AlertCircle, Sparkles } from 'lucide-react';

const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'mock_token_success') return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).id;
  } catch (err) {
    return null;
  }
};

const getSavedBuildsKey = () => {
  const userId = getUserIdFromToken();
  return userId ? `forge_saved_builds_${userId}` : 'forge_saved_builds_guest';
};

export default function Community() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(COMMUNITY_BUILDS);
  const [productsList, setProductsList] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  
  const currentUserId = getUserIdFromToken();
  
  // Showcase Share Form States
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [selectedBuildId, setSelectedBuildId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPurpose, setFormPurpose] = useState('Gaming');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=600&auto=format&fit=crop');
  const [formTags, setFormTags] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const [commentsMap, setCommentsMap] = useState({
    'build-obsidian': [
      { user: 'RigMaster', text: 'This cable management is absolutely perfect. What custom combs did you use?' },
      { user: 'VoltHunter', text: 'Stunning RGB configuration! The Phanteks NV7 fits the triple slot Strix so cleanly.' }
    ],
    'build-stealth-amd': [
      { user: 'AMD_Fanboy', text: '7800X3D + 7900XTX is the absolute sweet spot for 1440p high-refresh gaming.' }
    ]
  });

  useEffect(() => {
    const fetchCommunityBuilds = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token && token !== 'mock_token_success') {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('/api/products/community-builds', { headers });
        const data = await res.json();
        if (data.success && data.communityBuilds && data.communityBuilds.length > 0) {
          const mappedBuilds = data.communityBuilds.map(b => ({
            ...b,
            id: b.id || b._id
          }));
          setPosts(mappedBuilds);
        }
      } catch (err) {
        console.warn('Offline, using local community builds.');
      }
    };

    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=100');
        const data = await res.json();
        if (data.success && data.products && data.products.length > 0) {
          const mappedProds = data.products.map(p => ({
            ...p,
            id: p.id || p._id
          }));
          setProductsList(mappedProds);
        }
      } catch (err) {
        console.warn('Offline, using local products list.');
      }
    };

    fetchCommunityBuilds();
    fetchProducts();
  }, []);

  const handleLike = async (id) => {
    const token = localStorage.getItem('token');
    
    if (token && token !== 'mock_token_success') {
      try {
        const res = await fetch(`/api/community-builds/${id}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setPosts(prev =>
            prev.map(post => {
              if (post.id === id) {
                const likedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
                if (data.liked) {
                  if (currentUserId && !likedBy.includes(currentUserId)) {
                    likedBy.push(currentUserId);
                  }
                } else {
                  if (currentUserId) {
                    const idx = likedBy.indexOf(currentUserId);
                    if (idx > -1) likedBy.splice(idx, 1);
                  }
                }
                return { ...post, likes: data.likesCount, likedBy };
              }
              return post;
            })
          );
          return;
        }
      } catch (err) {
        console.error('Error toggling like:', err);
      }
    }

    // Local state fallback
    const likedKey = `liked_${id}`;
    const isLiked = localStorage.getItem(likedKey);
    if (isLiked) {
      localStorage.removeItem(likedKey);
      setPosts(prev =>
        prev.map(post => post.id === id ? { ...post, likes: post.likes - 1 } : post)
      );
    } else {
      localStorage.setItem(likedKey, 'true');
      setPosts(prev =>
        prev.map(post => post.id === id ? { ...post, likes: post.likes + 1 } : post)
      );
    }
  };

  const handleClone = async (postItem) => {
    const token = localStorage.getItem('token');
    
    // Trace clone count on database if logged in
    if (token && token !== 'mock_token_success') {
      try {
        await fetch(`/api/community-builds/${postItem.id}/clone`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (e) {
        console.error('Failed to log clone action:', e);
      }
    }

    const listToSearch = productsList.length > 0 ? productsList : PRODUCTS;
    const specs = postItem.specs;
    
    const mappedBuild = {
      cpu: listToSearch.find(p => p.name === specs.cpu) || null,
      gpu: listToSearch.find(p => p.name === specs.gpu) || null,
      ram: listToSearch.find(p => p.name === specs.ram) || null,
      motherboard: listToSearch.find(p => p.name === specs.motherboard) || null,
      ssd: listToSearch.find(p => p.name === specs.storage) || null,
      psu: listToSearch.find(p => p.name === specs.psu) || null,
      case: listToSearch.find(p => p.name === specs.case) || null,
      cooler: listToSearch.find(p => p.name === specs.cooler) || null
    };

    localStorage.setItem('forge_current_build', JSON.stringify(mappedBuild));
    navigate('/builder');
  };
  const openComments = async (post) => {
    setSelectedPost(post);
    if (String(post.id).startsWith('build-')) {
      return;
    }
    try {
      const res = await fetch(`/api/community-builds/${post.id}/comments`);
      const data = await res.json();
      if (data.success && data.comments) {
        const mappedComments = data.comments.map(c => ({
          user: c.author?.name || c.usernameSnapshot || 'Builder',
          text: c.content
        }));
        setCommentsMap(prev => ({
          ...prev,
          [post.id]: mappedComments
        }));
      }
    } catch (err) {
      console.warn('Could not load comments from API, using local memory comments.');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const token = localStorage.getItem('token');
    if (token && token !== 'mock_token_success' && !String(selectedPost.id).startsWith('build-')) {
      try {
        const res = await fetch(`/api/community-builds/${selectedPost.id}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: commentInput.trim() })
        });
        const data = await res.json();
        if (data.success && data.comment) {
          const newComment = {
            user: data.comment.author?.name || 'You',
            text: data.comment.content
          };
          setCommentsMap(prev => ({
            ...prev,
            [selectedPost.id]: [...(prev[selectedPost.id] || []), newComment]
          }));
          setPosts(prev =>
            prev.map(post => post.id === selectedPost.id ? { ...post, comments: post.comments + 1 } : post)
          );
          setCommentInput('');
          return;
        }
      } catch (err) {
        console.error('Error posting comment:', err);
      }
    }

    const newComment = {
      user: 'You',
      text: commentInput.trim()
    };

    setCommentsMap(prev => ({
      ...prev,
      [selectedPost.id]: [...(prev[selectedPost.id] || []), newComment]
    }));

    setPosts(prev =>
      prev.map(post =>
        post.id === selectedPost.id ? { ...post, comments: post.comments + 1 } : post
      )
    );

    setCommentInput('');
  };

  const handleOpenShareModal = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in first to share your PC build with the community!');
      navigate('/login');
      return;
    }

    // Load saved builds from local storage
    const buildsKey = getSavedBuildsKey();
    const stored = localStorage.getItem(buildsKey);
    const parsed = stored ? JSON.parse(stored) : [];
    
    // Filter builds that have all 8 slots selected
    const completeBuilds = parsed.filter(b => {
      const raw = b.rawBuild;
      return raw && raw.cpu && raw.gpu && raw.motherboard && raw.ram && raw.ssd && raw.psu && raw.case && raw.cooler;
    });

    setSavedBuilds(completeBuilds);
    setShowShareModal(true);
    setFormError('');
    setFormSuccess(false);
  };

  const handleSubmitShareBuild = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedBuildId) {
      setFormError('Please select a saved PC build configuration.');
      return;
    }

    if (!formName.trim()) {
      setFormError('Please enter a name for your build post.');
      return;
    }

    if (!formDesc.trim()) {
      setFormError('Please enter a description for your build.');
      return;
    }

    const selectedBuild = savedBuilds.find(b => b.id === selectedBuildId);
    if (!selectedBuild) {
      setFormError('Selected build configuration not found.');
      return;
    }

    // Map component objects to database product IDs
    const raw = selectedBuild.rawBuild;
    const specsPayload = {
      cpu: raw.cpu.id || raw.cpu._id,
      gpu: raw.gpu.id || raw.gpu._id,
      motherboard: raw.motherboard.id || raw.motherboard._id,
      ram: raw.ram.id || raw.ram._id,
      storage: raw.ssd.id || raw.ssd._id,
      cooler: raw.cooler.id || raw.cooler._id,
      psu: raw.psu.id || raw.psu._id,
      case: raw.case.id || raw.case._id
    };

    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/community-builds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          buildName: formName.trim(),
          buildDescription: formDesc.trim(),
          buildPurpose: formPurpose,
          coverImage: formImage,
          tags: formTags.split(',').map(t => t.trim()).filter(t => t.length > 0),
          specs: specsPayload
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to publish post.');
      }

      setFormSuccess(true);
      
      // Map returned build and add to posts listing
      const newPost = {
        ...data.communityBuild,
        id: data.communityBuild.id || data.communityBuild._id
      };
      setPosts(prev => [newPost, ...prev]);

      setTimeout(() => {
        setShowShareModal(false);
        setFormName('');
        setFormDesc('');
        setSelectedBuildId('');
        setFormTags('');
      }, 1500);

    } catch (err) {
      setFormError(err.message || 'An error occurred while publishing your post.');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen">
      {/* Title & Action */}
      <div className="mb-8 border-b border-white/5 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-left">
        <div>
          <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Enthusiasts Arena</span>
          <h1 className="text-3xl font-black text-white mt-1">Community Showcase</h1>
          <p className="text-slate-400 text-xs mt-2">Get inspired by builds curated by gamers, developers, and hardware customizers worldwide.</p>
        </div>
        <button
          onClick={handleOpenShareModal}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-lg shadow-blue-550/20 hover:scale-102"
        >
          <PlusCircle className="w-4 h-4" />
          Share Your Build
        </button>
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
                Est: ₹{post.budget ? post.budget.toLocaleString('en-IN') : '0'}
              </div>
            </div>

            {/* Specs Summary */}
            <div className="p-6 flex-grow flex flex-col justify-between text-left">
              <div className="space-y-2 text-xs text-slate-400">
                <h4 className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-1">Configuration Specs</h4>
                <p className="truncate">CPU: <strong className="text-slate-200">{post.specs?.cpu}</strong></p>
                <p className="truncate">GPU: <strong className="text-slate-200">{post.specs?.gpu}</strong></p>
                <p className="truncate">Motherboard: <strong className="text-slate-200">{post.specs?.motherboard}</strong></p>
                <p className="truncate">Case: <strong className="text-slate-200">{post.specs?.case}</strong></p>
              </div>

              {/* Action row */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      (currentUserId
                        ? Array.isArray(post.likedBy) && post.likedBy.includes(currentUserId)
                        : localStorage.getItem(`liked_${post.id}`))
                        ? 'text-red-500 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 transition-all ${
                        (currentUserId
                          ? Array.isArray(post.likedBy) && post.likedBy.includes(currentUserId)
                          : localStorage.getItem(`liked_${post.id}`))
                          ? 'text-red-500 fill-red-500'
                          : 'text-slate-400 fill-none'
                      }`}
                    />
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
                    onClick={() => handleClone(post)}
                    className="bg-blue-500/10 hover:bg-blue-505 text-blue-400 hover:text-white px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
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

      {/* Share Build Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-[#1E293B] border border-white/10 max-w-xl w-full rounded-2xl p-6 text-left shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Share Your Hardware Masterpiece</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto text-xl font-bold">✓</div>
                <h4 className="font-bold text-white text-sm">Build Shared Successfully!</h4>
                <p className="text-xs text-slate-400">Your configuration is now listed on the Community Showcase page.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitShareBuild} className="space-y-4 text-xs">
                {formError && (
                  <div className="bg-red-500/10 border border-red-550/20 text-red-400 p-3 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Selection of Saved Configuration */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-bold">Select Saved PC Configuration</label>
                  {savedBuilds.length === 0 ? (
                    <div className="p-3 bg-[#0F172A] border border-white/5 rounded-xl text-slate-400 text-center">
                      No complete PC configuration found in profile. <br />
                      <span className="text-[10px] text-blue-400">Ensure all 8 components are selected in the PC Builder and click "Save Configuration" first.</span>
                    </div>
                  ) : (
                    <select
                      value={selectedBuildId}
                      onChange={(e) => {
                        setSelectedBuildId(e.target.value);
                        const b = savedBuilds.find(x => x.id === e.target.value);
                        if (b) setFormName(b.name);
                      }}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Choose a configuration --</option>
                      {savedBuilds.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name} (₹{b.budget.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* 2. Build Name */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-bold">Showcase Build Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Project Whiteout, RGB Storm..."
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 3. Description */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-bold">Description / Motivation</label>
                  <textarea
                    rows="3"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Tell the community about your aesthetic theme, cooling setup, cable management choices, or target framerates..."
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* 4. Purpose & Cover preset */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold">Primary Build Purpose</label>
                    <select
                      value={formPurpose}
                      onChange={(e) => setFormPurpose(e.target.value)}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Gaming">Gaming</option>
                      <option value="Streaming">Streaming</option>
                      <option value="Competitive Esports">Competitive Esports</option>
                      <option value="Content Creation">Content Creation</option>
                      <option value="Video Editing">Video Editing</option>
                      <option value="AI / ML">AI / ML</option>
                      <option value="Programming">Programming</option>
                      <option value="Budget Build">Budget Build</option>
                      <option value="Workstation">Workstation</option>
                      <option value="Home Server">Home Server</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-slate-300 font-bold">Showcase Banner Style</label>
                    <select
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="https://cdn.leonardo.ai/users/b4efb42a-e7ed-47a3-b695-e6df11a1b1bc/generations/46d56a86-a83a-47ec-ac5a-ba35d0b6bd31/Leonardo_Kino_XL_A_hyperrealistic_fullbody_shot_of_a_hightech_1.jpg">Obsidian Stealth (Dark)</option>
                      <option value="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKKyKRajpEm6RBRHQYFCXVd9pkspbGm6_CUJpE5Rgq0bVQvd3qHNkgPGU&s=10">Stealth AMD (AMD Theme)</option>
                      <option value="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbY_HPNOdzt6nLL4M3PDJ65sAF-WYsFs-hQZTQWZg9JI0teGqjwM3srOw&s=10">Cyberpunk Neon (RGB)</option>
                      <option value="https://img.magnific.com/free-vector/night-landscape-with-lake-mountains-trees-coast-vector-cartoon-illustration-nature-scene-with-coniferous-forest-river-shore-rocks-moon-stars-dark-sky_107791-8253.jpg?semt=ais_hybrid&w=740&q=80">Frozen Blizzard (White/Ice)</option>
                    </select>
                  </div>
                </div>

                {/* 5. Tags */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-bold">Aesthetic Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="e.g. RGB, Watercooled, Minimalist, WhiteBuild"
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* 6. Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="bg-white/5 hover:bg-white/10 text-slate-350 font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savedBuilds.length === 0}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-xl cursor-pointer transition-all"
                  >
                    Publish Post
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Comments Drawer / Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
          <div className="relative bg-[#1E293B] border border-white/10 max-w-lg w-full rounded-2xl p-6 text-left shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Rig Comments</h3>
                <p className="text-[10px] text-slate-550 mt-0.5">@{selectedPost.creator}'s {selectedPost.name}</p>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-450 hover:text-white cursor-pointer"
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
                className="flex-1 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
