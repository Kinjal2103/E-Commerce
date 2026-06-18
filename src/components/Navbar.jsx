import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Menu, X, Search, ShoppingCart, User, Globe, HelpCircle, ChevronRight } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { cart, setIsCartOpen } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  // Scroll effect to shrink or hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setIsScrolled(currentScrollPos > 10);
      
      // Hide on scroll down, show on scroll up
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 80);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-slate-200/30 shadow-sm glass-header ${
          isScrolled ? 'py-3' : 'py-5'
        } ${visible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="flex justify-between items-center h-12 px-6 max-w-[1280px] mx-auto w-full">
          {/* Mobile menu trigger + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 hover:bg-slate-200/50 rounded-full transition-all md:hidden text-[#0b1c30] flex items-center justify-center cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link
              to="/"
              className="font-sans font-extrabold text-[#0b1c30] text-xl tracking-widest uppercase hover:opacity-80 transition-opacity select-none cursor-pointer"
            >
              LUMINA
            </Link>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex gap-10 items-center">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `font-sans text-sm tracking-wide transition-all uppercase select-none cursor-pointer pb-1 ${
                  isActive
                    ? 'text-black font-extrabold border-b-2 border-black'
                    : 'text-slate-500 font-medium hover:text-black'
                }`
              }
            >
              Shop All
            </NavLink>
            <NavLink
              to="/products?category=Smart Home"
              className="font-sans text-sm tracking-wide text-slate-500 hover:text-black font-medium transition-colors uppercase select-none cursor-pointer pb-1"
            >
              Smart Home
            </NavLink>
            <NavLink
              to="/collections"
              className={({ isActive }) =>
                `font-sans text-sm tracking-wide transition-all uppercase select-none cursor-pointer pb-1 ${
                  isActive
                    ? 'text-black font-extrabold border-b-2 border-black'
                    : 'text-slate-500 font-medium hover:text-black'
                }`
              }
            >
              Collections
            </NavLink>
            <Link
              to="/"
              className="font-sans text-sm tracking-wide text-slate-500 hover:text-black font-medium transition-colors uppercase select-none cursor-pointer pb-1"
            >
              Journal
            </Link>
          </nav>

          {/* User icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 hover:bg-slate-200/50 rounded-full transition-all text-[#0b1c30] flex items-center justify-center cursor-pointer ${
                isSearchOpen ? 'bg-slate-200/50' : ''
              }`}
              aria-label="Search items"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 hover:bg-slate-200/50 rounded-full transition-all select-none relative text-[#0b1c30] flex items-center justify-center cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartItems > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse font-sans">
                  {totalCartItems}
                </span>
              )}
            </button>
            
            <Link
              to={localStorage.getItem('token') ? "/profile" : "/login"}
              className="p-2 hover:bg-slate-200/50 rounded-full transition-all text-[#0b1c30] hidden sm:flex items-center justify-center cursor-pointer"
              aria-label="User account"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Global Slide-down search overlay */}
        <div
          className={`absolute left-0 w-full bg-white border-b border-slate-200 shadow-md transition-all duration-300 ease-out overflow-hidden z-40 ${
            isSearchOpen ? 'max-h-20 opacity-100 py-4 px-6 visible' : 'max-h-0 opacity-0 invisible'
          }`}
        >
          <div className="max-w-[1280px] mx-auto w-full flex items-center gap-4">
            <SearchBar
              isGlobal={true}
              onSearchComplete={() => setIsSearchOpen(false)}
              className="flex-grow"
              placeholder="Search modern items (e.g. overcoat, sneakers, vector lamp)..."
            />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-black cursor-pointer px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </header>

      {/* Side Menu Drawer (Overlay on Mobile) */}
      <div
        className={`fixed inset-0 z-[60] transition-transform duration-500 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Navigation Drawer Container */}
        <nav
          className={`relative w-[80%] max-w-[320px] h-full bg-white p-6 flex flex-col shadow-2xl transition-transform duration-500 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center mb-10">
            <span className="font-extrabold text-xl tracking-widest text-black">LUMINA</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-slate-200/50 rounded-full flex items-center justify-center cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-slate-700" />
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-semibold text-base py-2 border-b border-slate-100 text-slate-800 text-left cursor-pointer flex justify-between items-center"
            >
              <span>Shop All</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/products?category=Smart Home"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-semibold text-base py-2 border-b border-slate-100 text-slate-600 hover:text-slate-800 text-left cursor-pointer flex justify-between items-center"
            >
              <span>Smart Home</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/collections"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-semibold text-base py-2 border-b border-slate-100 text-slate-600 hover:text-slate-800 text-left cursor-pointer flex justify-between items-center"
            >
              <span>Collections</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-semibold text-base py-2 border-b border-slate-100 text-slate-600 hover:text-slate-800 text-left cursor-pointer flex justify-between items-center"
            >
              <span>Journal</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          <div className="mt-auto pt-8 space-y-4 border-t border-slate-100">
            <Link
              to={localStorage.getItem('token') ? "/profile" : "/login"}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 text-slate-600 cursor-pointer hover:text-black transition-colors"
            >
              <User className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium">My Account</span>
            </Link>
            <div className="flex items-center gap-3 text-slate-600">
              <HelpCircle className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium">Customer Support</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Globe className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium">English / USD</span>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
