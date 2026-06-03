import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Star, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

export default function Collections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeZone, setActiveZone] = useState('zen');
  const [expandedSpec, setExpandedSpec] = useState('materials');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync activeZone with URL params (e.g. /collections?aesthetic=zen)
  useEffect(() => {
    const aestheticParam = searchParams.get('aesthetic');
    if (aestheticParam && ['zen', 'minimalist', 'scandinavian', 'luxury'].includes(aestheticParam)) {
      setActiveZone(aestheticParam);
    }
  }, [searchParams]);

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
        console.error('Error fetching collections products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleZoneSwitch = (zone) => {
    setActiveZone(zone);
    setSearchParams({ aesthetic: zone });
    setExpandedSpec('materials'); // reset spec accordion
  };

  const collections = {
    zen: {
      title: 'Wabi-Sabi & Zen Sanctuary',
      subtitle: 'Organic coarse clays, natural ashwood, and silent quartz sands.',
      story: 'Rooted in transient asymmetry, natural materials, and quiet open space. Designed to foster high-key tranquility, organic comfort, and active mindfulness in the balcony or bedroom.',
      products: products.filter(p => p.aesthetic === 'Japanese Zen'),
      specs: [
        { id: 'materials', title: 'Unrefined Stoneware & Ashwood', text: 'Stoneware is molded manually in historic Kyoto workshops before firing. Solid Ashwood components highlight natural open grain.' },
        { id: 'philosophy', title: 'Wabi-Sabi Aesthetic', text: 'Embracing natural imperfections, rustic tactile finishes, and raw structural beauty representing the passage of time.' },
        { id: 'designers', title: 'Kyoto Handloom & Lumina Lab', text: 'Curated in collaboration with traditional craft studios in Japan and Florentine architectural labs.' }
      ]
    },
    minimalist: {
      title: 'Prism & Line Minimalism',
      subtitle: 'Crisp absolute whites, geometric cement, and pure smart light spectrums.',
      story: 'A disciplined purge of physical excess. Focusing entirely on essential geometric structures, zero-glare ambient glows, and clean cast concrete desks or study nodes.',
      products: products.filter(p => p.aesthetic === 'Minimalist'),
      specs: [
        { id: 'materials', title: 'Cement & Frosted Polycarbonate', text: 'Desk organizers utilize heavy micro-ground structural cement compounds. Lighting fixtures house frosted polycarbonate lenses.' },
        { id: 'philosophy', title: 'Form Follows Silence', text: 'Streamlining active task footprints to reduce mental friction and boost clean workspace focus.' },
        { id: 'designers', title: 'Studio Lumina Stockholm', text: 'Drawn in Stockholm following German functionalist guidelines for micro ergonomics and zero-noise footprints.' }
      ]
    },
    scandinavian: {
      title: 'Nordic Hygge & Oak Architecture',
      subtitle: 'Steam-bent solid ashwood, natural oak wood grains, and soft cognac leather saddles.',
      story: 'Warm, luminous daylight elements celebrating active family dinners, long productive desk hours, and peaceful reading sessions in deep comfortable chairs.',
      products: products.filter(p => p.aesthetic === 'Scandinavian'),
      specs: [
        { id: 'materials', title: 'Ashwood, Oak & Cognac Leather', text: 'Chairs use steam-bent solid ashwood and vegetable-tanned leather. Table tops use thick, solid European Oak wood.' },
        { id: 'philosophy', title: 'Nordic Humanist Hygge', text: 'Warm hospitality, structural durability, and ergonomic geometry crafted to last for generations.' },
        { id: 'designers', title: 'Aalto-Müller Team', text: 'Created in Copenhagen, Denmark by the award-winning Aalto-Müller architectural partnership.' }
      ]
    },
    luxury: {
      title: 'Polished Brass & Velvet Luxury',
      subtitle: 'Hand-welded brass branches, mouth-blown borosilicate spheres, and deep plush velvets.',
      story: 'Daring high-contrast statement pieces combining slender elegant brass profiles with deep velvet cushions and smart, responsive acoustics.',
      products: products.filter(p => p.aesthetic === 'Luxury Modern'),
      specs: [
        { id: 'materials', title: 'Brass, Velvet & Borosilicate Glass', text: 'Glass globes are hand-blown from premium borosilicate. Velvet fabric is woven tightly to resist spillages.' },
        { id: 'philosophy', title: 'Statement Sophistication', text: 'Expressive elegance, high-lux contrast, and supreme craft designed to serve as central architectural talking points.' },
        { id: 'designers', title: 'Studio Rossi Tuscan', text: 'Drawn by designer Beatrice Rossi and forged manually in custom ironworks and brass workshops in Tuscany, Italy.' }
      ]
    }
  };

  const activeCollection = collections[activeZone];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-12 font-sans">
      {/* 1. SECTOR CHOSEN BANNER */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">CURATED HOUSES</span>
        <h1 className="text-3xl font-extrabold text-[#0b1c30]">Aesthetic Collections Portfolio</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Switch between designer aesthetics to explore custom spatial portfolios, tactile material specifications, and architectural design stories.
        </p>

        {/* Quad switches tabs */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {['zen', 'minimalist', 'scandinavian', 'luxury'].map((zone) => (
            <button
              key={zone}
              onClick={() => handleZoneSwitch(zone)}
              className={`px-5 py-2 rounded text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                activeZone === zone
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:text-black border border-slate-200'
              }`}
            >
              {zone === 'zen' ? 'Japanese Zen' : zone === 'minimalist' ? 'Minimalist' : zone === 'scandinavian' ? 'Scandinavian' : 'Luxury Modern'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SPLIT STORY AND PHOTO PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Editorial breakdown (Lg: col-span-5) */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 md:p-8 rounded-xl border border-slate-200/50 shadow-xs">
          <div>
            <span className="text-[10px] text-black font-extrabold uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AESTHETIC PORTFOLIO
            </span>
            <h2 className="text-2xl font-extrabold text-[#0b1c30] mt-1">
              {activeCollection.title}
            </h2>
            <p className="text-xs text-slate-450 font-medium italic mt-1 leading-relaxed">
              "{activeCollection.subtitle}"
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            {activeCollection.story}
          </p>

          {/* Interactive Specifications Accordion */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-black font-bold mb-1">
              Design Specifications:
            </h3>

            {activeCollection.specs.map((spec) => {
              const isOpen = expandedSpec === spec.id;
              return (
                <div
                  key={spec.id}
                  className="border border-slate-105 rounded bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <button
                    onClick={() => setExpandedSpec(isOpen ? null : spec.id)}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-slate-800 flex justify-between items-center cursor-pointer"
                  >
                    <span>{spec.title}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 text-xs text-slate-500 leading-relaxed font-sans border-t border-slate-100/50 pt-2 animate-in fade-in duration-200">
                      {spec.text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Matching Product list bento-grid (Lg: col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs uppercase tracking-widest text-[#0b1c30] font-bold">
              Curated Design Artifacts
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {loading ? '...' : activeCollection.products.length} Items Listed
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-white border border-slate-100 rounded-lg animate-pulse flex flex-col justify-end p-4 space-y-3">
                  <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                  <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                  <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {activeCollection.products.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group cursor-pointer bg-white rounded-lg border border-slate-200/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 block"
                >
                  {/* Images */}
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                      <span className="bg-white/90 text-black text-[10px] font-bold tracking-wider uppercase px-4 py-2 rounded shadow-md">
                        Interactive Overview
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1 bg-white">
                    <div className="flex justify-between text-[11px] text-slate-450 font-bold uppercase tracking-wider">
                      <span>{p.category}</span>
                      <span className="flex items-center text-amber-500 gap-0.5"><Star className="w-3.5 h-3.5 fill-current" /> {p.rating}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 group-hover:underline">
                      {p.name}
                    </h4>
                    <p className="text-xs font-extrabold text-[#0b1c30] pt-1">
                      ₹{p.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
