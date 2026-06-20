import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/hardwareData';
import { Trash2, ShoppingCart, Star, Plus } from 'lucide-react';

export default function Compare() {
  const { quickAdd } = useCart();
  const [compareIds, setCompareIds] = useState([]);
  const [products, setProducts] = useState(PRODUCTS);

  // Load compared IDs on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('compare_ids');
      if (stored) {
        setCompareIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch products from backend
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

  // Sync back to local storage on modification
  const handleRemoveCompare = (id) => {
    const updated = compareIds.filter(cid => cid !== id);
    setCompareIds(updated);
    localStorage.setItem('compare_ids', JSON.stringify(updated));
  };

  // Find selected products
  const comparedProducts = useMemo(() => {
    return compareIds.map(id => products.find(p => p.id === id)).filter(Boolean);
  }, [compareIds, products]);

  // Suggested products to add when table is empty
  const suggestions = useMemo(() => {
    return products.filter(p => !compareIds.includes(p.id)).slice(0, 4);
  }, [compareIds, products]);

  const handleAddSuggestion = (id) => {
    if (compareIds.length >= 4) {
      alert("You can compare up to 4 products at a time!");
      return;
    }
    const updated = [...compareIds, id];
    setCompareIds(updated);
    localStorage.setItem('compare_ids', JSON.stringify(updated));
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen">
      {/* Title */}
      <div className="mb-8 border-b border-white/5 pb-6 text-left">
        <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Specs Evaluation</span>
        <h1 className="text-3xl font-black text-white mt-1">Component Comparison</h1>
        <p className="text-slate-400 text-xs mt-2">Evaluate up to 4 hardware products side-by-side to choose the perfect match.</p>
      </div>

      {comparedProducts.length === 0 ? (
        <div className="glass-panel rounded-3xl py-20 px-6 text-center max-w-3xl mx-auto">
          <h3 className="text-lg font-bold text-white mb-2">No components selected for comparison</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
            Go to the Marketplace and check "Compare" on product cards, or add some from the recommended suggestions below.
          </p>

          <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold text-left mb-4">Recommended Additions:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.map(item => (
              <div key={item.id} className="bg-[#1E293B] border border-white/5 rounded-xl p-4 flex items-center justify-between text-left">
                <div>
                  <span className="text-[9px] text-blue-400 uppercase font-mono">{item.category}</span>
                  <p className="text-xs font-bold text-white mt-0.5 line-clamp-1">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">₹{item.price.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={() => handleAddSuggestion(item.id)}
                  className="bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white p-2 rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-white/5">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed min-w-[700px] border-collapse text-xs text-left">
              {/* Sticky Table Header */}
              <thead>
                <tr className="bg-[#1E293B] border-b border-white/10 text-white font-bold">
                  <th className="p-4 w-44 bg-[#111827] border-r border-white/5 font-mono uppercase tracking-widest text-[9px] text-slate-400">Specifications</th>
                  {comparedProducts.map((prod) => (
                    <th key={prod.id} className="p-4 align-top border-r border-white/5 relative group">
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveCompare(prod.id)}
                        className="absolute top-2 right-2 text-slate-500 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Info */}
                      <div className="flex flex-col gap-3 mt-4">
                        <div className="h-24 w-full bg-[#0F172A] rounded-xl p-3 flex items-center justify-center border border-white/5 overflow-hidden">
                          <img src={prod.imageUrl} alt={prod.name} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                          <span className="text-[9px] text-blue-400 font-mono uppercase">{prod.category}</span>
                          <h4 className="font-bold text-white text-xs leading-tight line-clamp-2 mt-0.5">{prod.name}</h4>
                          <span className="text-sm font-black text-white font-mono mt-2 block">₹{prod.price.toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          onClick={() => quickAdd(prod)}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-bold text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer transition-all hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                      </div>
                    </th>
                  ))}
                  {/* Fill empty cells to complete grid if < 4 */}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                    <th key={idx} className="p-4 border-r border-white/5 bg-[#1E293B]/10">
                      <div className="h-48 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-2xl p-4">
                        <span className="text-[10px] uppercase tracking-wider font-bold mb-2">Slot Empty</span>
                        <Link to="/products" className="text-[10px] text-blue-400 font-bold hover:underline">Add Component</Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 font-sans">
                {/* Rating Row */}
                <tr className="hover:bg-white/5">
                  <td className="p-4 font-bold text-slate-400 bg-[#111827] border-r border-white/5">User Rating</td>
                  {comparedProducts.map((prod) => (
                    <td key={prod.id} className="p-4 border-r border-white/5 font-mono">
                      <div className="flex items-center gap-1 text-yellow-500 font-bold">
                        ★ {prod.rating} <span className="text-slate-500 font-normal">({prod.reviews})</span>
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-white/5 bg-[#1E293B]/10"></td>
                  ))}
                </tr>

                {/* Power TDP Row */}
                <tr className="hover:bg-white/5">
                  <td className="p-4 font-bold text-slate-400 bg-[#111827] border-r border-white/5">Power Draw (TDP)</td>
                  {comparedProducts.map((prod) => (
                    <td key={prod.id} className="p-4 border-r border-white/5 font-mono">
                      {prod.specs?.['TDP'] || prod.specs?.['Wattage'] || 'N/A'}
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-white/5 bg-[#1E293B]/10"></td>
                  ))}
                </tr>

                {/* Sockets / Standard Connections */}
                <tr className="hover:bg-white/5">
                  <td className="p-4 font-bold text-slate-400 bg-[#111827] border-r border-white/5">Socket / Slot</td>
                  {comparedProducts.map((prod) => (
                    <td key={prod.id} className="p-4 border-r border-white/5 font-mono">
                      {prod.specs?.['Socket Type'] || prod.specs?.['Interface'] || prod.specs?.['Form Factor'] || 'N/A'}
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-white/5 bg-[#1E293B]/10"></td>
                  ))}
                </tr>

                {/* Core configuration details */}
                <tr className="hover:bg-white/5">
                  <td className="p-4 font-bold text-slate-400 bg-[#111827] border-r border-white/5">Speed / Capacity</td>
                  {comparedProducts.map((prod) => (
                    <td key={prod.id} className="p-4 border-r border-white/5 font-mono">
                      {prod.specs?.['Clock Speed'] || prod.specs?.['Boost Clock'] || prod.specs?.['Speed'] || prod.specs?.['Read Speed'] || 'N/A'}
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-white/5 bg-[#1E293B]/10"></td>
                  ))}
                </tr>

                {/* Memory Specs */}
                <tr className="hover:bg-white/5">
                  <td className="p-4 font-bold text-slate-400 bg-[#111827] border-r border-white/5">Memory Specs</td>
                  {comparedProducts.map((prod) => (
                    <td key={prod.id} className="p-4 border-r border-white/5 font-mono">
                      {prod.specs?.['VRAM'] || prod.specs?.['Capacity'] || prod.specs?.['RAM Slots'] || 'N/A'}
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-white/5 bg-[#1E293B]/10"></td>
                  ))}
                </tr>

                {/* Pros Row */}
                <tr className="hover:bg-white/5">
                  <td className="p-4 font-bold text-slate-400 bg-[#111827] border-r border-white/5">Key Advantages</td>
                  {comparedProducts.map((prod) => (
                    <td key={prod.id} className="p-4 border-r border-white/5 font-sans leading-relaxed text-slate-300">
                      <ul className="list-disc pl-4 space-y-1">
                        {prod.pros.slice(0, 2).map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-white/5 bg-[#1E293B]/10"></td>
                  ))}
                </tr>

                {/* Cons Row */}
                <tr className="hover:bg-white/5">
                  <td className="p-4 font-bold text-slate-400 bg-[#111827] border-r border-white/5">Disadvantages</td>
                  {comparedProducts.map((prod) => (
                    <td key={prod.id} className="p-4 border-r border-white/5 font-sans leading-relaxed text-slate-350">
                      <ul className="list-disc pl-4 space-y-1">
                        {prod.cons.slice(0, 2).map((c, i) => <li key={i}>{c}</li>)}
                      </ul>
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, idx) => (
                    <td key={idx} className="p-4 border-r border-white/5 bg-[#1E293B]/10"></td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
