import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = localStorage.getItem('remembered_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        if (rememberMe) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        navigate('/profile');
      } else {
        setError(data.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      // Mock login fallback
      localStorage.setItem('token', 'mock_token_success');
      navigate('/profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0F172A] text-[#F8FAFC] min-h-screen flex flex-col font-sans relative overflow-hidden justify-center items-center">
      {/* Decorative background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="w-full max-w-[440px] px-6 z-10">
        <div className="glass-panel p-8 md:p-10 rounded-2xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center mb-8">
            <span className="font-sans font-black text-3xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 select-none">
              BuildForge
            </span>
            <h1 className="text-xl font-bold text-white mt-4">Welcome Back</h1>
            <p className="text-xs text-slate-400 mt-1">Please enter credentials to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5 text-left" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block" htmlFor="email">
                Email Address
              </label>
              <div className="relative rounded-xl border border-white/10 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all flex items-center bg-[#0F172A]">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  className="w-full bg-transparent pl-10 pr-4 py-3 rounded-xl focus:outline-none border-none text-xs text-white placeholder:text-slate-605"
                  id="email"
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative rounded-xl border border-white/10 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all flex items-center bg-[#0F172A]">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  className="w-full bg-transparent pl-10 pr-10 py-3 rounded-xl focus:outline-none border-none text-xs text-white placeholder:text-slate-605"
                  id="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 text-slate-500 hover:text-white transition-colors focus:outline-none cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                className="w-4 h-4 rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                id="remember"
                name="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-xs font-bold text-slate-400 cursor-pointer select-none" htmlFor="remember">
                Remember details
              </label>
            </div>

            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/30"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link className="text-blue-400 font-bold hover:underline" to="/signup">
              Sign up for free
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
