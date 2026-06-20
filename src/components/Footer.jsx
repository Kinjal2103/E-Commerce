import { useState } from 'react';
import { Globe, Heart, Cpu, Github, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-[#111827] border-t border-white/5 mt-20 relative overflow-hidden">
      {/* Background glow lines */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-1 lg:col-span-2">
            <span className="font-sans font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 select-none">
              BuildForge
            </span>
            <p className="mt-4 text-slate-400 text-sm max-w-xs leading-relaxed">
              PC gaming components marketplace and intelligent builder platform. Empowering enthusiasts to design, verify, and procure high-performance machines.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 bg-white/5 hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-white/5 hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Builder */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-200 font-bold mb-4">Builder Tool</h3>
            <ul className="space-y-3 font-sans text-sm">
              <li><a href="/builder" className="text-slate-400 hover:text-blue-400 transition-colors">Launch PC Builder</a></li>
              <li><a href="/compare" className="text-slate-400 hover:text-blue-400 transition-colors">Component Compare</a></li>
              <li><a href="/community" className="text-slate-400 hover:text-blue-400 transition-colors">Community Showcase</a></li>
              <li><a href="/products" className="text-slate-400 hover:text-blue-400 transition-colors">Compatibility Rules</a></li>
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-200 font-bold mb-4">Marketplace</h3>
            <ul className="space-y-3 font-sans text-sm">
              <li><a href="/products?category=CPUs" className="text-slate-400 hover:text-blue-400 transition-colors">Processors (CPUs)</a></li>
              <li><a href="/products?category=GPUs" className="text-slate-400 hover:text-blue-400 transition-colors">Graphics Cards (GPUs)</a></li>
              <li><a href="/products?category=Motherboards" className="text-slate-400 hover:text-blue-400 transition-colors">Motherboards</a></li>
              <li><a href="/products?category=RAM" className="text-slate-400 hover:text-blue-400 transition-colors">Memory (RAM)</a></li>
            </ul>
          </div>

          {/* Newsletter / Join */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-slate-200 font-bold mb-4">Join Forge</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Get hardware stock updates, FPS optimization guides, and deal alerts.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3 font-sans">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email..."
                  required
                  className="w-full bg-[#0F172A] border border-white/10 text-white rounded-l-lg text-sm px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg font-bold text-sm px-4 py-2 transition-all flex items-center justify-center cursor-pointer"
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <p className="text-xs text-green-400 font-medium">
                  ✓ Registered! Welcome to BuildForge updates.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BuildForge Inc. Engineered for gaming excellence.</p>
          <div className="flex gap-6 items-center">
            <a href="#" className="hover:text-slate-350">Privacy Guidelines</a>
            <a href="#" className="hover:text-slate-350">Terms of Use</a>
            <a href="#" className="hover:text-slate-350 flex items-center gap-1 cursor-pointer">
              <Globe className="w-3.5 h-3.5" /> USD ($)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
