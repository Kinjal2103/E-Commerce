import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, CreditCard, ShoppingBag, Settings, LayoutDashboard, Heart, Wrench } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState({
    name: 'GamerEnthusiast',
    email: 'builds@buildforge.com',
    phone: '+1 (555) 902-1248',
    address: '128 Silicon Valley Way, San Jose, CA'
  });
  const [orders, setOrders] = useState([
    {
      orderId: 'BF-OR-904812',
      date: '2026-06-18',
      total: 2588.00,
      itemsCount: 2,
      status: 'Shipped',
      items: [
        { name: 'Intel Core i9-14900K', price: 589.00, qty: 1 },
        { name: 'ROG Strix GeForce RTX 4090 OC', price: 1999.00, qty: 1 }
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: 'GamerEnthusiast', phone: '+1 (555) 902-1248', address: '128 Silicon Valley Way, San Jose, CA' });
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Saved Builds list from localStorage
  const [savedBuilds, setSavedBuilds] = useState([]);

  useEffect(() => {
    // Load local builds
    try {
      const storedBuilds = localStorage.getItem('forge_saved_builds');
      if (storedBuilds) setSavedBuilds(JSON.parse(storedBuilds));
      
      const storedOrders = localStorage.getItem('forge_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
    } catch (e) {
      console.error(e);
    }

    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      // If no token, we can still show our mock user for seamless demonstration
      if (!token) return;

      try {
        setIsLoading(true);
        const profileRes = await fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();

        if (profileData.success && profileData.data && profileData.data.user) {
          setUser(profileData.data.user);
          setEditForm({
            name: profileData.data.user.name || '',
            phone: profileData.data.user.phone || '',
            address: profileData.data.user.address || ''
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      // Offline save
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
        setUser(data.data.user);
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
      <div className="mb-8 border-b border-white/5 pb-6">
        <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Member Center</span>
        <h1 className="text-3xl font-black text-white mt-1">User Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Info */}
        <section className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-2xl font-black mb-4">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">{user.name}</h2>
            <p className="text-[10px] text-slate-500 font-mono mt-1 w-full break-all">{user.email}</p>
            
            <div className="w-full mt-6 space-y-2">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#1E293B] border border-white/5 hover:bg-white/5 text-white py-2.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white py-2.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </section>

        {/* Right Content */}
        <div className="lg:col-span-9 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Stat Counters */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-blue-500">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Total Procurement</span>
              <span className="text-xl font-black text-white font-mono block mt-1">${totalSpent.toFixed(2)}</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-purple-500">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Pending Delivery</span>
              <span className="text-xl font-black text-white font-mono block mt-1">{pendingCount} orders</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-green-500">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Delivered Systems</span>
              <span className="text-xl font-black text-white font-mono block mt-1">{deliveredCount} orders</span>
            </div>
          </section>

          {/* Personal details info */}
          <section className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-base text-white border-b border-white/5 pb-2">Information Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Full Name</span>
                <span className="text-slate-200 font-bold block mt-1">{user.name}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Phone Contact</span>
                <span className="text-slate-200 font-bold block mt-1">{user.phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Address</span>
                <span className="text-slate-200 font-bold block mt-1">{user.address}</span>
              </div>
            </div>
          </section>

          {/* Saved Builds Grid Link */}
          <section className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-bold text-base text-white">Your Saved Builds</h3>
              <Link to="/saved-builds" className="text-xs text-blue-400 hover:underline font-bold">
                View All Saved Builds
              </Link>
            </div>
            {savedBuilds.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                You haven't saved any customized builds yet. Open the <Link to="/builder" className="text-blue-400 underline">Builder</Link> page to save.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedBuilds.slice(0, 2).map((build) => (
                  <div key={build.id} className="bg-[#0F172A] border border-white/5 rounded-xl p-4 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">{build.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Budget: ${build.budget.toFixed(2)} | Score: {build.compatibilityScore}%</p>
                    </div>
                    <Link
                      to={`/builder?clone=${build.id.startsWith('preseed') ? build.id : ''}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg"
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
              <h3 className="font-bold text-base text-white">Recent Orders</h3>
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
                  <tbody className="divide-y divide-white/5 text-slate-300 font-mono">
                    {orders.map((o) => (
                      <tr key={o.orderId} className="hover:bg-white/5">
                        <td className="p-4 text-white font-bold">{o.orderId}</td>
                        <td className="p-4">{o.date}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            o.status === 'Delivered' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                          }`}>
                            {o.status || 'Paid'}
                          </span>
                        </td>
                        <td className="p-4 text-right text-blue-400 font-bold">${(o.total || o.totalPrice).toFixed(2)}</td>
                      </tr>
                    ))}
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
          <div className="relative bg-[#1E293B] border border-white/10 max-w-md w-full rounded-2xl p-6 text-left shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Edit Personal Information</h3>
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
                  className="w-full bg-[#0F172A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 min-h-[80px]"
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
