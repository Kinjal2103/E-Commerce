import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDataAndOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const profileRes = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const profileData = await profileRes.json();

        if (profileData.success && profileData.data && profileData.data.user) {
          setUser(profileData.data.user);
          setEditForm({
            name: profileData.data.user.name || '',
            phone: profileData.data.user.phone || '',
            address: profileData.data.user.address || ''
          });
        } else {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        const ordersRes = await fetch('/api/orders/myorders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const ordersData = await ordersRes.json();

        if (ordersData.success && ordersData.data && ordersData.data.orders) {
          setOrders(ordersData.data.orders);
        }
      } catch (err) {
        setError('Failed to fetch profile details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndOrders();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const token = localStorage.getItem('token');
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
        setError(data.message || 'Failed to update profile details.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8f9ff]">
        <div className="text-slate-600 animate-pulse font-medium">Loading profile...</div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const pendingCount = orders.filter(o => ['Pending', 'Paid', 'Shipped'].includes(o.orderStatus)).length;
  const deliveredCount = orders.filter(o => o.orderStatus === 'Delivered').length;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMemberSince = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen">
      <main className="pt-24 pb-16 max-w-[1280px] mx-auto px-6 min-h-screen font-sans">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <section className="md:col-span-4 lg:col-span-3 space-y-6">
            <div className="bg-white border border-[#E2E8F0] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-300 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-[#eff4ff] text-2xl font-bold text-black border border-slate-200">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <h1 className="text-xl font-bold text-[#0b1c30]">{user?.name}</h1>
              <p className="text-xs text-[#5c5f61] mt-1 mb-6 break-all w-full">{user?.email}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-black hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Edit Profile
              </button>
            </div>

            <div className="bg-white border border-[#E2E8F0] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-300 rounded-xl overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-[#cbd5e1]/30">
                <span className="text-[10px] font-bold text-[#5c5f61] uppercase tracking-wider">Account Settings</span>
              </div>
              <div className="divide-y divide-[#cbd5e1]/20">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-4 text-[#ba1a1a] hover:bg-red-50/50 transition-colors cursor-pointer text-left"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Logout</span>
                </button>
              </div>
            </div>
          </section>

          <div className="md:col-span-8 lg:col-span-9 space-y-6">
            {error && (
              <div className="p-4 bg-[#ffdad6] text-[#ba1a1a] rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                <span className="text-xs font-semibold">{error}</span>
              </div>
            )}

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#E2E8F0] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-300 rounded-xl p-6 border-l-4 border-l-black">
                <p className="text-xs font-bold text-[#5c5f61] uppercase tracking-wider">Total Spent</p>
                <p className="text-2xl mt-2 font-extrabold text-[#0b1c30]">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-white border border-[#E2E8F0] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-300 rounded-xl p-6 border-l-4 border-l-amber-500">
                <p className="text-xs font-bold text-[#5c5f61] uppercase tracking-wider">Pending Orders</p>
                <p className="text-2xl mt-2 font-extrabold text-[#0b1c30]">{pendingCount}</p>
              </div>
              <div className="bg-white border border-[#E2E8F0] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-300 rounded-xl p-6 border-l-4 border-l-green-600">
                <p className="text-xs font-bold text-[#5c5f61] uppercase tracking-wider">Delivered</p>
                <p className="text-2xl mt-2 font-extrabold text-[#0b1c30]">{deliveredCount}</p>
              </div>
            </section>

            <section className="bg-white border border-[#E2E8F0] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-300 rounded-xl p-6">
              <h2 className="text-lg font-bold text-[#0b1c30] mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5c5f61] uppercase tracking-wider">Full Name</label>
                  <p className="text-sm font-medium border-b border-[#cbd5e1]/30 pb-2">{user?.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5c5f61] uppercase tracking-wider">Phone</label>
                  <p className="text-sm font-medium border-b border-[#cbd5e1]/30 pb-2">
                    {user?.phone || 'Not provided'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5c5f61] uppercase tracking-wider">Address</label>
                  <p className="text-sm font-medium border-b border-[#cbd5e1]/30 pb-2">
                    {user?.address || 'Not provided'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#5c5f61] uppercase tracking-wider">Member Since</label>
                  <p className="text-sm font-medium border-b border-[#cbd5e1]/30 pb-2">
                    {user?.createdAt ? formatMemberSince(user.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white border border-[#E2E8F0] hover:border-[#cbd5e1] hover:shadow-xs transition-all duration-300 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-[#cbd5e1]/30 flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#0b1c30]">Recent Orders</h2>
              </div>
              <div className="overflow-x-auto">
                {orders.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500 font-medium">
                    No orders placed yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#cbd5e1]/30 text-xs font-bold text-[#5c5f61] uppercase tracking-wider">
                        <th className="p-4">PRODUCT</th>
                        <th className="p-4">DATE</th>
                        <th className="p-4">STATUS</th>
                        <th className="p-4 text-right">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#cbd5e1]/20 text-sm">
                      {orders.map((order) => {
                        const firstItem = order.orderItems[0];
                        const itemsCount = order.orderItems.reduce((acc, it) => acc + it.qty, 0);
                        return (
                          <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                                  {firstItem?.image && (
                                    <img
                                      className="w-full h-full object-cover"
                                      src={firstItem.image}
                                      alt={firstItem.name}
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="block font-bold text-slate-900 truncate max-w-[200px]">
                                    {firstItem?.name || 'Unknown Product'}
                                  </span>
                                  {itemsCount > 1 && (
                                    <span className="text-[10px] font-bold text-slate-500">
                                      + {itemsCount - 1} other item{itemsCount > 2 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-500 font-semibold">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                                  order.orderStatus === 'Delivered'
                                    ? 'bg-green-150 text-green-700'
                                    : order.orderStatus === 'Cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    order.orderStatus === 'Delivered'
                                      ? 'bg-green-600'
                                      : order.orderStatus === 'Cancelled'
                                      ? 'bg-red-600'
                                      : 'bg-amber-500'
                                  }`}
                                />
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="p-4 text-right font-bold text-slate-900">
                              ₹{(order.totalPrice || 0).toLocaleString('en-IN')}
                            </td>
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
      </main>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsEditing(false)} />
          <div className="relative bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[#0b1c30] mb-4">Edit Personal Information</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#5c5f61] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-black transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5c5f61] uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-black transition-colors"
                  placeholder="+91 99999 99999"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5c5f61] uppercase tracking-wider mb-1">
                  Street Address
                </label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full bg-[#f8f9ff] border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-black transition-colors min-h-[80px]"
                  placeholder="Enter your street address details"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/2 border border-[#cbd5e1] hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-1/2 bg-black hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
