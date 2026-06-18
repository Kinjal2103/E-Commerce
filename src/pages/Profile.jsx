import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('/api/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (data.success && data.data && data.data.user) {
          setUser(data.data.user);
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (err) {
        setError('Failed to fetch profile details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8f9ff]">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8f9ff]">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 border border-slate-100 shadow-xl text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#f8f9ff]">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 border border-slate-100 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900">{user?.name}</h2>
          <p className="mt-1 text-sm text-slate-500 capitalize">{user?.role} Account</p>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-500">Email Address</span>
            <span className="text-slate-900">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-500">Member Since</span>
            <span className="text-slate-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
