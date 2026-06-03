import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, CheckCircle2, Star, Check, ShoppingBag, Truck, RotateCcw, ShieldAlert } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  // Async states from backend
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configured Product Options
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [sizeWarning, setSizeWarning] = useState(false);
  const [colorWarning, setColorWarning] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  // Fetch product detail and matching related products from backend
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // 1. Fetch main product details
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        
        if (data.success && data.product) {
          setProduct(data.product);
          setSelectedColor(data.product.colors && data.product.colors.length > 0 ? data.product.colors[0].name : '');
          setSelectedSize(data.product.sizes && data.product.sizes.length > 0 ? data.product.sizes[0] : '');
          setQuantity(1);
          setActiveImage(data.product.imageUrl);
          setActiveTab('details');

          // 2. Fetch related products by category
          const relatedRes = await fetch(`/api/products?category=${encodeURIComponent(data.product.category)}`);
          const relatedData = await relatedRes.json();
          if (relatedData.success) {
            // Filter out current product
            const filtered = relatedData.products.filter(p => p.id !== id).slice(0, 4);
            setRelatedProducts(filtered);
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error loading product detail from server:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    setSizeWarning(false);
    setColorWarning(false);
    setSuccessBanner(false);
  }, [id]);

  // Handle Add to cart selection validation
  const handleAddToBag = () => {
    let hasError = false;
    if (!selectedColor) {
      setColorWarning(true);
      hasError = true;
    } else {
      setColorWarning(false);
    }

    if (!selectedSize) {
      setSizeWarning(true);
      hasError = true;
    } else {
      setSizeWarning(false);
    }

    if (!hasError && product) {
      addToCart(product, quantity, selectedColor, selectedSize);
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 3500);
      
      // Auto open drawer to show successful add
      setTimeout(() => {
        setIsCartOpen(true);
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-20 text-center font-sans space-y-4">
        <svg className="animate-spin h-8 w-8 text-black mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading Premium details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-20 text-center font-sans">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto stroke-[1.2] mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Premium Item Not Located</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
          The requested product ID could not be matched with any of the architectural items in the Lumina catalogue.
        </p>
        <Link
          to="/products"
          className="mt-6 bg-black text-white text-xs font-bold tracking-widest uppercase py-3 px-6 hover:bg-slate-800 rounded transition-colors cursor-pointer inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-12 font-sans">
      {/* Back button link */}
      <button
        onClick={() => navigate(-1)}
        className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0b1c30] hover:text-slate-500 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Success banner alert */}
      {successBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg flex items-center justify-between text-xs font-medium animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span>
              Successfully added <strong className="text-black">{quantity}x {product.name}</strong> ({selectedColor}, Size {selectedSize}) to your shopping bag!
            </span>
          </div>
          <button
            onClick={() => setSuccessBanner(false)}
            className="text-slate-500 hover:text-black font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Details split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN: Gallery View */}
        <div className="space-y-4">
          {/* Active Primary display */}
          <div className="aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden border border-slate-100 relative shadow-sm">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Miniature swatches row */}
          {product.thumbnails && product.thumbnails.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setActiveImage(product.imageUrl)}
                className={`aspect-square bg-slate-50 rounded-lg overflow-hidden border transition-all ${
                  activeImage === product.imageUrl ? 'border-black ring-2 ring-black/10' : 'border-slate-200 hover:border-slate-400'
                }`}
              >
                <img src={product.imageUrl} alt="Primary" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
              
              {product.thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(thumb)}
                  className={`aspect-square bg-slate-50 rounded-lg overflow-hidden border transition-all ${
                    activeImage === thumb ? 'border-black ring-2 ring-black/10' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={thumb} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Options purchasing specs */}
        <div className="flex flex-col justify-start space-y-6">
          <div className="space-y-2 border-b border-slate-105 pb-5">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-[0.15em] text-slate-400 font-bold">
                {product.category}
              </span>
              
              <div className="flex items-center gap-1 text-slate-500 text-xs font-mono">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <strong className="text-black font-semibold font-sans">{product.rating}</strong> ({product.reviews || 24} reviews)
              </div>
            </div>

            <h1 className="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-[#0b1c30]">
              {product.name}
            </h1>

            <p className="text-xl font-extrabold text-[#0b1c30] pt-1">
              ₹{product.price.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Color selects */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-wider font-bold text-[#0b1c30]">Select Style:</span>
                <span className="font-medium text-slate-550">{selectedColor || 'None chosen'}</span>
              </div>
              
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setColorWarning(false);
                    }}
                    title={color.name}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                      selectedColor === color.name
                        ? 'border-black ring-4 ring-black/10 scale-105'
                        : 'border-slate-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {selectedColor === color.name && (
                      <Check className={`w-4 h-4 ${
                        color.hex === '#ffffff' ? 'text-black' : 'text-white'
                      }`} />
                    )}
                  </button>
                ))}
              </div>
              {colorWarning && <p className="text-xs text-red-600 font-semibold">Please select a style color swatch.</p>}
            </div>
          )}

          {/* Size Selects */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="uppercase tracking-wider font-bold text-[#0b1c30]">Select Size:</span>
                <a href="#" className="font-medium text-slate-500 hover:text-black underline">Size Guide</a>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeWarning(false);
                    }}
                    className={`min-w-12 h-10 px-4 text-xs font-bold tracking-wider rounded border uppercase transition-all flex items-center justify-center cursor-pointer ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-slate-200 text-slate-650 hover:border-slate-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeWarning && <p className="text-xs text-red-600 font-semibold">Please select an available size badge.</p>}
            </div>
          )}

          {/* Quantity selector */}
          <div className="space-y-3 pt-2">
            <span className="block text-xs uppercase tracking-wider font-bold text-[#0b1c30]">Quantity:</span>
            <div className="inline-flex items-center border border-slate-200 rounded-md bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1.5 text-slate-500 hover:text-black font-semibold text-base cursor-pointer"
              >
                -
              </button>
              <span className="px-5 text-sm font-bold font-mono text-slate-800">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1.5 text-slate-500 hover:text-black font-semibold text-base cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Main CTA purchase trigger */}
          <div className="space-y-2 pt-4 font-sans">
            <button
              onClick={handleAddToBag}
              className="w-full bg-black hover:bg-slate-800 text-white font-bold tracking-widest text-[#f8f9ff] text-xs uppercase py-4 rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Shopping Bag
            </button>
            
            <div className="flex justify-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3">
              <p className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-slate-350" /> Free Delivery &gt;₹15,000</p>
              <p className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5 text-slate-350" /> 30-Day Free Return</p>
            </div>
          </div>

          {/* Material Accordions & Details */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            {/* Options Tabs */}
            <div className="flex border-b border-slate-100 text-xs">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-2 px-4 uppercase tracking-wider font-bold border-b-2 cursor-pointer ${
                  activeTab === 'details' ? 'border-black text-black font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`py-2 px-4 uppercase tracking-wider font-bold border-b-2 cursor-pointer ${
                  activeTab === 'materials' ? 'border-black text-black font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
              >
                Composition
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`py-2 px-4 uppercase tracking-wider font-bold border-b-2 cursor-pointer ${
                  activeTab === 'care' ? 'border-black text-black font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-650'
                }`}
              >
                Maintenance
              </button>
            </div>

            {/* Content holder */}
            <div className="text-xs text-slate-500 leading-relaxed min-h-24 font-sans">
              {activeTab === 'details' && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <p>{product.description}</p>
                  <p className="font-medium text-slate-800 mt-2 font-mono text-[10px]">Product Ref: LMN-{product.id?.slice(0, 8).toUpperCase()}</p>
                </div>
              )}
              {activeTab === 'materials' && (
                <p className="animate-in fade-in duration-200">
                  {product.materials ||
                    'Premium organic fibers processed without pesticides. Carefully sourced following circular ethical standards to prevent long-term environmental depletion.'}
                </p>
              )}
              {activeTab === 'care' && (
                <p className="animate-in fade-in duration-200">
                  {product.care ||
                    'Machine wash cold gentle with wool-safe formulas. Do not tumble dry. Always dry flat in shade to safeguard high-precision seams from extreme high temperatures.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RECOMMENDED upsell accessories footer slider */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-slate-200 pt-10">
          <div className="flex flex-col mb-6">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Curated Picks</span>
            <h3 className="text-lg font-bold text-[#0b1c30]">Pair With These Pieces</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-slate-200/45 p-3 flex flex-col hover:border-slate-450 hover:shadow-sm transition-all duration-300 block"
              >
                <div className="aspect-[3/4] bg-slate-50 rounded overflow-hidden mb-3">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-350"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h4 className="font-semibold text-xs text-slate-800 group-hover:underline truncate">
                  {p.name}
                </h4>
                <p className="text-xs font-bold text-slate-900 mt-1">₹{p.price.toLocaleString('en-IN')}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
