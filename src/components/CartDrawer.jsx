import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, Truck, Lock, CheckCircle } from 'lucide-react';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const navigate = useNavigate();

  // Financial calculations (USD)
  const rawSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = rawSubtotal * (discountPercent / 100);
  const subtotal = rawSubtotal - discountAmount;
  const shippingThreshold = 15000; // Free shipping for orders above ₹15,000
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 500;
  const salesTax = subtotal * 0.08; // 8% tax
  const total = subtotal + shippingCost + salesTax;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'FORGE10') {
      setDiscountPercent(10);
      setPromoSuccess('10% discount applied successfully!');
    } else if (code === 'FORGE20') {
      setDiscountPercent(20);
      setPromoSuccess('Premium 20% discount applied successfully!');
    } else {
      setPromoError('Invalid coupon code. Try FORGE10 or FORGE20');
      setDiscountPercent(0);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition-transform duration-500 ease-out ${
          isCartOpen ? 'translate-x-0' : 'pointer-events-none'
        }`}
      >
        {/* Dark drop background */}
        <div
          onClick={() => setIsCartOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
            isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Sliding Panel */}
        <div
          className={`absolute right-0 top-0 w-full max-w-[440px] h-full bg-[#111827] border-l border-white/5 flex flex-col shadow-2xl transition-transform duration-500 ease-out ${
            isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              <h2 className="font-sans font-bold text-lg text-white">Your Cart</h2>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2.5 py-0.5 rounded-full font-bold">
                {cart.length}
              </span>
            </div>
            
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>

          {/* Delivery threshold signal */}
          {cart.length > 0 && (
            <div className="bg-[#0F172A] px-6 py-3 border-b border-white/5 flex items-center gap-2 text-xs">
              {subtotal >= shippingThreshold ? (
                <>
                  <Truck className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-slate-400 font-medium">
                    Congratulations! Your order qualifies for <strong className="text-white">Free Standard Shipping</strong>.
                  </span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-400">
                    Add <strong className="text-white">₹{(shippingThreshold - subtotal).toLocaleString('en-IN')}</strong> more for <strong className="text-white">Free Shipping</strong>.
                  </span>
                </>
              )}
            </div>
          )}

          {/* Cart Contents list */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 no-scrollbar">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60%] text-center font-sans">
                <ShoppingBag className="w-16 h-16 text-slate-700 mb-4 stroke-[1.2]" />
                <h3 className="text-base font-semibold text-slate-300">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-[220px] mt-2 leading-relaxed">
                  Explore components or load your PC builder config to add components to cart.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold tracking-widest uppercase py-3.5 px-6 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer rounded-lg"
                >
                  Browse Hardware
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${idx}`}
                  className="flex gap-4 p-3 border border-white/5 rounded-xl bg-[#1E293B] hover:bg-[#1E293B]/80 transition-colors relative group font-sans"
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 bg-[#111827] rounded-lg overflow-hidden flex-shrink-0 p-2 flex items-center justify-center">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Descriptions */}
                  <div className="flex-grow min-w-0 pr-4">
                    <h4 className="font-bold text-xs text-white truncate">
                      {item.product.name}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[11px] text-slate-400">
                      <span>Cat: <strong>{item.product.category}</strong></span>
                      {item.product.specs?.['Socket Type'] && (
                        <span>| Socket: <strong>{item.product.specs['Socket Type']}</strong></span>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-white/10 rounded-lg bg-[#0F172A]">
                        <button
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          className="px-2 py-1 text-slate-400 hover:text-white font-semibold text-sm cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs text-white font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          className="px-2 py-1 text-slate-400 hover:text-white font-semibold text-sm cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Total Price */}
                      <span className="text-xs font-bold text-blue-400 font-sans">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(idx)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-red-500 opacity-60 hover:opacity-100 transition-all cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Checkout & Coupons */}
          {cart.length > 0 && (
            <div className="border-t border-white/5 p-6 space-y-4 bg-[#0F172A]">
              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. FORGE10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-[#1E293B] border border-white/10 text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors uppercase font-mono"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer flex-shrink-0"
                >
                  Apply
                </button>
              </form>

              {promoError && <p className="text-[11px] text-red-500 font-semibold">{promoError}</p>}
              {promoSuccess && <p className="text-[11px] text-green-400 font-semibold font-sans">✓ {promoSuccess}</p>}

              {/* pricing table */}
              <div className="space-y-2 text-xs text-slate-400 font-sans">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">₹{rawSubtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping &amp; Handling</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-400 font-bold uppercase text-[10px]">Free</span>
                  ) : (
                    <span className="font-semibold text-white">₹{shippingCost.toLocaleString('en-IN')}</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-semibold text-white">₹{salesTax.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-white/5 pt-3 flex justify-between text-sm text-white font-bold">
                  <span>Total</span>
                  <span className="text-base text-blue-400">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action buttons (Dedicated Cart Page + Checkout overlay) */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full border border-white/10 hover:bg-white/5 text-white text-center font-bold tracking-wider text-[10px] uppercase py-3.5 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                >
                  View Cart
                </Link>
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold tracking-wider text-[10px] uppercase py-3.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
