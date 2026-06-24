import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, CreditCard, ShoppingBag, Settings, LayoutDashboard, Heart, Wrench, ShieldCheck, Award, Users, Star } from 'lucide-react';

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

export default function Profile() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePicture: '',
    bio: '',
    followersCount: 0,
    followingCount: 0,
    showcasePostsCount: 0,
    totalLikesReceived: 0,
    reputationScore: 0,
    isVerifiedBuilder: false
  });
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    profilePicture: '',
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Saved Builds list from localStorage
  const [savedBuilds, setSavedBuilds] = useState([]);

  useEffect(() => {
    // Load local builds
    try {
      const buildsKey = getSavedBuildsKey();
      
      // Migrate legacy shared 'forge_saved_builds' to user-scoped slot if present
      const legacyBuilds = localStorage.getItem('forge_saved_builds');
      if (legacyBuilds) {
        const targetStored = localStorage.getItem(buildsKey);
        let targetBuilds = targetStored ? JSON.parse(targetStored) : [];
        const parsedLegacy = JSON.parse(legacyBuilds);
        if (Array.isArray(parsedLegacy)) {
          parsedLegacy.forEach(legacyBuild => {
            if (legacyBuild && legacyBuild.id) {
              const exists = targetBuilds.some(tb => tb.id === legacyBuild.id);
              if (!exists) {
                targetBuilds.push(legacyBuild);
              }
            }
          });
          localStorage.setItem(buildsKey, JSON.stringify(targetBuilds));
        }
        localStorage.removeItem('forge_saved_builds');
      }

      const storedBuilds = localStorage.getItem(buildsKey);
      if (storedBuilds) {
        const parsed = JSON.parse(storedBuilds);
        const cleaned = parsed.filter(b => b && b.id && !String(b.id).startsWith('preseed'));
        setSavedBuilds(cleaned);
      } else {
        setSavedBuilds([]);
      }
      
      const storedOrders = localStorage.getItem('forge_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
    } catch (e) {
      console.error(e);
    }

    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setIsLoading(true);
        const profileRes = await fetch(`/api/users/profile?_cb=${Date.now()}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const profileData = await profileRes.json();

        if (profileData.success && profileData.data && profileData.data.user) {
          const fetchedUser = profileData.data.user;
          // Apply fallback mock details for any missing db fields
          setUser({
            ...fetchedUser,
            profilePicture: fetchedUser.profilePicture || '',
            bio: fetchedUser.bio || '',
            followersCount: fetchedUser.followersCount || 0,
            followingCount: fetchedUser.followingCount || 0,
            showcasePostsCount: fetchedUser.showcasePostsCount || 0,
            totalLikesReceived: fetchedUser.totalLikesReceived || 0,
            reputationScore: fetchedUser.reputationScore || 0,
            isVerifiedBuilder: fetchedUser.isVerifiedBuilder || false
          });
          
          setEditForm({
            name: fetchedUser.name || '',
            phone: fetchedUser.phone || '',
            address: fetchedUser.address || '',
            profilePicture: fetchedUser.profilePicture || '',
            bio: fetchedUser.bio || ''
          });
        }

        const ordersRes = await fetch('/api/orders/myorders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        if (ordersData.success && ordersData.data && ordersData.data.orders) {
          setOrders(ordersData.data.orders);
        }
      } catch (err) {
        console.error('API failed, loaded mock fallback data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleOpenEditModal = () => {
    setEditForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      profilePicture: user.profilePicture ,
      bio: user.bio 
    });
    setIsEditing(true);
    setError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token || token === 'mock_token_success') {
      // Offline / Mock mode fallback save
      setUser(prev => ({ ...prev, ...editForm }));
      setIsSaving(false);
      setIsEditing(false);
      return;
    }

    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (data.success && data.data && data.data.user) {
        const updatedUser = data.data.user;
        setUser(prev => ({
          ...prev,
          ...updatedUser
        }));
        setIsEditing(false);
      } else {
        setError(data.message || 'Failed to update details.');
      }
    } catch (err) {
      setError('Network error, saved locally.');
      setUser(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || order.totalPrice || 0), 0);
  const pendingCount = orders.filter(o => ['Pending', 'Paid', 'Shipped'].includes(o.status || o.orderStatus)).length;
  const deliveredCount = orders.filter(o => (o.status || o.orderStatus) === 'Delivered').length;

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen text-left">
      {/* Title */}
      <div className="mb-6 border-b border-white/5 pb-4">
        <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Member Center</span>
        <h1 className="text-3xl font-black text-white mt-1">User Profile</h1>
      </div>

      {/* Profile Header Card */}
      <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-[#1E293B] shadow-xl mb-8 p-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-left">
            {/* Avatar picture */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border border-white/10 bg-slate-950 shadow-2xl flex-shrink-0 flex items-center justify-center">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-3xl font-black uppercase">
                  {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </div>
            {/* Profile detail text */}
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-1.5">
                <h2 className="text-2xl font-black text-white">{user.name}</h2>
                {user.isVerifiedBuilder && (
                  <div className="relative group cursor-pointer" title="Verified BuildForge Custom Builder">
                    <ShieldCheck className="w-5 h-5 text-blue-400 fill-blue-500/20" />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
              <p className="text-xs text-slate-300 max-w-lg mt-2 leading-relaxed">{user.bio}</p>
              
              {/* Followers info */}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-3 pt-2 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> <strong>{user.followersCount}</strong> Followers</span>
                <span>•</span>
                <span><strong>{user.followingCount}</strong> Following</span>
              </div>
            </div>
          </div>

          {/* Action button row */}
          <div className="flex gap-2 self-center md:self-end">
            <button
              onClick={handleOpenEditModal}
              className="bg-[#1E293B] border border-white/10 hover:bg-white/5 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer shadow-md"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Stats */}
        <section className="lg:col-span-4 space-y-6">
          {/* Showcase Stats card */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <Award className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-sm text-white">Community Showcase Stats</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-[#0F172A] border border-white/5 p-4 rounded-xl">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Reputation Score</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                  <span className="text-lg font-black text-white font-mono">{user.reputationScore}</span>
                </div>
              </div>

              <div className="bg-[#0F172A] border border-white/5 p-4 rounded-xl">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Showcases Posted</span>
                <span className="text-lg font-black text-white font-mono block mt-1">{user.showcasePostsCount}</span>
              </div>

              <div className="bg-[#0F172A] border border-white/5 p-4 rounded-xl col-span-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Total Likes Received</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                  <span className="text-lg font-black text-white font-mono">{user.totalLikesReceived}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personal details info */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <User className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Shipping Information</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Receiver Name</span>
                <span className="text-slate-200 font-bold block mt-0.5">{user.name}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Phone Contact</span>
                <span className="text-slate-200 font-bold block mt-0.5">{user.phone}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Default Address</span>
                <span className="text-slate-200 font-semibold block mt-0.5 leading-relaxed">{user.address}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Content */}
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-550/20 rounded-xl text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Procurement Stat Counters */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-blue-500">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Total Procurement</span>
              <span className="text-lg font-black text-white font-mono block mt-1">₹{totalSpent.toLocaleString('en-IN')}</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-purple-500">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Pending Orders</span>
              <span className="text-lg font-black text-white font-mono block mt-1">{pendingCount} systems</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-green-500">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Delivered Systems</span>
              <span className="text-lg font-black text-white font-mono block mt-1">{deliveredCount} rigs</span>
            </div>
          </section>

          {/* Saved Builds Grid Link */}
          <section className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <h3 className="font-bold text-sm text-white">Your Saved Configurations</h3>
              <Link to="/saved-builds" className="text-xs text-blue-400 hover:underline font-bold">
                View All Configurations
              </Link>
            </div>
            {savedBuilds.length === 0 ? (
              <div className="text-center py-6 text-slate-550 text-xs">
                You haven't saved any customized builds yet. Open the <Link to="/builder" className="text-blue-400 underline">Builder</Link> page to save.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedBuilds.slice(0, 2).map((build) => (
                  <div key={build.id} className="bg-[#0F172A] border border-white/5 rounded-xl p-4 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{build.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Budget: ₹{build.budget.toLocaleString('en-IN')} | Score: {build.compatibilityScore}%</p>
                    </div>
                    <Link
                      to={`/builder?clone=${build.id.startsWith('preseed') ? build.id : ''}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Load
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Orders list */}
          <section className="glass-panel rounded-2xl overflow-hidden text-xs">
            <div className="p-6 border-b border-white/5">
              <h3 className="font-bold text-sm text-white">Recent Orders</h3>
            </div>
            <div className="overflow-x-auto">
              {orders.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No orders placed yet.</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#0F172A] border-b border-white/5 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-350 font-mono">
                    {orders.map((o) => {
                      const orderId = o.orderId || o._id;
                      const dateStr = o.date || (o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '');
                      const statusStr = o.status || o.orderStatus || 'Paid';
                      const amount = o.total !== undefined ? o.total : (o.totalPrice !== undefined ? o.totalPrice : 0);

                      return (
                        <tr key={orderId} className="hover:bg-white/5">
                          <td className="p-4 text-white font-bold">{orderId}</td>
                          <td className="p-4">{dateStr}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              statusStr === 'Delivered' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                            }`}>
                              {statusStr}
                            </span>
                          </td>
                          <td className="p-4 text-right text-blue-400 font-bold">₹{amount.toLocaleString('en-IN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative bg-[#1E293B] border border-white/10 max-w-md w-full rounded-2xl p-6 text-left shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/5 pb-2">Edit Builder Profile</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bio Description</label>
                <textarea
                  rows="2"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Share a short bio with other enthusiasts..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Profile Photo</label>
                <select
                  value={editForm.profilePicture}
                  onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="https://i.pinimg.com/736x/54/a2/0f/54a20f57f4a5dc18cf1f64ac339d0b3f.jpg">Casual Techie</option>
                  <option value="https://avatarfiles.alphacoders.com/334/334998.png">Cyberpunk Girl</option>
                  <option value="https://images.media.io/ai-effects/neon-wolf-gamer-pfp.png">Abstract Gamer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shipping Address</label>
                <textarea
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 min-h-[60px] resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 border border-white/10 hover:bg-white/5 text-white py-2.5 rounded-xl font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl font-bold uppercase cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
