import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/hardwareData';
import { Star, ShoppingCart, Heart, Shield, RotateCcw, Truck, Wrench, BarChart3, ChevronRight } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, quickAdd } = useCart();

  // Find product with backend fetch & local fallback
  const localFallback = useMemo(() => {
    return PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  }, [id]);

  const [product, setProduct] = useState(localFallback);

  useEffect(() => {
    // Synchronize initial state if ID changes
    setProduct(localFallback);

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          const mappedProduct = {
            ...data.product,
            id: data.product.id || data.product._id
          };
          setProduct(mappedProduct);
        }
      } catch (err) {
        console.warn('Backend offline or error fetching product, using local fallback.');
      }
    };
    fetchProduct();
  }, [id, localFallback]);

  // Image Zoom states
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  const handleMouseMove = (e) => {
    if (!product) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${product.imageUrl})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  // Quantity Selector
  const [quantity, setQuantity] = useState(1);

  // Active Tab
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Specs' | 'Compatibility' | 'Benchmarks' | 'Reviews'

  // Load build from local storage to check compatibility
  const [currentBuild, setCurrentBuild] = useState({});
  useEffect(() => {
    try {
      const saved = localStorage.getItem('forge_current_build');
      if (saved) setCurrentBuild(JSON.parse(saved));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Compute product compatibility details
  const compatibilityReport = useMemo(() => {
    if (!product) return { compatible: true, details: 'No active builds loaded' };
    
    // CPUs & Motherboards Check
    if (product.category === 'CPUs' && currentBuild.motherboard) {
      const cpuSocket = product.specs?.['Socket Type'];
      const mbSocket = currentBuild.motherboard.specs?.['Socket Type'];
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        return { compatible: false, reason: `Socket Conflict: CPU requires ${cpuSocket} but motherboard has ${mbSocket}` };
      }
    }
    if (product.category === 'Motherboards' && currentBuild.cpu) {
      const cpuSocket = currentBuild.cpu.specs?.['Socket Type'];
      const mbSocket = product.specs?.['Socket Type'];
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        return { compatible: false, reason: `Socket Conflict: Motherboard has ${mbSocket} but CPU requires ${cpuSocket}` };
      }
    }

    // RAM & Motherboards Check
    if (product.category === 'RAM' && currentBuild.motherboard) {
      const ramType = product.specs?.['Type'];
      const mbRamType = currentBuild.motherboard.specs?.['RAM Slots'];
      if (ramType && mbRamType && !mbRamType.includes(ramType)) {
        return { compatible: false, reason: `Memory Mismatch: RAM is ${ramType} but motherboard slots support ${mbRamType}` };
      }
    }

    return { compatible: true, details: 'Compatible with current components in your build configuration.' };
  }, [product, currentBuild]);

  const handleBuyNow = () => {
    addToCart(product, quantity, 'Default', 'Standard');
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, 'Default', 'Standard');
  };

  // Static FPS values for GPU / CPU benchmarks
  const benchmarkFPS = useMemo(() => {
    if (!product) return null;
    const isGPU = product.category === 'GPUs';
    const isCPU = product.category === 'CPUs';

    if (isGPU || isCPU) {
      // Scale based on price / tier
      const scale = product.price > 1000 ? 1.0 : product.price > 500 ? 0.8 : 0.6;
      return [
        { game: 'Cyberpunk 2077 (RT)', '1080p': Math.round(180 * scale), '1440p': Math.round(120 * scale), '4K': Math.round(65 * scale) },
        { game: 'Counter-Strike 2', '1080p': Math.round(750 * scale), '1440p': Math.round(520 * scale), '4K': Math.round(310 * scale) },
        { game: 'Valorant', '1080p': Math.round(850 * scale), '1440p': Math.round(680 * scale), '4K': Math.round(440 * scale) },
        { game: 'GTA V', '1080p': Math.round(260 * scale), '1440p': Math.round(200 * scale), '4K': Math.round(120 * scale) }
      ];
    }
    return null;
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20 font-sans mt-8 text-center min-h-screen text-white">
        <p className="text-slate-400">Loading product details or component not found...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 text-left">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-xs text-slate-400 font-bold uppercase">
        <Link to="/products" className="hover:text-blue-400">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${product.category}`} className="hover:text-blue-400">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white truncate">{product.name}</span>
      </nav>

      {/* Main Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
        {/* Left Gallery - Single Image */}
        <div className="lg:col-span-7 flex gap-4 h-fit">
          {/* Large Image Zoom Area */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full bg-[#111827] border border-white/5 rounded-3xl p-8 flex items-center justify-center min-h-[400px] relative overflow-hidden cursor-crosshair"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[380px] max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
            {/* Zoom display window */}
            <div
              style={{
                ...zoomStyle,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                backgroundRepeat: 'no-repeat'
              }}
              className="bg-[#111827]"
            />
            {product.stock > 0 && (
              <span className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Right Info pane */}
        <div className="lg:col-span-5 flex flex-col gap-6 text-left">
          <div className="space-y-2">
            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg border border-blue-500/10 text-xs font-bold tracking-wider uppercase font-mono">
              {product.brand}
            </span>
            <h1 className="text-3xl font-black text-white leading-tight mt-2">{product.name}</h1>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      product.rating > i ? 'fill-yellow-500 text-yellow-500' : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-450 text-xs font-bold">({product.reviews} customer reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-y border-white/5 py-4 flex items-baseline gap-4">
            <span className="text-3xl font-black text-blue-400">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="text-xs text-slate-500 font-semibold font-mono">Est. Shipping: FREE</span>
          </div>

          {/* Summary Specs Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {Object.entries(product.specs || {}).slice(0, 4).map(([key, val]) => (
              <div key={key} className="bg-[#1E293B] border border-white/5 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">{key}</span>
                <span className="text-xs text-white font-bold">{val}</span>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-white/10 rounded-xl bg-[#111827]">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-3.5 py-2.5 text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-sm text-white font-bold font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-3.5 py-2.5 text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all hover:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBuyNow}
                className="bg-transparent border border-blue-500/30 hover:bg-blue-500/5 text-blue-400 font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer"
              >
                Buy It Now
              </button>
              <button
                onClick={() => navigate('/builder')}
                className="bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Wrench className="w-4 h-4 text-blue-400" />
                Configure in Builder
              </button>
            </div>
          </div>

          {/* Secure details */}
          <div className="bg-[#111827]/50 rounded-2xl border border-white/5 p-4 space-y-3.5 text-xs text-slate-455">
            <div className="flex gap-3">
              <Truck className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Free Express Delivery</p>
                <p className="text-[10px] text-slate-400">Guaranteed packaging delivery within 3-5 business days.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">3-Year Manufacturer Warranty</p>
                <p className="text-[10px] text-slate-400">Direct component returns and replacements processed through BuildForge.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs panels */}
      <section className="border-t border-white/5 pt-10">
        {/* Tab Buttons */}
        <div className="flex gap-6 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar mb-8">
          {['Overview', 'Specs', 'Compatibility', 'Benchmarks', 'Reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-xs uppercase tracking-widest font-bold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content canvasses */}
        <div className="text-slate-350 leading-relaxed text-sm">
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="font-bold text-lg text-white mb-3">Product Overview</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {product.description || `The ${product.name} is engineered to deliver peak computing outputs. Built using next-generation architecture design tokens, it features advanced power regulations, high thermal dispersion, and custom firmware modules designed to maximize stability during prolonged gaming and rendering tasks.`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                  <div className="bg-[#111827] p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-blue-400 font-black text-2xl font-mono">100%</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mt-1">Quality Inspected</span>
                  </div>
                  <div className="bg-[#111827] p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-blue-400 font-black text-2xl font-mono">Zero</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mt-1">Noise Fan Modes</span>
                  </div>
                  <div className="bg-[#111827] p-4 rounded-xl border border-white/5 text-center">
                    <span className="text-blue-400 font-black text-2xl font-mono">Boost</span>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mt-1">Ready Clocks</span>
                  </div>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl text-left">
                  <h4 className="font-bold text-green-400 text-sm mb-3">Pros / Advantages</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(product.pros || []).map((pro, i) => <li key={i}>✓ {pro}</li>)}
                  </ul>
                </div>
                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-left">
                  <h4 className="font-bold text-red-400 text-sm mb-3">Cons / Tradeoffs</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(product.cons || []).map((con, i) => <li key={i}>✗ {con}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Specs' && (
            <div className="glass-panel rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#111827] text-white font-bold border-b border-white/5">
                    <th className="p-4">Specification Parameter</th>
                    <th className="p-4">Detail Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {Object.entries(product.specs || {}).map(([key, val]) => (
                    <tr key={key} className="hover:bg-white/5">
                      <td className="p-4 font-bold text-slate-400">{key}</td>
                      <td className="p-4 font-mono">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Compatibility' && (
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  compatibilityReport.compatible ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {compatibilityReport.compatible ? '✓' : '!'}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Compatibility Analysis</h4>
                  <p className="text-xs text-slate-400">Validated against currently selected components in the custom PC builder.</p>
                </div>
              </div>

              <div className="p-4 bg-[#111827] rounded-xl border border-white/5 text-xs">
                {compatibilityReport.compatible ? (
                  <p className="text-green-400 font-semibold">{compatibilityReport.details}</p>
                ) : (
                  <p className="text-red-400 font-bold">{compatibilityReport.reason}</p>
                )}
              </div>

              <div className="text-xs text-slate-400 space-y-2 pt-2">
                <p className="font-bold text-white mb-2">Build Slots Currently Selected:</p>
                <p>CPU: <strong className="text-white">{currentBuild.cpu?.name || 'None Selected'}</strong></p>
                <p>Motherboard: <strong className="text-white">{currentBuild.motherboard?.name || 'None Selected'}</strong></p>
                <p>RAM: <strong className="text-white">{currentBuild.ram?.name || 'None Selected'}</strong></p>
              </div>
            </div>
          )}

          {activeTab === 'Benchmarks' && (
            <div className="glass-panel p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-base text-white">Dynamic Gaming Benchmarks</h3>
                <span className="text-xs text-slate-400 font-mono">FPS values derived at Max/Ultra settings</span>
              </div>

              {benchmarkFPS ? (
                <div className="space-y-6">
                  {benchmarkFPS.map((bench, idx) => (
                    <div key={idx} className="space-y-2 text-xs">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{bench.game}</span>
                        <div className="flex gap-4 font-mono text-[10px] text-slate-450">
                          <span>1080p: <strong className="text-blue-400">{bench['1080p']} FPS</strong></span>
                          <span>1445p: <strong className="text-purple-400">{bench['1440p']} FPS</strong></span>
                          <span>4K: <strong className="text-white">{bench['4K']} FPS</strong></span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-[#111827] rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (bench['1080p'] / 900) * 100)}%` }}></div>
                        <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, (bench['1440p'] / 900) * 100)}%` }}></div>
                        <div className="h-full bg-slate-400" style={{ width: `${Math.min(100, (bench['4K'] / 900) * 100)}%` }}></div>
                      </div>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-500 text-center pt-2 font-mono">
                    Note: Actual frame rates vary based on memory speeds, thermal thresholds, and BIOS configurations.
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">
                  Benchmarks are only relevant for CPUs and Graphics Cards.
                </div>
              )}
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="space-y-6">
              {/* Star breakdown */}
              <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="text-center md:border-r border-white/5 py-2">
                  <h4 className="text-4xl font-black text-white">{product.rating}</h4>
                  <div className="flex justify-center text-yellow-500 my-2">
                    ★ ★ ★ ★ ★
                  </div>
                  <span className="text-xs text-slate-400 font-semibold block">Based on {product.reviews} reviews</span>
                </div>
                <div className="md:col-span-2 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>5 Star</span>
                    <div className="h-1.5 flex-1 bg-[#111827] rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: '85%' }}></div>
                    </div>
                    <span>85%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>4 Star</span>
                    <div className="h-1.5 flex-1 bg-[#111827] rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: '12%' }}></div>
                    </div>
                    <span>12%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>3 Star</span>
                    <div className="h-1.5 flex-1 bg-[#111827] rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: '3%' }}></div>
                    </div>
                    <span>3%</span>
                  </div>
                </div>
              </div>

              {/* Individual review cards */}
              <div className="space-y-4 text-xs text-slate-400 text-left">
                <div className="glass-panel p-5 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-white">Alexander K.</p>
                      <div className="flex text-yellow-500 text-[10px] mt-0.5">★ ★ ★ ★ ★</div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">2 days ago</span>
                  </div>
                  <p className="text-slate-350 leading-relaxed">
                    Runs extremely quiet under heavy gaming. Configured it inside the Phanteks NV7 cabinet and it looks spectacular. Solid frame rates on Cyberpunk 4K!
                  </p>
                </div>

                <div className="glass-panel p-5 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-white">Linus V.</p>
                      <div className="flex text-yellow-500 text-[10px] mt-0.5">★ ★ ★ ★ ★</div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">1 week ago</span>
                  </div>
                  <p className="text-slate-350 leading-relaxed">
                    Unbelievable performance. Heavy design rendering tasks complete in seconds compared to my previous rig. Highly recommend pairing with ATX 3.0 power supply.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
