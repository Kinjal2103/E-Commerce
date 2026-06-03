import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import { SearchX, RotateCcw } from 'lucide-react';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Dataset states from backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState('All');
  const [selectedAesthetic, setSelectedAesthetic] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState('featured');

  // Load products from backend Express API on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Error fetching products from backend:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Synchronize initial filters with URL parameters
  useEffect(() => {
    const catParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const roomParam = searchParams.get('room');
    const aestheticParam = searchParams.get('aesthetic');

    if (catParam) {
      setSelectedCategory(catParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    if (roomParam) {
      setSelectedRoom(roomParam);
    }
    if (aestheticParam) {
      setSelectedAesthetic(aestheticParam);
    }
  }, [searchParams]);

  // Static list of possible colors to filter by
  const AVAILABLE_COLORS = [
    { name: 'Black / Onyx', matches: ['black', 'onyx', 'charcoal', 'dark'] },
    { name: 'White / Cream', matches: ['white', 'cream', 'bone', 'optic', 'clear', 'soft white', 'pristine', 'alabaster'] },
    { name: 'Gray / Silver', matches: ['gray', 'grey', 'silver', 'slate', 'brushed', 'metal', 'steel', 'cement'] },
    { name: 'Blue / Green', matches: ['blue', 'navy', 'mist', 'green', 'spring'] },
    { name: 'Wood / Tan / Brass', matches: ['tan', 'sand', 'beige', 'brown', 'cognac', 'oak', 'oatmeal', 'ashwood', 'brass', 'walnut'] }
  ];

  // Static list of possible sizes
  const AVAILABLE_SIZES = ['Standard', 'Large', 'One Size', 'E26 Standard', 'Medium', '84-inch', '96-inch', '3 Meter', '5 Meter', '6-Seater', '8-Seater', '16x16"', '24x24"', '24-inch', '32-inch'];

  // Modern Categories list
  const CATEGORIES = ['All', 'Smart Home', 'Lighting', 'Office', 'Dining', 'Small Decor'];

  // Premium Room lists
  const ROOMS = ['All', 'Bedroom', 'Kitchen', 'Study Room', 'Balcony', 'Gaming Setup', 'Office Space', 'Living Room'];

  // Premium Aesthetic lists
  const AESTHETICS = ['All', 'Minimalist', 'Scandinavian', 'Japanese Zen', 'Luxury Modern', 'Industrial', 'Bohemian', 'Dark Academia', 'Cozy Bedroom'];

  // Clear all states
  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedRoom('All');
    setSelectedAesthetic('All');
    setSelectedColor('All');
    setSelectedSize('All');
    setMaxPrice(100000);
    setSortBy('featured');
    setSearchParams({}); // Clear query params
  };

  // Perform dynamic filtering and sorting combined inside useMemo
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Search Query
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.room?.toLowerCase().includes(query) ||
          p.aesthetic?.toLowerCase().includes(query)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Room Filter
    if (selectedRoom !== 'All') {
      result = result.filter(
        (p) => p.room?.toLowerCase() === selectedRoom.toLowerCase()
      );
    }

    // 4. Aesthetic Filter
    if (selectedAesthetic !== 'All') {
      result = result.filter(
        (p) => p.aesthetic?.toLowerCase() === selectedAesthetic.toLowerCase()
      );
    }

    // 5. Color Filter
    if (selectedColor !== 'All') {
      const colorQueryGroup = AVAILABLE_COLORS.find(c => c.name === selectedColor);
      if (colorQueryGroup) {
        result = result.filter((p) => {
          return p.colors?.some((c) =>
            colorQueryGroup.matches.some((m) => c.name.toLowerCase().includes(m))
          );
        });
      }
    }

    // 6. Size Filter
    if (selectedSize !== 'All') {
      result = result.filter((p) =>
        p.sizes?.some((s) => s.toLowerCase() === selectedSize.toLowerCase())
      );
    }

    // 7. Price Filter
    result = result.filter((p) => p.price <= maxPrice);

    // 8. Sorting Logic
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // 'featured' - preserve defined order or highlight isFeatured/isTrending
      result.sort((a, b) => {
        const scoreA = (a.isFeatured ? 2 : 0) + (a.isTrending ? 1 : 0);
        const scoreB = (b.isFeatured ? 2 : 0) + (b.isTrending ? 1 : 0);
        return scoreB - scoreA;
      });
    }

    return result;
  }, [products, searchTerm, selectedCategory, selectedRoom, selectedAesthetic, selectedColor, selectedSize, maxPrice, sortBy]);

  // Active filter count calculation
  const activeFiltersCount = [
    searchTerm !== '',
    selectedCategory !== 'All',
    selectedRoom !== 'All',
    selectedAesthetic !== 'All',
    selectedColor !== 'All',
    selectedSize !== 'All',
    maxPrice < 100000
  ].filter(Boolean).length;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 font-sans">
      {/* Editorial Header */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">LUMINA INTERIOR MATRIX</span>
          <h1 className="text-3xl font-extrabold text-[#0b1c30] mt-1">Shop Premium Interiors</h1>
          <p className="text-xs text-slate-500 mt-2">
            Refined collection of smart home appliances, high-contrast ambient lighting, designer office nodes, and minimal wabi-sabi decor.
          </p>
        </div>
        
        {/* Sort Trigger */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <label htmlFor="sort-select" className="text-xs text-slate-450 uppercase tracking-wider font-bold">SortBy:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 text-[#0b1c30] text-xs px-3 py-2 rounded focus:outline-none focus:border-black transition-colors font-semibold cursor-pointer"
          >
            <option value="featured">Featured Picks</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ========= SIDEBAR FILTERS PANEL ========= */}
        <Sidebar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          onClear={handleClearAllFilters}
          activeFiltersCount={activeFiltersCount}
          CATEGORIES={CATEGORIES}
          AVAILABLE_COLORS={AVAILABLE_COLORS}
          AVAILABLE_SIZES={AVAILABLE_SIZES}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
          ROOMS={ROOMS}
          selectedAesthetic={selectedAesthetic}
          setSelectedAesthetic={setSelectedAesthetic}
          AESTHETICS={AESTHETICS}
        />

        {/* ========= PRODUCT LISTING GRID ========= */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Chips row banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-lg border border-slate-200/50 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                Showing:
              </span>
              <span className="text-xs font-bold text-slate-800">
                {filteredProducts.length} of {products.length} aesthetic items found
              </span>
            </div>

            {/* active badges array list */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 font-sans">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory('All')} className="hover:text-black font-semibold ml-1">&times;</button>
                  </span>
                )}
                {selectedRoom !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 font-sans">
                    Room: {selectedRoom}
                    <button onClick={() => setSelectedRoom('All')} className="hover:text-black font-semibold ml-1">&times;</button>
                  </span>
                )}
                {selectedAesthetic !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 font-sans">
                    Aesthetic: {selectedAesthetic}
                    <button onClick={() => setSelectedAesthetic('All')} className="hover:text-black font-semibold ml-1">&times;</button>
                  </span>
                )}
                {selectedColor !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 font-sans">
                    Color: {selectedColor}
                    <button onClick={() => setSelectedColor('All')} className="hover:text-black font-semibold ml-1">&times;</button>
                  </span>
                )}
                {selectedSize !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 font-sans">
                    Size: {selectedSize}
                    <button onClick={() => setSelectedSize('All')} className="hover:text-black font-semibold ml-1">&times;</button>
                  </span>
                )}
                {maxPrice < 100000 && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200 font-sans">
                    &lt; ₹{maxPrice.toLocaleString('en-IN')}
                    <button onClick={() => setMaxPrice(100000)} className="hover:text-black font-semibold ml-1">&times;</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actual items list Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white border border-slate-100 rounded-lg animate-pulse flex flex-col justify-end p-4 space-y-3">
                  <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-[400px] bg-white border border-slate-200/50 rounded-lg flex flex-col items-center justify-center p-8 text-center">
              <SearchX className="text-slate-350 w-16 h-16 stroke-[1.2] mb-4" />
              <h3 className="text-base font-bold text-slate-800">No products match your parameters</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed font-sans">
                Adjust or clear filters to locate premium modern interior assets.
              </p>
              <button
                onClick={handleClearAllFilters}
                className="mt-6 bg-black text-white text-xs font-bold tracking-widest uppercase py-3 px-6 hover:bg-slate-800 rounded transition-colors cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {filteredProducts.map((p) => (
                <div key={p.id} className="h-full">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
