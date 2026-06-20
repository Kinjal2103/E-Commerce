import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircle2, ChevronRight, Lock, MapPin, CreditCard, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  // Checkout Step
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  // Form entries
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Financial calculations
  const rawSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingCost = rawSubtotal >= 500 || rawSubtotal === 0 ? 0 : 25.00;
  const salesTax = rawSubtotal * 0.08;
  const total = rawSubtotal + shippingCost + salesTax;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      const generatedNo = 'BF-OR-' + Math.floor(Math.random() * 900000 + 100000);
      setOrderNumber(generatedNo);
      
      // Save order to localStorage order history
      try {
        const storedOrders = localStorage.getItem('forge_orders');
        const orders = storedOrders ? JSON.parse(storedOrders) : [];
        const newOrder = {
          orderId: generatedNo,
          date: new Date().toLocaleDateString(),
          total: total,
          itemsCount: cart.length,
          status: 'Shipped',
          items: cart.map(item => ({ name: item.product.name, price: item.product.price, qty: item.quantity }))
        };
        orders.unshift(newOrder);
        localStorage.setItem('forge_orders', JSON.stringify(orders));
      } catch (err) {
        console.error(err);
      }

      setShowSuccess(true);
      clearCart();
    }, 2000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen">
      {/* Title */}
      <div className="mb-8 border-b border-white/5 pb-6 text-left">
        <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Secure Procurement</span>
        <h1 className="text-3xl font-black text-white mt-1">Order Checkout</h1>
      </div>

      {cart.length === 0 && !showSuccess ? (
        <div className="glass-panel rounded-3xl py-20 px-6 text-center max-w-lg mx-auto">
          <h3 className="text-lg font-bold text-white mb-2">No items in checkout</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Your shopping cart is currently empty. Head over to the components catalog to add products.
          </p>
          <Link
            to="/products"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            Go to Components
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Checkout Steps */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step Progress Tracker */}
            <div className="glass-panel rounded-2xl p-4 flex justify-between items-center text-xs">
              <button
                onClick={() => step > 1 && setStep(1)}
                className={`flex items-center gap-2 font-bold cursor-pointer transition-colors ${
                  step === 1 ? 'text-blue-400' : 'text-slate-450 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">1</span>
                Shipping Details
              </button>
              <ChevronRight className="w-4 h-4 text-slate-650" />
              <button
                onClick={() => step > 2 && setStep(2)}
                className={`flex items-center gap-2 font-bold cursor-pointer transition-colors ${
                  step === 2 ? 'text-blue-400' : 'text-slate-450 hover:text-white'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">2</span>
                Payment Method
              </button>
              <ChevronRight className="w-4 h-4 text-slate-650" />
              <div
                className={`flex items-center gap-2 font-bold select-none ${
                  step === 3 ? 'text-blue-400' : 'text-slate-650'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">3</span>
                Verify Order
              </div>
            </div>

            {/* STEP 1: Shipping Details */}
            {step === 1 && (
              <form onSubmit={handleShippingSubmit} className="glass-panel rounded-2xl p-6 space-y-4 text-left">
                <h3 className="font-bold text-base text-white flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  Shipping Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 uppercase font-bold">First Name</label>
                    <input
                      type="text"
                      required
                      value={shippingData.firstName}
                      onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase font-bold">Last Name</label>
                    <input
                      type="text"
                      required
                      value={shippingData.lastName}
                      onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={shippingData.email}
                    onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase font-bold">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingData.address}
                    onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 uppercase font-bold">City</label>
                    <input
                      type="text"
                      required
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 uppercase font-bold">State</label>
                    <input
                      type="text"
                      required
                      value={shippingData.state}
                      onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase font-bold">Zip Code</label>
                    <input
                      type="text"
                      required
                      value={shippingData.zip}
                      onChange={(e) => setShippingData({ ...shippingData, zip: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase font-bold">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase px-8 py-3 rounded-lg cursor-pointer"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Payment Details */}
            {step === 2 && (
              <form onSubmit={handlePaymentSubmit} className="glass-panel rounded-2xl p-6 space-y-4 text-left">
                <h3 className="font-bold text-base text-white flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  Payment Details
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase font-bold">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 uppercase font-bold">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength="19"
                    placeholder="xxxx xxxx xxxx xxxx"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                    className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 uppercase font-bold">Expiry Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength="5"
                      value={paymentData.cardExpiry}
                      onChange={(e) => setPaymentData({ ...paymentData, cardExpiry: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 uppercase font-bold">CVV Code</label>
                    <input
                      type="password"
                      required
                      maxLength="4"
                      placeholder="•••"
                      value={paymentData.cardCvv}
                      onChange={(e) => setPaymentData({ ...paymentData, cardCvv: e.target.value })}
                      className="w-full bg-[#0F172A] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase rounded-lg cursor-pointer"
                  >
                    Back to Shipping
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase px-8 py-3 rounded-lg cursor-pointer"
                  >
                    Review Order
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Review Details */}
            {step === 3 && (
              <div className="glass-panel rounded-2xl p-6 space-y-6 text-left">
                <h3 className="font-bold text-base text-white flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Review and Complete Order
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  {/* Shipping summary */}
                  <div className="p-4 bg-[#0F172A] border border-white/5 rounded-xl">
                    <h4 className="font-bold text-slate-400 uppercase text-[9px] mb-2 tracking-wider">Shipping Address</h4>
                    <p className="font-bold text-white">{shippingData.firstName} {shippingData.lastName}</p>
                    <p className="text-slate-350">{shippingData.address}</p>
                    <p className="text-slate-350">{shippingData.city}, {shippingData.state} {shippingData.zip}</p>
                    <p className="text-slate-350">Phone: {shippingData.phone}</p>
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 bg-[#0F172A] border border-white/5 rounded-xl">
                    <h4 className="font-bold text-slate-400 uppercase text-[9px] mb-2 tracking-wider">Payment Details</h4>
                    <p className="font-bold text-white">Card Payment</p>
                    <p className="text-slate-350">Holder: {paymentData.cardName}</p>
                    <p className="text-slate-350 font-mono">Number: •••• •••• •••• {paymentData.cardNumber.slice(-4) || '1234'}</p>
                  </div>
                </div>

                {/* Final items summary */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-450 uppercase text-[9px] tracking-wider">Items in Order</h4>
                  <div className="divide-y divide-white/5">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2.5 text-xs">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-bold text-white truncate">{item.product.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">Qty: {item.quantity} @ ${item.product.price.toFixed(2)}</p>
                        </div>
                        <span className="font-bold text-blue-400 font-mono">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between border-t border-white/5">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase rounded-lg cursor-pointer"
                  >
                    Back to Payment
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs uppercase px-10 py-3 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/30"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Authorize & Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Summary column */}
          <div className="lg:col-span-4 glass-panel rounded-3xl p-6 space-y-4 text-left">
            <h3 className="font-bold text-base text-white border-b border-white/5 pb-2">Order Summary</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-white font-mono">${rawSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                {shippingCost === 0 ? (
                  <span className="text-green-400 font-bold uppercase text-[10px]">Free</span>
                ) : (
                  <span className="font-bold text-white font-mono">${shippingCost.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span>Tax (8%)</span>
                <span className="font-bold text-white font-mono">${salesTax.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between text-sm text-white font-bold">
                <span>Total</span>
                <span className="text-base text-blue-400 font-mono">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div className="relative bg-[#1E293B] border border-white/10 max-w-md w-full rounded-2xl p-8 text-center shadow-2xl">
            <div className="mx-auto w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Order Confirmed!</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Thank you for choosing BuildForge. We have received your order payment and started configuring your parts. Receipt and tracking information sent via email.
            </p>

            <div className="bg-[#0F172A] border border-white/5 rounded-xl p-4 text-left text-[10px] space-y-1.5 text-slate-400 font-mono mb-6">
              <div className="flex justify-between">
                <span>Receipt Number:</span>
                <span className="font-bold text-white">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping:</span>
                <span className="font-bold text-white">Within 24 Hours</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase py-3 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              Go to Order History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
