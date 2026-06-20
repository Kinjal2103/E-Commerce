import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const remembered = localStorage.getItem('remembered_email');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }

    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setCoords({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-sans relative overflow-hidden">
      <main className="flex-grow flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <div
            className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#d3e4fe] rounded-full blur-[120px] transition-transform duration-300 ease-out"
            style={{ transform: `translate(${coords.x * 20}px, ${coords.y * 20}px)` }}
          />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#dae2fd] rounded-full blur-[120px] transition-transform duration-300 ease-out"
            style={{ transform: `translate(${coords.x * -20}px, ${coords.y * -20}px)` }}
          />
        </div>

        <div className="w-full max-w-[440px] z-10">
          <div className="bg-white p-10 md:p-12 rounded-xl border border-[#cbd5e1]/20 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col items-center mb-8">
              <div className="mb-4">
                <span className="font-extrabold text-4xl tracking-tighter text-black">LUMINA</span>
              </div>
              <h1 className="text-2xl font-semibold text-[#0b1c30]">Welcome Back</h1>
              <p className="text-sm text-[#5c5f61] mt-1">Please enter your details to sign in.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span className="text-xs font-semibold">{error}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#45464d] block" htmlFor="email">
                  Email Address
                </label>
                <div className="relative rounded-xl border border-[#c6c6cd] focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all">
                  <input
                    className="w-full bg-transparent px-4 py-3 rounded-xl focus:outline-none border-none text-sm placeholder:text-[#76777d]/60"
                    id="email"
                    name="email"
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
                  <label className="text-xs font-medium text-[#45464d]" htmlFor="password">
                    Password
                  </label>
                  <a className="text-xs font-medium text-[#5c5f61] hover:text-black transition-colors" href="#">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative rounded-xl border border-[#c6c6cd] focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all flex items-center">
                  <input
                    className="w-full bg-transparent px-4 py-3 rounded-xl focus:outline-none border-none text-sm placeholder:text-[#76777d]/60"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    className="px-4 text-[#5c5f61] hover:text-black transition-colors focus:outline-none cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  className="w-5 h-5 rounded border-[#c6c6cd] text-black focus:ring-black/25 cursor-pointer"
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="text-xs font-medium text-[#5c5f61] cursor-pointer select-none" htmlFor="remember">
                  Remember for 30 days
                </label>
              </div>

              <button
                className="w-full bg-black hover:bg-slate-800 text-white py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>

              

              
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-[#5c5f61]">
                Don't have an account?{' '}
                <Link className="text-black font-semibold hover:underline" to="/signup">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] font-bold text-[#76777d]">© 2024 LUMINA. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
