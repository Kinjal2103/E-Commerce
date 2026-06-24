import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Search, Grid, List, Star, AlertTriangle, Filter, RotateCcw, X } from 'lucide-react';

const backendSortMap = {
  'price-asc': 'price',
  'price-desc': '-price',
  'rating': '-rating',
  'featured': '-isFeatured,-isTrending,-rating'
};

const SkeletonCard = () => (
  <div className="glass-panel p-5 rounded-2xl relative animate-pulse flex flex-col h-full border border-white/5 text-left">
    <div className="h-40 w-full bg-white/5 rounded-xl mb-4"></div>
    <div className="h-3 bg-white/5 rounded w-1/4 mb-2"></div>
    <div className="h-5 bg-white/5 rounded w-3/4 mb-3"></div>
    <div className="h-3 bg-white/5 rounded w-1/2 mb-4"></div>
    <div className="flex gap-1.5 mb-4">
      <div className="h-5 bg-white/5 rounded w-12"></div>
      <div className="h-5 bg-white/5 rounded w-12"></div>
      <div className="h-5 bg-white/5 rounded w-12"></div>
    </div>
    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
      <div className="h-6 bg-white/5 rounded w-20"></div>
      <div className="h-6 bg-white/5 rounded w-16"></div>
    </div>
  </div>
);

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { quickAdd } = useCart();

  // Layout View State
  const [isGridView, setIsGridView] = useState(true);

  // Categories list (fetched from database)
  const [categoriesList, setCategoriesList] = useState([]);
  
  // Backend products data & computed filters
  const [products, setProducts] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [availableFilters, setAvailableFilters] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parsing values from URL parameters (Single Source of Truth)
  const builderSelectCategory = searchParams.get('selectForBuilder');
  const category = builderSelectCategory || searchParams.get('category') || 'All';
  const searchTerm = searchParams.get('search') || '';
  const minPrice = Number(searchParams.get('minPrice')) || 0;
  const maxPrice = Number(searchParams.get('maxPrice')) || 350000;
  const selectedBrands = useMemo(() => searchParams.get('brand') ? searchParams.get('brand').split(',') : [], [searchParams]);
  const selectedSockets = useMemo(() => searchParams.get('socket') ? searchParams.get('socket').split(',') : [], [searchParams]);
  const selectedRamTypes = useMemo(() => searchParams.get('ramType') ? searchParams.get('ramType').split(',') : [], [searchParams]);
  const selectedVramSizes = useMemo(() => searchParams.get('vram') ? searchParams.get('vram').split(',') : [], [searchParams]);
  const selectedCapacities = useMemo(() => searchParams.get('capacity') ? searchParams.get('capacity').split(',') : [], [searchParams]);
  const rgbSupport = searchParams.get('rgb') || 'All';
  const inStockOnly = searchParams.get('stock') === 'true';
  const minRating = Number(searchParams.get('rating')) || 0;
  const sortBy = searchParams.get('sort') || 'featured';
  const page = Number(searchParams.get('page')) || 1;

  // Local input states for smooth slider dragging and typing without immediate API spamming
  const [localSearchInput, setLocalSearchInput] = useState(searchTerm);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  // Sync local inputs when URL values change (e.g. on reset or back button)
  useEffect(() => {
    setLocalSearchInput(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  // Fetch categories from DB on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/products/categories');
        const data = await res.json();
        if (data.success && data.categories) {
          setCategoriesList(data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products and dynamic filters whenever searchParams change
  useEffect(() => {
    const fetchProductsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams(searchParams);
        
        // Ensure Builder Category takes precedence if active
        if (builderSelectCategory) {
          queryParams.set('category', builderSelectCategory);
        }

        // Map sort parameter for backend API compatibility
        const currentSort = queryParams.get('sort') || 'featured';
        queryParams.set('sort', backendSortMap[currentSort]);
        
        // Set pagination parameters (12 products per page)
        queryParams.set('limit', '12');

        const response = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products.map(p => ({ ...p, id: p.id || p._id })));
          setTotalResults(data.totalResults);
          setAvailableFilters(data.filters);
        } else {
          setError(data.message || 'Failed to fetch products from backend.');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Could not connect to the server. Please verify the backend is running.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsData();
  }, [searchParams, builderSelectCategory]);

  // Helper to modify a single filter parameter and update URL
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Reset to page 1 on filter changes to prevent empty page states
    newParams.delete('page');

    if (
      value === undefined || 
      value === null || 
      value === '' || 
      value === 0 ||
      value === '0' ||
      value === 'All' || 
      value === false || 
      (Array.isArray(value) && value.length === 0)
    ) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.set(key, value.join(','));
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams);
  };

  const handleMultiSelectChange = (key, val, currentSelected) => {
    const updated = currentSelected.includes(val)
      ? currentSelected.filter(item => item !== val)
      : [...currentSelected, val];
    updateFilter(key, updated);
  };

  const clearAllFilters = () => {
    setLocalSearchInput('');
    setLocalMaxPrice(350000);
    // Retain builder selection parameter if present
    if (builderSelectCategory) {
      setSearchParams({ selectForBuilder: builderSelectCategory });
    } else {
      setSearchParams({});
    }
  };

  // Compare List local storage management
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

  const handleAddToBuilder = (product) => {
    try {
      const savedBuild = localStorage.getItem('forge_current_build');
      const currentBuild = savedBuild ? JSON.parse(savedBuild) : {};
      
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
        navigate('/builder');
      }
    } catch (e) {
      console.error("Error writing to builder:", e);
    }
  };

  // Build list of active filter chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (category !== 'All' && !builderSelectCategory) {
      chips.push({ label: `Category: ${category}`, onRemove: () => updateFilter('category', 'All') });
    }
    if (searchTerm) {
      chips.push({ label: `Search: "${searchTerm}"`, onRemove: () => updateFilter('search', '') });
    }
    selectedBrands.forEach(b => {
      chips.push({ label: `Brand: ${b}`, onRemove: () => handleMultiSelectChange('brand', b, selectedBrands) });
    });
    selectedSockets.forEach(s => {
      chips.push({ label: `Socket: ${s}`, onRemove: () => handleMultiSelectChange('socket', s, selectedSockets) });
    });
    selectedRamTypes.forEach(r => {
      chips.push({ label: `RAM: ${r}`, onRemove: () => handleMultiSelectChange('ramType', r, selectedRamTypes) });
    });
    selectedVramSizes.forEach(v => {
      chips.push({ label: `VRAM: ${v}`, onRemove: () => handleMultiSelectChange('vram', v, selectedVramSizes) });
    });
    selectedCapacities.forEach(c => {
      chips.push({ label: `Capacity: ${c}`, onRemove: () => handleMultiSelectChange('capacity', c, selectedCapacities) });
    });
    if (rgbSupport !== 'All') {
      chips.push({ label: `RGB: ${rgbSupport}`, onRemove: () => updateFilter('rgb', 'All') });
    }
    if (inStockOnly) {
      chips.push({ label: 'In Stock Only', onRemove: () => updateFilter('stock', false) });
    }
    if (minRating > 0) {
      chips.push({ label: `Rating: ${minRating}+ ★`, onRemove: () => updateFilter('rating', 0) });
    }
    if (minPrice > 0 || maxPrice < 350000) {
      chips.push({
        label: `Price: ₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`,
        onRemove: () => {
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('minPrice');
          newParams.delete('maxPrice');
          setSearchParams(newParams);
        }
      });
    }
    return chips;
  }, [
    category, builderSelectCategory, searchTerm, selectedBrands, selectedSockets, 
    selectedRamTypes, selectedVramSizes, selectedCapacities, rgbSupport, 
    inStockOnly, minRating, minPrice, maxPrice, searchParams
  ]);

  // Extract dynamic filter option lists with counts from the backend response
  const brandOptions = availableFilters?.brands || [];
  const socketsOptions = availableFilters?.sockets || [];
  const ramTypeOptions = availableFilters?.ramTypes || [];
  const vramOptions = availableFilters?.vramSizes || [];
  const capacityOptions = availableFilters?.capacities || [];
  const inStockCount = availableFilters?.inStockCount || 0;

  const totalPages = Math.ceil(totalResults / 12);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen">
      {/* Header banner */}
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

          {/* Dynamic Categories Dropdown */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Category</label>
            <select
              value={category}
              disabled={!!builderSelectCategory}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full bg-[#0F172A] border border-white/10 text-slate-300 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:outline-none disabled:opacity-60"
            >
              <option value="All">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Price Limit</label>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span>₹0</span>
              <span className="text-white font-bold">₹{localMaxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="0"
              max="350000"
              step="1000"
              value={localMaxPrice}
              onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
              onMouseUp={() => updateFilter('maxPrice', localMaxPrice)}
              onTouchEnd={() => updateFilter('maxPrice', localMaxPrice)}
              className="w-full h-1 bg-[#1E293B] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Brands list */}
          {brandOptions.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Brand</label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar text-xs">
                {brandOptions.map((opt) => (
                  <label key={opt.name} className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(opt.name)}
                        onChange={() => handleMultiSelectChange('brand', opt.name, selectedBrands)}
                        className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="group-hover:text-blue-400 transition-colors">{opt.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">({opt.count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Sockets list (Only shown if products in search space contain sockets) */}
          {socketsOptions.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Socket Type</label>
              <div className="space-y-2 text-xs">
                {socketsOptions.map((opt) => (
                  <label key={opt.name} className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedSockets.includes(opt.name)}
                        onChange={() => handleMultiSelectChange('socket', opt.name, selectedSockets)}
                        className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0"
                      />
                      <span className="group-hover:text-blue-400 transition-colors">{opt.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">({opt.count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic RAM Generation (Only shown if products in search space contain RAM parameters) */}
          {ramTypeOptions.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Memory Type</label>
              <div className="space-y-2 text-xs">
                {ramTypeOptions.map((opt) => (
                  <label key={opt.name} className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedRamTypes.includes(opt.name)}
                        onChange={() => handleMultiSelectChange('ramType', opt.name, selectedRamTypes)}
                        className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0"
                      />
                      <span className="group-hover:text-blue-400 transition-colors">{opt.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">({opt.count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic VRAM buffers (Only shown if products in search space contain VRAM values) */}
          {vramOptions.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">VRAM Buffer</label>
              <div className="space-y-2 text-xs">
                {vramOptions.map((opt) => (
                  <label key={opt.name} className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedVramSizes.includes(opt.name)}
                        onChange={() => handleMultiSelectChange('vram', opt.name, selectedVramSizes)}
                        className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0"
                      />
                      <span className="group-hover:text-blue-400 transition-colors">{opt.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">({opt.count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Storage Capacity (Only shown if products in search space contain Capacity spec) */}
          {capacityOptions.length > 0 && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Capacity</label>
              <div className="space-y-2 text-xs">
                {capacityOptions.map((opt) => (
                  <label key={opt.name} className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedCapacities.includes(opt.name)}
                        onChange={() => handleMultiSelectChange('capacity', opt.name, selectedCapacities)}
                        className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0"
                      />
                      <span className="group-hover:text-blue-400 transition-colors">{opt.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">({opt.count})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* RGB Support Filter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">RGB Support</label>
            <div className="flex bg-[#0F172A] rounded-xl p-1 border border-white/10 text-xs">
              {['All', 'Yes', 'No'].map((rgb) => (
                <button
                  key={rgb}
                  onClick={() => updateFilter('rgb', rgb)}
                  className={`flex-1 py-1.5 rounded-lg text-center font-semibold cursor-pointer transition-all ${
                    rgbSupport === rgb ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rgb}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Filter */}
          <div className="pt-2">
            <label className="flex items-center justify-between text-slate-300 hover:text-white cursor-pointer text-xs group">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={() => updateFilter('stock', !inStockOnly)}
                  className="rounded border-white/10 bg-[#0F172A] text-blue-500 focus:ring-0"
                />
                <span>In Stock Only</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">({inStockCount})</span>
            </label>
          </div>

          {/* Rating filter */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Minimum Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => updateFilter('rating', minRating === star ? 0 : star)}
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
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Press Enter to search..."
                value={localSearchInput}
                onChange={(e) => setLocalSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateFilter('search', localSearchInput);
                  }
                }}
                className="w-full bg-[#0F172A] border border-white/10 text-xs rounded-xl pl-9 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Sorting, count and view toggle */}
            <div className="flex items-center justify-between w-full md:w-auto gap-6">
              <div className="text-xs text-slate-400 font-medium">
                {isLoading ? (
                  <span>Loading parts...</span>
                ) : (
                  <span>Showing <strong className="text-white font-bold">{totalResults}</strong> components</span>
                )}
              </div>

              <div className="h-4 w-px bg-white/10"></div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => updateFilter('sort', e.target.value)}
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
                    isGridView ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                    !isGridView ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Chips Bar */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center bg-[#0F172A]/40 border border-white/5 p-3 rounded-2xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Filter className="w-3 h-3 text-blue-400" />
                Active filters
              </span>
              {activeChips.map((chip, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold"
                >
                  <span>{chip.label}</span>
                  <button
                    onClick={chip.onRemove}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-[10px] text-slate-400 hover:text-red-400 font-bold uppercase tracking-wider ml-auto cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Products Loading / Error / Empty States */}
          {isLoading ? (
            <div
              className={
                isGridView
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="glass-panel rounded-3xl py-16 px-6 text-center text-red-400 flex flex-col items-center gap-3">
              <AlertTriangle className="w-12 h-12 text-red-500 animate-bounce" />
              <p className="text-sm font-semibold">{error}</p>
              <button
                onClick={clearAllFilters}
                className="mt-2 bg-blue-500 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel rounded-3xl py-24 px-6 text-center">
              <p className="text-slate-400 text-sm">No components found matching the selected filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 bg-blue-500 text-white font-bold text-xs uppercase px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Product Grid / List view */}
              <div
                className={
                  isGridView
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {products.map((product) => {
                  const isCompared = comparedIds.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      className={`glass-panel overflow-hidden transition-all duration-300 hover:border-blue-500/40 flex ${
                        isGridView ? 'flex-col p-5 rounded-2xl relative' : 'p-4 rounded-xl items-center gap-4 relative'
                      }`}
                    >
                      {/* Badge (Brand or Pro) */}
                      <div className="absolute top-4 right-4 bg-[#0F172A]/85 border border-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-blue-400 tracking-wider">
                        {product.badge || product.brand || 'PRO'}
                      </div>

                      {/* Image Frame */}
                      <Link
                        to={`/product/${product.id}`}
                        className={`bg-[#0F172A] rounded-xl flex items-center justify-center p-4 border border-white/5 cursor-pointer block overflow-hidden ${
                          isGridView ? 'h-44 w-full mb-4' : 'h-20 w-20 flex-shrink-0'
                        }`}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </Link>

                      {/* Info Panel */}
                      <div className="text-left flex-1 flex flex-col justify-between w-full">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                            {product.category}
                          </span>
                          <h3 className="font-bold text-sm text-white hover:text-blue-400 transition-colors line-clamp-1 mt-0.5">
                            <Link to={`/product/${product.id}`}>{product.name}</Link>
                          </h3>

                          {/* Rating stars */}
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span className="font-bold text-slate-200">{product.rating}</span>
                            <span>({product.reviews})</span>
                          </div>

                          {/* Core Specs chips */}
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

                        {/* Price and Cart/Builder strips */}
                        <div className="pt-4 mt-5 border-t border-white/5 flex items-center justify-between w-full">
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
                            {/* Compare Checkbox */}
                            <label className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isCompared}
                                onChange={() => toggleCompare(product.id)}
                                className="rounded border-white/15 bg-transparent text-blue-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                              />
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Compare</span>
                            </label>

                            {/* Select / Add button */}
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

              {/* Numbered Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    disabled={page === 1}
                    onClick={() => updateFilter('page', page - 1)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white border border-white/5 disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateFilter('page', p)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        page === p
                          ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  
                  <button
                    disabled={page === totalPages}
                    onClick={() => updateFilter('page', page + 1)}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white border border-white/5 disabled:opacity-30 disabled:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
