import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setCoords({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getPasswordStrength = (val) => {
    if (val.length === 0) {
      return { percent: 0, text: 'Password strength', barColor: 'bg-[#c6c6cd]/30', textColor: 'text-[#76777d]' };
    }
    let strength = 0;
    if (val.length >= 8) strength += 25;
    if (val.match(/[a-z]/) && val.match(/[A-Z]/)) strength += 25;
    if (val.match(/[0-9]/)) strength += 25;
    if (val.match(/[^a-zA-Z0-9]/)) strength += 25;

    if (strength <= 25) {
      return { percent: strength, text: 'Weak', barColor: 'bg-[#ba1a1a]', textColor: 'text-[#ba1a1a]' };
    } else if (strength <= 75) {
      return { percent: strength, text: 'Moderate', barColor: 'bg-[#fbbc05]', textColor: 'text-[#fbbc05]' };
    } else {
      return { percent: strength, text: 'Strong', barColor: 'bg-[#34a853]', textColor: 'text-[#34a853]' };
    }
  };

  const strengthInfo = getPasswordStrength(password);
  const isPasswordMismatched = confirmPassword !== '' && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          navigate('/profile');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create account.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex items-center justify-center font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-30">
        <div
          className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#d3e4fe] rounded-full blur-[120px] transition-transform duration-300 ease-out"
          style={{ transform: `translate(${coords.x * 20}px, ${coords.y * 20}px)` }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-[#dae2fd] rounded-full blur-[100px] transition-transform duration-300 ease-out"
          style={{ transform: `translate(${coords.x * -20}px, ${coords.y * -20}px)` }}
        />
      </div>

      <main className="relative z-10 w-full max-w-[480px] px-8 py-12">
        <div className="bg-white/80 backdrop-blur-md border border-[#cbd5e1]/50 p-8 rounded-xl shadow-xl flex flex-col items-center">
          <div className="mb-8 text-center">
            <span className="font-extrabold text-4xl tracking-tighter text-black">LUMINA</span>
            <p className="text-xs font-bold text-[#5c5f61] mt-1 tracking-widest">ELEVATE YOUR EXPERIENCE</p>
          </div>

          <div className="w-full text-center mb-6">
            <h1 className="text-2xl font-bold text-[#0b1c30]">Create Account</h1>
            <p className="text-sm text-[#5c5f61] mt-1">Join our premium community today</p>
          </div>

          {error && (
            <div className="w-full mb-6 p-3 bg-[#ffdad6] text-[#ba1a1a] rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span className="text-xs font-semibold">{error}</span>
            </div>
          )}

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#45464d] block ml-1" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#cbd5e1]">
                  person
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#c6c6cd] rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all text-sm text-[#0b1c30]"
                  id="name"
                  placeholder="John Doe"
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#45464d] block ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#cbd5e1]">
                  mail
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#c6c6cd] rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all text-sm text-[#0b1c30]"
                  id="email"
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-[#5c5f61] ml-1 mt-1 font-medium">We'll never share your email.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#45464d] block ml-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#cbd5e1]">
                  lock
                </span>
                <input
                  className="w-full pl-10 pr-10 py-3 bg-white border border-[#c6c6cd] rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all text-sm text-[#0b1c30]"
                  id="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#cbd5e1] hover:text-black transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              <div className="mt-2 space-y-1">
                <div className="h-1 w-full bg-[#cbd5e1]/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthInfo.barColor}`}
                    style={{ width: `${strengthInfo.percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <span className={`text-[10px] font-bold ${strengthInfo.textColor}`}>
                    {strengthInfo.text}
                  </span>
                  <span className="text-[10px] text-[#cbd5e1] font-bold">Min. 8 chars</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#45464d] block ml-1" htmlFor="confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#cbd5e1]">
                  check_circle
                </span>
                <input
                  className={`w-full pl-10 pr-4 py-3 bg-white border ${
                    isPasswordMismatched ? 'border-[#ba1a1a]' : 'border-[#c6c6cd]'
                  } rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all text-sm text-[#0b1c30]`}
                  id="confirm-password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {isPasswordMismatched && (
                <div className="flex items-center gap-1 text-[#ba1a1a] mt-1 ml-1">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span className="text-[10px] font-bold">Passwords do not match</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 pt-1">
              <div className="flex items-center h-5">
                <input
                  className="w-4 h-4 rounded border-[#c6c6cd] text-black focus:ring-black transition-all cursor-pointer"
                  id="terms"
                  required
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
              </div>
              <label className="text-xs text-[#5c5f61] leading-tight cursor-pointer" htmlFor="terms">
                I agree to the{' '}
                <a className="text-black font-semibold hover:underline" href="#">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a className="text-black font-semibold hover:underline" href="#">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <div className="pt-2 space-y-4">
              <button
                className="w-full py-3 bg-black hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              {/* <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-[#c6c6cd]/30"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-[#cbd5e1] uppercase tracking-wider">
                  OR CONTINUE WITH
                </span>
                <div className="flex-grow border-t border-[#c6c6cd]/30"></div>
              </div>

              <button
                className="w-full py-3 bg-white border border-[#c6c6cd] rounded-xl text-xs font-bold text-[#0b1c30] hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                type="button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Google Signup</span>
              </button> */}
            </div>
          </form>

          <p className="mt-8 text-sm text-[#5c5f61]">
            Already have an account?{' '}
            <Link className="text-black font-bold hover:underline" to="/login">
              Login here
            </Link>
          </p>
        </div>

        {showSuccessToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="text-xs font-bold">Account created successfully! Redirecting...</span>
          </div>
        )}
      </main>
    </div>
  );
}
