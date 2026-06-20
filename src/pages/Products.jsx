import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/hardwareData';
import { Search, Grid, List, Star, Heart, CheckCircle2, AlertTriangle, Filter, RotateCcw } from 'lucide-react';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { quickAdd } = useCart();

  // Layout View State
  const [isGridView, setIsGridView] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150000);
  const [selectedSockets, setSelectedSockets] = useState([]);
  const [selectedRamTypes, setSelectedRamTypes] = useState([]);
  const [selectedVramSizes, setSelectedVramSizes] = useState([]);
  const [selectedCapacities, setSelectedCapacities] = useState([]);
  const [rgbSupport, setRgbSupport] = useState('All'); // 'All' | 'Yes' | 'No'
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');

  // Checking builder context flow
  const builderSelectCategory = searchParams.get('selectForBuilder');

  const [products, setProducts] = useState(PRODUCTS);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=100');
        const data = await res.json();
        if (data.success && data.products && data.products.length > 0) {
          const mapped = data.products.map(p => ({
            ...p,
            id: p.id || p._id
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.warn('Backend offline or error fetching products, using local fallback.');
      }
    };
    fetchProducts();
  }, []);

  // Sync state from query parameters on mount or param updates
  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat) {
      setSelectedCategory(cat);
    } else if (builderSelectCategory) {
      setSelectedCategory(builderSelectCategory);
    } else {
      setSelectedCategory('All');
    }
    if (q) {
      setSearchTerm(q);
    }
  }, [searchParams, builderSelectCategory]);

  // Brand Options List
  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand)));
  }, [products]);

  const handleBrandChange = (brandName) => {
    setSelectedBrands(prev => 
      prev.includes(brandName) 
        ? prev.filter(b => b !== brandName) 
        : [...prev, brandName]
    );
  };

  const handleSocketChange = (socketName) => {
    setSelectedSockets(prev => 
      prev.includes(socketName) 
        ? prev.filter(s => s !== socketName) 
        : [...prev, socketName]
    );
  };

  const handleRamTypeChange = (ramName) => {
    setSelectedRamTypes(prev => 
      prev.includes(ramName) 
        ? prev.filter(r => r !== ramName) 
        : [...prev, ramName]
    );
  };

  const handleVramChange = (vramSize) => {
    setSelectedVramSizes(prev => 
      prev.includes(vramSize) 
        ? prev.filter(v => v !== vramSize) 
        : [...prev, vramSize]
    );
  };

  const handleCapacityChange = (capSize) => {
    setSelectedCapacities(prev => 
      prev.includes(capSize) 
        ? prev.filter(c => c !== capSize) 
        : [...prev, capSize]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrands([]);
    setMinPrice(0);
    setMaxPrice(350000);
    setSelectedSockets([]);
    setSelectedRamTypes([]);
    setSelectedVramSizes([]);
    setSelectedCapacities([]);
    setRgbSupport('All');
    setInStockOnly(false);
    setMinRating(0);
    setSortBy('featured');
    setSearchParams({});
  };

  // Main list of compare IDs stored in local storage
  const [comparedIds, setComparedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('compare_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleCompare = (productId) => {
    let updated;
    if (comparedIds.includes(productId)) {
      updated = comparedIds.filter(id => id !== productId);
    } else {
      if (comparedIds.length >= 4) {
        alert("You can compare up to 4 products at a time!");
        return;
      }
      updated = [...comparedIds, productId];
    }
    setComparedIds(updated);
    localStorage.setItem('compare_ids', JSON.stringify(updated));
  };

  // Add parts directly to PC Builder slots
  const handleAddToBuilder = (product) => {
    try {
      const savedBuild = localStorage.getItem('forge_current_build');
      const currentBuild = savedBuild ? JSON.parse(savedBuild) : {};
      
      // Map component category to builder slot key
      const slotMap = {
        'CPUs': 'cpu',
        'Motherboards': 'motherboard',
        'GPUs': 'gpu',
        'RAM': 'ram',
        'Storage': 'ssd',
        'Power Supplies': 'psu',
        'Cases': 'case',
        'Cooling': 'cooler'
      };

      const slotKey = slotMap[product.category];
      if (slotKey) {
        currentBuild[slotKey] = product;
        localStorage.setItem('forge_current_build', JSON.stringify(currentBuild));
        // Redirect back to Builder
        navigate('/builder');
      }
    } catch (e) {
      console.error("Error writing to builder:", e);
    }
  };

  // Core filter logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(query) || 
             p.brand.toLowerCase().includes(query) || 
             p.category.toLowerCase().includes(query)
      );
    }

    // Brands
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Price
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Socket Type (CPU & Motherboards)
    if (selectedSockets.length > 0) {
      result = result.filter(p => {
        const socket = p.specs?.['Socket Type'];
        return socket && selectedSockets.includes(socket);
      });
    }

    // RAM Type (RAM & Motherboards)
    if (selectedRamTypes.length > 0) {
      result = result.filter(p => {
        const ramType = p.specs?.['Type'] || p.specs?.['RAM slots'] || p.specs?.['RAM Support'];
        return ramType && selectedRamTypes.some(rt => ramType.includes(rt));
      });
    }

    // VRAM size (GPUs)
    if (selectedVramSizes.length > 0) {
      result = result.filter(p => {
        const vram = p.specs?.['VRAM'];
        return vram && selectedVramSizes.some(v => vram.includes(v));
      });
    }

    // Storage capacity (SSDs)
    if (selectedCapacities.length > 0) {
      result = result.filter(p => {
        const cap = p.specs?.['Capacity'];
        return cap && selectedCapacities.some(c => cap.includes(c));
      });
    }

    // RGB support
    if (rgbSupport !== 'All') {
      result = result.filter(p => p.specs?.['RGB Support'] === rgbSupport);
    }

    // Stock Status
    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Star rating
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => {
        const scoreA = (a.isFeatured ? 2 : 0) + (a.isTrending ? 1 : 0);
        const scoreB = (b.isFeatured ? 2 : 0) + (b.isTrending ? 1 : 0);
        return scoreB - scoreA;
      });
    }

    return result;
  }, [
    products, selectedCategory, searchTerm, selectedBrands, minPrice, maxPrice, 
    selectedSockets, selectedRamTypes, selectedVramSizes, selectedCapacities, 
    rgbSupport, inStockOnly, minRating, sortBy
  ]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen">
      {/* Title */}
      <div className="mb-8 border-b border-white/5 pb-6 text-left">
        <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Discover PC Hardware</span>
        <h1 className="text-3xl font-black text-white mt-1">Component Marketplace</h1>
        {builderSelectCategory && (
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 text-xs flex items-center gap-2">
            <span className="animate-pulse h-2 w-2 rounded-full bg-blue-400"></span>
            Currently filtering for <strong className="text-white">{builderSelectCategory}</strong> to add to your custom PC build.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 glass-panel p-6 rounded-2xl flex flex-col gap-6 h-fit text-left">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Filter className="w-4 h-4 text-blue-400" />
              Filters
            </div>
            <button
              onClick={clearAllFilters}
              className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Categories select list */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 text-slate-350 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="CPUs">Processors (CPUs)</option>
              <option value="GPUs">Graphics Cards (GPUs)</option>
              <option value="Motherboards">Motherboards</option>
              <option value="RAM">Memory (RAM)</option>
              <option value="Storage">Storage SSDs</option>
              <option value="Power Supplies">Power Supplies (PSUs)</option>
              <option value="Cases">Cabinet Cases</option>
              <option value="Cooling">Coolers & Fans</option>
              <option value="Monitor">Monitors</option>
              <option value="Peripherals">Peripherals</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>

          {/* Price range */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Price Limit</label>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>₹0</span>
              <span className="text-white font-bold font-mono">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="350000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Brands list */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Brand</label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar text-xs">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-2.5 text-slate-350 hover:text-white cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandChange(brand)}
                    className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="group-hover:text-blue-400 transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Socket types */}
          {(selectedCategory === 'All' || selectedCategory === 'CPUs' || selectedCategory === 'Motherboards') && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Socket Type</label>
              <div className="space-y-2 text-xs">
                {['LGA 1700', 'AM5'].map((sock) => (
                  <label key={sock} className="flex items-center gap-2.5 text-slate-350 hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSockets.includes(sock)}
                      onChange={() => handleSocketChange(sock)}
                      className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0"
                    />
                    <span>{sock}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* RAM Generation */}
          {(selectedCategory === 'All' || selectedCategory === 'RAM' || selectedCategory === 'Motherboards') && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Memory Type</label>
              <div className="space-y-2 text-xs">
                {['DDR5', 'DDR4'].map((ram) => (
                  <label key={ram} className="flex items-center gap-2.5 text-slate-350 hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRamTypes.includes(ram)}
                      onChange={() => handleRamTypeChange(ram)}
                      className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0"
                    />
                    <span>{ram}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* GPU VRAM sizes */}
          {(selectedCategory === 'All' || selectedCategory === 'GPUs') && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">VRAM Buffer</label>
              <div className="space-y-2 text-xs">
                {['24GB', '16GB', '12GB', '8GB'].map((vr) => (
                  <label key={vr} className="flex items-center gap-2.5 text-slate-350 hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedVramSizes.includes(vr)}
                      onChange={() => handleVramChange(vr)}
                      className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0"
                    />
                    <span>{vr}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* SSD capacity sizes */}
          {(selectedCategory === 'All' || selectedCategory === 'Storage') && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Capacity</label>
              <div className="space-y-2 text-xs">
                {['2TB', '1TB'].map((sz) => (
                  <label key={sz} className="flex items-center gap-2.5 text-slate-350 hover:text-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCapacities.includes(sz)}
                      onChange={() => handleCapacityChange(sz)}
                      className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0"
                    />
                    <span>{sz}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* RGB Option */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">RGB Support</label>
            <div className="flex bg-[#0F172A] rounded-xl p-1 border border-white/10 text-xs">
              {['All', 'Yes', 'No'].map((rgb) => (
                <button
                  key={rgb}
                  onClick={() => setRgbSupport(rgb)}
                  className={`flex-1 py-1.5 rounded-lg text-center font-semibold cursor-pointer transition-all ${
                    rgbSupport === rgb ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rgb}
                </button>
              ))}
            </div>
          </div>

          {/* Stock */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-slate-350 hover:text-white cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => setInStockOnly(!inStockOnly)}
                className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Minimum Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((star) => (
                <button
                  key={star}
                  onClick={() => setMinRating(minRating === star ? 0 : star)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    minRating >= star
                      ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                      : 'border-white/10 text-slate-500 hover:text-white'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Grid Area */}
        <main className="lg:col-span-3 flex flex-col gap-6">
          {/* Top toolbar */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Query search input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search matching components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0F172A] border border-white/10 text-xs rounded-xl pl-9 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Sorting/Toggle View */}
            <div className="flex items-center justify-between w-full md:w-auto gap-6">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-blue-400 font-bold cursor-pointer text-xs focus:ring-0"
                >
                  <option value="featured" className="bg-[#0F172A]">Popularity</option>
                  <option value="price-asc" className="bg-[#0F172A]">Price: Low to High</option>
                  <option value="price-desc" className="bg-[#0F172A]">Price: High to Low</option>
                  <option value="rating" className="bg-[#0F172A]">User Rating</option>
                </select>
              </div>

              <div className="h-4 w-px bg-white/10"></div>

              {/* Grid/List switch */}
              <div className="flex gap-1.5 bg-[#0F172A] border border-white/10 p-1 rounded-xl">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    isGridView ? 'bg-blue-500 text-white' : 'text-slate-450 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    !isGridView ? 'bg-blue-500 text-white' : 'text-slate-450 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Items Canvas */}
          {filteredProducts.length === 0 ? (
            <div className="glass-panel rounded-3xl py-24 px-6 text-center">
              <p className="text-slate-400 text-sm">No components found matching current filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 bg-blue-500 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                isGridView
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {filteredProducts.map((product) => {
                const isCompared = comparedIds.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className={`glass-panel overflow-hidden transition-all duration-300 hover:border-blue-500/40 flex ${
                      isGridView ? 'flex-col p-5 rounded-2xl relative' : 'p-4 rounded-xl items-center gap-4 relative'
                    }`}
                  >
                    {/* Brand Badge */}
                    <div className="absolute top-4 right-4 bg-[#0F172A]/80 border border-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-blue-400 tracking-wider">
                      {product.badge || 'PRO'}
                    </div>

                    {/* Image Area */}
                    <div
                      className={`bg-[#0F172A] rounded-xl flex items-center justify-center p-4 border border-white/5 ${
                        isGridView ? 'h-44 w-full mb-4' : 'h-20 w-20 flex-shrink-0'
                      }`}
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Meta descriptions */}
                    <div className="text-left flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title and category */}
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                              {product.category}
                            </span>
                            <h3 className="font-bold text-sm text-white hover:text-blue-400 transition-colors line-clamp-1 mt-0.5">
                              <Link to={`/product/${product.id}`}>{product.name}</Link>
                            </h3>
                          </div>
                        </div>

                        {/* Ratings */}
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span className="font-bold text-slate-200">{product.rating}</span>
                          <span>({product.reviews})</span>
                        </div>

                        {/* Specifications */}
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {Object.entries(product.specs || {}).slice(0, 3).map(([key, val]) => (
                            <span
                              key={key}
                              className="text-[9px] bg-[#0F172A] border border-white/5 text-slate-400 px-2 py-0.5 rounded-md font-mono"
                              title={`${key}: ${val}`}
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Pricing/Action strip */}
                      <div
                        className={`pt-4 mt-5 border-t border-white/5 flex items-center justify-between ${
                          isGridView ? '' : 'w-full'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-base font-black text-white">₹{product.price.toLocaleString('en-IN')}</span>
                          <span
                            className={`text-[9px] font-bold uppercase ${
                              product.stock > 0 ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Compare Box */}
                          <label className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isCompared}
                              onChange={() => toggleCompare(product.id)}
                              className="rounded border-white/15 bg-transparent text-blue-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                            />
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Compare</span>
                          </label>

                          {/* Builder Action */}
                          {builderSelectCategory ? (
                            <button
                              onClick={() => handleAddToBuilder(product)}
                              className="bg-purple-500 hover:bg-purple-600 text-white font-bold text-[10px] uppercase px-3.5 py-2 rounded-lg transition-all shadow-sm hover:shadow-[0_0_12px_rgba(139,92,246,0.4)] cursor-pointer"
                            >
                              Select
                            </button>
                          ) : (
                            <button
                              onClick={() => quickAdd(product)}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] uppercase px-3.5 py-2 rounded-lg transition-all hover:shadow-[0_0_12px_rgba(59,130,246,0.4)] active:scale-95 cursor-pointer"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
