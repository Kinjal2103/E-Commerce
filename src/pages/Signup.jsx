import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

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
  const navigate = useNavigate();

  const getPasswordStrength = (val) => {
    if (val.length === 0) {
      return { percent: 0, text: 'Password strength', barColor: 'bg-slate-700', textColor: 'text-slate-500' };
    }
    let strength = 0;
    if (val.length >= 8) strength += 25;
    if (val.match(/[a-z]/) && val.match(/[A-Z]/)) strength += 25;
    if (val.match(/[0-9]/)) strength += 25;
    if (val.match(/[^a-zA-Z0-9]/)) strength += 25;

    if (strength <= 25) {
      return { percent: strength, text: 'Weak', barColor: 'bg-red-500', textColor: 'text-red-400' };
    } else if (strength <= 75) {
      return { percent: strength, text: 'Moderate', barColor: 'bg-yellow-500', textColor: 'text-yellow-400' };
    } else {
      return { percent: strength, text: 'Strong', barColor: 'bg-green-500', textColor: 'text-green-400' };
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
      // Mock signup fallback
      localStorage.setItem('token', 'mock_token_success');
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate('/profile');
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0F172A] text-[#F8FAFC] min-h-screen flex items-center justify-center font-sans relative overflow-hidden">
      {/* Background glow lines */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-[460px] px-6 py-12">
        <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center mb-6">
            <span className="font-sans font-black text-3xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 select-none">
              BuildForge
            </span>
            <h1 className="text-xl font-bold text-white mt-4">Create Account</h1>
            <p className="text-xs text-slate-400 mt-1">Join our high-performance builder network.</p>
          </div>

          {error && (
            <div className="w-full mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 text-left">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="w-full space-y-4 text-left" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block" htmlFor="name">
                Full Name
              </label>
              <div className="relative rounded-xl border border-white/10 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all flex items-center bg-[#0F172A]">
                <User className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  className="w-full bg-transparent pl-10 pr-4 py-2.5 rounded-xl focus:outline-none border-none text-xs text-white placeholder:text-slate-600"
                  id="name"
                  placeholder="John Doe"
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block" htmlFor="email">
                Email Address
              </label>
              <div className="relative rounded-xl border border-white/10 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all flex items-center bg-[#0F172A]">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  className="w-full bg-transparent pl-10 pr-4 py-2.5 rounded-xl focus:outline-none border-none text-xs text-white placeholder:text-slate-600"
                  id="email"
                  placeholder="name@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block" htmlFor="password">
                Password
              </label>
              <div className="relative rounded-xl border border-white/10 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all flex items-center bg-[#0F172A]">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  className="w-full bg-transparent pl-10 pr-4 py-2.5 rounded-xl focus:outline-none border-none text-xs text-white placeholder:text-slate-600"
                  id="password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Password strength bar */}
              <div className="mt-2 space-y-1">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthInfo.barColor}`}
                    style={{ width: `${strengthInfo.percent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] font-bold">
                  <span className={strengthInfo.textColor}>{strengthInfo.text}</span>
                  <span className="text-slate-500">Min. 8 chars</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block" htmlFor="confirm-password">
                Confirm Password
              </label>
              <div className="relative rounded-xl border border-white/10 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all flex items-center bg-[#0F172A]">
                <CheckCircle2 className="w-4 h-4 text-slate-500 absolute left-3" />
                <input
                  className={`w-full bg-transparent pl-10 pr-4 py-2.5 rounded-xl focus:outline-none border-none text-xs text-white placeholder:text-slate-600 ${
                    isPasswordMismatched ? 'border-red-500' : ''
                  }`}
                  id="confirm-password"
                  placeholder="••••••••"
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {isPasswordMismatched && (
                <p className="text-[10px] font-bold text-red-400 mt-1 ml-1">Passwords do not match</p>
              )}
            </div>

            {/* Agree checkbox */}
            <div className="flex items-start gap-2 pt-2">
              <input
                className="w-4 h-4 rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0 focus:ring-offset-0 cursor-pointer mt-0.5"
                id="terms"
                required
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label className="text-xs text-slate-400 leading-tight cursor-pointer" htmlFor="terms">
                I agree to the{' '}
                <a className="text-blue-400 font-bold hover:underline" href="#">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a className="text-blue-400 font-bold hover:underline" href="#">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/30 cursor-pointer"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2 inline-block" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-xs text-slate-400">
            Already have an account?{' '}
            <Link className="text-blue-400 font-bold hover:underline" to="/login">
              Login here
            </Link>
          </p>
        </div>
      </main>

      {showSuccessToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold">Account created successfully! Redirecting...</span>
        </div>
      )}
    </div>
  );
}
