import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Menu, X, Search, ShoppingCart, User, Heart, BarChart3, Wrench, Users, ShieldAlert, Bell } from 'lucide-react';

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'py-3 bg-[#0F172A]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]' 
            : 'py-5 bg-transparent border-b border-white/5'
        }`}
      >
        <div className="flex justify-between items-center px-6 max-w-[1440px] mx-auto w-full">
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg transition-all md:hidden flex items-center justify-center cursor-pointer hover:bg-white/5"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link
              to="/"
              className="font-sans font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 hover:opacity-80 transition-opacity select-none cursor-pointer"
            >
              BuildForge
            </Link>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex gap-8 items-center">
            <NavLink
              to="/builder"
              className={({ isActive }) =>
                `flex items-center gap-1.5 font-sans text-xs tracking-wider font-bold transition-all uppercase select-none cursor-pointer py-1 border-b-2 ${
                  isActive
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-blue-400'
                }`
              }
            >
              <Wrench className="w-3.5 h-3.5" />
              PC Builder
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `font-sans text-xs tracking-wider font-bold transition-all uppercase select-none cursor-pointer py-1 border-b-2 ${
                  isActive
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-blue-400'
                }`
              }
            >
              Components
            </NavLink>
            <NavLink
              to="/compare"
              className={({ isActive }) =>
                `flex items-center gap-1.5 font-sans text-xs tracking-wider font-bold transition-all uppercase select-none cursor-pointer py-1 border-b-2 ${
                  isActive
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-blue-400'
                }`
              }
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Compare
            </NavLink>
            <NavLink
              to="/community"
              className={({ isActive }) =>
                `flex items-center gap-1.5 font-sans text-xs tracking-wider font-bold transition-all uppercase select-none cursor-pointer py-1 border-b-2 ${
                  isActive
                    ? 'text-blue-400 border-blue-400'
                    : 'text-slate-400 border-transparent hover:text-blue-400'
                }`
              }
            >
              <Users className="w-3.5 h-3.5" />
              Showcase
            </NavLink>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-1.5 font-sans text-xs tracking-wider font-bold transition-all uppercase select-none cursor-pointer py-1 border-b-2 ${
                  isActive
                    ? 'text-purple-400 border-purple-400'
                    : 'text-slate-400 border-transparent hover:text-purple-400'
                }`
              }
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Admin
            </NavLink>
          </nav>

          {/* Right Action Icons & Search */}
          <div className="flex items-center gap-3">
            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="relative hidden lg:block group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                placeholder="Search CPUs, GPUs, RAM, SSDs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#0F172A] border border-[#334155] rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-transparent transition-all w-60 group-hover:border-slate-500"
              />
            </form>

            {/* Notifications */}
            <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-all cursor-pointer relative hidden sm:flex items-center justify-center">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/profile"
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-all cursor-pointer hidden sm:flex items-center justify-center"
              title="Saved Builds & Wishlist"
            >
              <Heart className="w-4 h-4" />
            </Link>

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-all relative flex items-center justify-center cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCartItems > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full animate-pulse font-sans">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Profile */}
            <Link
              to={localStorage.getItem('token') ? "/profile" : "/login"}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-all flex items-center justify-center cursor-pointer"
              aria-label="User Account"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-transform duration-500 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'pointer-events-none'
        }`}
      >
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        <nav
          className={`relative w-[80%] max-w-[280px] h-full bg-[#111827] border-r border-white/5 p-6 flex flex-col shadow-2xl transition-transform duration-500 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center mb-8">
            <span className="font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">BuildForge</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative mb-6">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search hardware..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0F172A] border border-[#334155] rounded-full py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none w-full"
            />
          </form>

          {/* Mobile Links */}
          <div className="flex flex-col gap-4">
            <Link
              to="/builder"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-blue-400 py-2 border-b border-white/5"
            >
              PC Builder
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-blue-400 py-2 border-b border-white/5"
            >
              Browse Components
            </Link>
            <Link
              to="/compare"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-blue-400 py-2 border-b border-white/5"
            >
              Compare Parts
            </Link>
            <Link
              to="/community"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-blue-400 py-2 border-b border-white/5"
            >
              Community Builds
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-bold text-xs uppercase tracking-wider text-purple-400 hover:text-purple-300 py-2 border-b border-white/5"
            >
              Admin Panel
            </Link>
          </div>

          <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3">
            <Link
              to={localStorage.getItem('token') ? "/profile" : "/login"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              <User className="w-4 h-4" />
              My Profile
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              <Heart className="w-4 h-4" />
              Saved Builds
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
