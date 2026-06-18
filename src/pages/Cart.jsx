import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  Lock,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Percent
} from 'lucide-react';

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
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Form states for modern premium checkout panel
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({ ...prev, [name]: value }));
  };

  // Financial calculations
  const rawSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = rawSubtotal * (discountPercent / 100);
  const subtotal = rawSubtotal - discountAmount;
  const shippingThreshold = 15000;
  const shippingCost = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 999.00;
  const salesTax = subtotal * 0.18; // 18% GST (Standard Indian GST)
  const total = subtotal + shippingCost + salesTax;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'LUMINA10') {
      setDiscountPercent(10);
      setPromoSuccess('10% discount applied successfully!');
    } else if (code === 'LUMINA20') {
      setDiscountPercent(20);
      setPromoSuccess('Premium 20% discount applied successfully!');
    } else {
      setPromoError('Invalid coupon code. Try LUMINA10 or LUMINA20');
      setDiscountPercent(0);
    }
  };

  const handleStartCheckout = (e) => {
    e.preventDefault();
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      clearCart();
    }, 2200);
  };

  const handleCloseSuccess = () => {
    setCheckoutComplete(false);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto min-h-[70vh] font-sans">
      {/* Success Modal */}
      {checkoutComplete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={handleCloseSuccess} />
          
          <div className="relative bg-white max-w-md w-full rounded-2xl p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 font-sans">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Order Successfully Placed!</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Thank you for shopping with Lumina. Your payment was securely processed. A confirmation email and tracking link have been dispatched.
            </p>

            <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left border border-slate-100 text-[11px] leading-relaxed space-y-1.5 text-slate-600 font-mono">
              <div className="flex justify-between">
                <span>Receipt Ref:</span>
                <span className="font-semibold text-black">#LMN-{(Math.floor(Math.random() * 900000) + 100000)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipment Class:</span>
                <span className="font-semibold text-black">Lumina India Premium Delivery</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Delivery:</span>
                <span className="font-semibold text-black">2-4 Business Days</span>
              </div>
            </div>

            <Link
              to="/products"
              onClick={handleCloseSuccess}
              className="block w-full bg-black hover:bg-slate-800 text-white text-center font-bold tracking-widest text-xs uppercase py-3 rounded transition-colors cursor-pointer"
            >
              Continue Exploring
            </Link>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0b1c30]">
          Shopping Bag
        </h1>
        <Link
          to="/products"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white/50 backdrop-blur-xs">
          <ShoppingBag className="w-16 h-16 text-slate-200 mb-4 stroke-[1.2]" />
          <h2 className="text-lg font-bold text-slate-850">Your cart is currently empty</h2>
          <p className="text-sm text-slate-500 max-w-sm mt-2 leading-relaxed">
            Discover our curated sculptural designs, premium home decors and aesthetic objects to craft your perfect space.
          </p>
          <Link
            to="/products"
            className="mt-8 bg-black text-white text-xs font-bold tracking-widest uppercase py-4 px-8 hover:bg-slate-800 transition-colors rounded shadow-md"
          >
            Start Exploring Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart items and checkout form */}
          <div className="lg:col-span-8 space-y-8">
            {/* Products List Panel */}
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-xs p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">
                Selected Objects ({cart.reduce((a, c) => a + c.quantity, 0)})
              </h2>
              
              <div className="divide-y divide-slate-100">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="flex flex-col sm:flex-row gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-150 self-start sm:self-auto">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Content Details */}
                    <div className="flex-grow min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-sm text-slate-900 leading-tight">
                            {item.product.name}
                          </h3>
                          <span className="font-mono text-sm font-bold text-slate-900 flex-shrink-0">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                          {item.selectedColor && (
                            <span>Color: <strong className="text-slate-800">{item.selectedColor}</strong></span>
                          )}
                          {item.selectedSize && (
                            <span>| Size: <strong className="text-slate-800">{item.selectedSize}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-slate-200 rounded-md bg-white shadow-2xs">
                          <button
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="p-1.5 text-slate-500 hover:text-black transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs text-slate-800 font-bold font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(idx, item.quantity + 1)}
                            className="p-1.5 text-slate-500 hover:text-black transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(idx)}
                          className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer py-1 px-2 hover:bg-red-50 rounded transition-all"
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

            {/* Delivery Threshold Indicator */}
            <div className="bg-[#FAF9F5] border border-[#e8dfcf] rounded-xl p-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/50 flex items-center justify-center flex-shrink-0 text-amber-700">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1">
                  Shipping Guarantee
                </h4>
                {subtotal >= shippingThreshold ? (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Congratulations! Your order qualifies for <strong className="text-green-700">Free Premium White-Glove Standard Delivery</strong>.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Add <strong className="text-slate-800">₹{(shippingThreshold - subtotal).toLocaleString('en-IN')}</strong> more to unlock <strong className="text-slate-800">Free Standard Shipping</strong>. Standard delivery fee is ₹999.00.
                  </p>
                )}
              </div>
            </div>

            {/* Secure Checkout Form */}
            <form onSubmit={handleStartCheckout} className="bg-white border border-slate-200/60 rounded-xl shadow-xs p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Lock className="w-4 h-4 text-slate-800" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800">
                  Secure Checkout Details
                </h2>
              </div>

              {/* Customer Contact */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">First Name *</label>
                    <input
                      required
                      type="text"
                      name="firstName"
                      value={shippingForm.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Last Name *</label>
                    <input
                      required
                      type="text"
                      name="lastName"
                      value={shippingForm.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={shippingForm.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors"
                    placeholder="jane.doe@example.com"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Shipping Address
                </h3>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Street Address *</label>
                  <input
                    required
                    type="text"
                    name="address"
                    value={shippingForm.address}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors"
                    placeholder="45, Lodhi Road, Suite 300"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">City *</label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={shippingForm.city}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors"
                      placeholder="New Delhi"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pincode *</label>
                    <input
                      required
                      type="text"
                      name="zip"
                      value={shippingForm.zip}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors"
                      placeholder="110001"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>Payment Method</span>
                  </h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                    Secure 256-bit SSL
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Card Number *</label>
                  <input
                    required
                    type="text"
                    name="cardNumber"
                    value={shippingForm.cardNumber}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors font-mono"
                    placeholder="4111 2222 3333 4444"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiration Date *</label>
                    <input
                      required
                      type="text"
                      name="expiry"
                      value={shippingForm.expiry}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors font-mono"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Security Code (CVV) *</label>
                    <input
                      required
                      type="text"
                      name="cvv"
                      value={shippingForm.cvv}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors font-mono"
                      placeholder="321"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isCheckingOut}
                className="w-full bg-black hover:bg-slate-800 disabled:bg-slate-350 text-white font-bold tracking-widest text-xs uppercase py-4 rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-6"
              >
                {isCheckingOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authorizing Secured Transaction...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay Securely ₹{total.toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>

              <div className="flex justify-center items-center gap-1.5 text-[10px] text-slate-400 text-center font-medium mt-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>All transactions are encrypted. Cancel or return items within 30 days.</span>
              </div>
            </form>
          </div>

          {/* Right Column: Checkout Breakdown */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200/60 rounded-xl shadow-xs p-6 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Promotion Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="LUMINA10 / LUMINA20"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-2.5 rounded focus:outline-none focus:border-black transition-colors uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-[#0b1c30] text-white font-bold text-xs px-4 py-2.5 hover:bg-black rounded transition-all cursor-pointer flex-shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-red-600 font-semibold">{promoError}</p>}
                {promoSuccess && <p className="text-[11px] text-green-700 font-semibold">✓ {promoSuccess}</p>}
              </form>

              {/* Pricing Breakdown */}
              <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-5 font-sans">
                <div className="flex justify-between">
                  <span>Gross Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{rawSubtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" />
                      <span>Discount ({discountPercent}%)</span>
                    </span>
                    <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping &amp; Logistics</span>
                  {shippingCost === 0 ? (
                    <span className="text-green-700 font-bold uppercase text-[10px]">Free Shipping</span>
                  ) : (
                    <span className="font-semibold text-slate-900">₹{shippingCost.toLocaleString('en-IN')}</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Estimated GST (18%)</span>
                  <span className="font-semibold text-slate-900">₹{salesTax.toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-slate-200 pt-4 flex justify-between text-black font-extrabold">
                  <span className="text-sm font-extrabold uppercase tracking-wide">Grand Total</span>
                  <span className="text-lg text-slate-900">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Satisfaction Banner */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-5 space-y-3 font-sans">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Lumina Experience Guarantee
              </h3>
              <ul className="space-y-2 text-[11px] text-slate-500 leading-relaxed font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                  <span>Complimentary premium curation details included</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                  <span>Returns accepted within 30 calendar days</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                  <span>Secure 256-bit SSL transaction channel</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
