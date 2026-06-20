import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, Truck, Lock, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart
  } = useCart();

  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Financial calculations
  const rawSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = rawSubtotal * (discountPercent / 100);
  const subtotal = rawSubtotal - discountAmount;
  const shippingThreshold = 500;
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 25.00;
  const salesTax = subtotal * 0.08;
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

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen text-left">
      <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Your Items</span>
          <h1 className="text-3xl font-black text-white mt-1">Shopping Cart</h1>
        </div>
        <Link
          to="/products"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Discovery</span>
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="glass-panel rounded-3xl py-20 px-6 text-center max-w-lg mx-auto">
          <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4 stroke-[1.2]" />
          <h2 className="text-lg font-bold text-slate-300">Your cart is empty</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
            Configure your custom PC setup in our PC builder dashboard or explore available components.
          </p>
          <Link
            to="/products"
            className="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold tracking-widest uppercase py-4 px-8 rounded-xl transition-all shadow-md shadow-blue-500/10 hover:shadow-blue-500/30 cursor-pointer"
          >
            Start Discovery
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Items Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div className="divide-y divide-white/5">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="flex flex-col sm:flex-row gap-5 py-5 first:pt-0 last:pb-0"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-[#0F172A] rounded-xl flex items-center justify-center p-3 flex-shrink-0 border border-white/5">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Specifications */}
                    <div className="flex-grow min-w-0 flex flex-col justify-between text-left">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-sm text-white leading-tight truncate">
                            {item.product.name}
                          </h3>
                          <span className="font-mono text-sm font-bold text-blue-400">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block mt-1">
                          Category: {item.product.category}
                        </span>
                      </div>

                      {/* controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-white/10 rounded-lg bg-[#0F172A]">
                          <button
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="px-3 py-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs text-white font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                            className="px-3 py-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(idx)}
                          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Threshold details */}
            <div className="glass-panel rounded-2xl p-5 flex items-start gap-4 text-left">
              <Truck className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Shipping Guarantee</h4>
                {subtotal >= shippingThreshold ? (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Congratulations! Your order qualifies for <strong className="text-green-400">Free Standard Express Shipping</strong>.
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Add <strong className="text-white">${(shippingThreshold - subtotal).toFixed(2)}</strong> more to qualify for <strong className="text-white">Free Shipping</strong>. (Standard shipping fee is $25.00).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-3xl p-6 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white border-b border-white/5 pb-3">
                Order Summary
              </h2>

              {/* Promo code form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. FORGE10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-[#0F172A] border border-white/10 text-white text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all cursor-pointer flex-shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-red-500 font-semibold">{promoError}</p>}
                {promoSuccess && <p className="text-[11px] text-green-400 font-semibold">✓ {promoSuccess}</p>}
              </form>

              {/* Pricing breakdown */}
              <div className="space-y-3 text-xs text-slate-450 border-t border-white/5 pt-5 font-sans">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${rawSubtotal.toFixed(2)}</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-bold">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-400 font-bold uppercase text-[10px]">Free</span>
                  ) : (
                    <span className="font-semibold text-white">${shippingCost.toFixed(2)}</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span className="font-semibold text-white">${salesTax.toFixed(2)}</span>
                </div>

                <div className="border-t border-white/5 pt-4 flex justify-between text-white font-black text-sm">
                  <span>Total</span>
                  <span className="text-lg text-blue-400">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout link */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
