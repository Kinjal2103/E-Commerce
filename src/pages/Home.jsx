import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function Home() {
  const carouselRef = useRef(null);

  // Dynamic products states loaded from backend API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Error fetching homepage products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeProducts();
  }, []);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmt = 340;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmt : scrollAmt,
        behavior: 'smooth'
      });
    }
  };

  const trendingProducts = products.filter(
    (p) => p.isTrending || p.badge === 'SMART' || p.badge === 'BESTSELLER'
  );
  
  // Featured smart lighting and appliances
  const featuredTech = products.filter(
    (p) => p.category === 'Smart Home' || p.category === 'Lighting'
  ).slice(0, 3);

  return (
    <div className="space-y-16 pb-12 font-sans">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative h-[80vh] bg-slate-900 text-white flex items-center overflow-hidden rounded-2xl mx-4 md:mx-0 shadow-lg">
        {/* Absolute Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop"
            alt="Lumina Smart Home Collection background"
            className="w-full h-full object-cover opacity-45 mix-blend-overlay scale-105 duration-700 hover:scale-100 transition-transform"
          />
        </div>

        {/* Hero Copy overlay */}
        <div className="relative z-10 max-w-[1280px] mx-auto w-full px-8 md:px-12 flex flex-col items-start gap-4">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-slate-350 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            LUMINA SMART INTERIOR MATRIX
          </span>
          
          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white max-w-2xl leading-tight">
            Quiet smart luxury, modern interior lines.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed mt-2">
            A harmonious integration of automated lights, organic ceramic materials, and minimalist shapes. Craft a workspace or sanctuary aligned with tranquility.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <Link
              to="/products"
              className="bg-white hover:bg-slate-100 text-[#0b1c30] font-bold tracking-widest text-xs uppercase px-8 py-3.5 rounded shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer text-center"
            >
              Explore Shop
            </Link>
            <Link
              to="/collections"
              className="border border-white/60 hover:bg-white/10 text-white font-bold tracking-widest text-xs uppercase px-8 py-3.5 rounded transition-transform hover:-translate-y-0.5 cursor-pointer text-center"
            >
              Curated Portfolios
            </Link>
          </div>
        </div>

        {/* Bottom subtle layout marker */}
        <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center text-[10px] tracking-widest text-white/50 uppercase z-10">
          <span>CURATED SERIES 05 / EDITION 02</span>
          <span>SMART INTERIOR ARCHITECTURE</span>
        </div>
      </section>

      {/* 2. CHOOSE BY DYNAMIC ROOM TYPE */}
      <section className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Room-Based Shopping</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] mt-1">Shop By Curated Rooms</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b border-slate-800/60 pb-0.5 hover:opacity-80 transition-all flex items-center gap-1 cursor-pointer"
          >
            See all room setups <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3 Interactive Grid blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GAMING SETUP CARD */}
          <Link
            to="/products?room=Gaming Setup"
            className="group relative h-[380px] bg-slate-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer block"
          >
            <img
              src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop"
              alt="Premium Gaming Setup"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold mb-1">Gaming Setup</span>
              <h3 className="text-lg font-bold">Monolithic Gaming Room</h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 max-w-xs opacity-90">
                Responsive smart acoustics, full-spectrum LED bars, and matte-black desktop grids.
              </p>
            </div>
          </Link>

          {/* STUDY ROOM CARD */}
          <Link
            to="/products?room=Study Room"
            className="group relative h-[380px] bg-slate-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer block"
          >
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
              alt="Study & Office Room"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold mb-1">Study Room</span>
              <h3 className="text-lg font-bold">Focal Workspace Setup</h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 max-w-xs opacity-90">
                Oak electric standing desks, air purifiers, high-CRI bulbs, and historical gothic wood shelves.
              </p>
            </div>
          </Link>

          {/* BALCONY & BEDROOM CARD */}
          <Link
            to="/products?room=Balcony"
            className="group relative h-[380px] bg-slate-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer block"
          >
            <img
              src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?q=80&w=600&auto=format&fit=crop"
              alt="Balcony & Living Room"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold mb-1">Balcony &amp; Zen</span>
              <h3 className="text-lg font-bold">Wabi-Sabi Sanctuary</h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2 max-w-xs opacity-90">
                Preserved moss art pieces, sand rake sandscapes, aroma mist diffusers, and coarse clay vases.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. TRENDING SLIDER CAROUSEL */}
      <section className="bg-slate-50 border-y border-slate-200/50 py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Trending Now</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] mt-1">Sought-after Pieces</h2>
            </div>

            {/* Carousel navigation triggers */}
            <div className="flex gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="w-10 h-10 border border-slate-200 hover:bg-white text-[#0b1c30] flex items-center justify-center rounded-full transition-all cursor-pointer shadow-xs bg-white/50"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="w-10 h-10 border border-slate-200 hover:bg-white text-[#0b1c30] flex items-center justify-center rounded-full transition-all cursor-pointer shadow-xs bg-white/50"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>

          {/* Actual swiper row */}
          {loading ? (
            <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[280px] sm:w-[310px] aspect-[3/4] flex-shrink-0 bg-white border border-slate-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar"
            >
              {trendingProducts.map((product) => (
                <div key={product.id} className="w-[280px] sm:w-[310px] flex-shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. THE SMART HOME ACCENTS EXHIBITION */}
      <section className="max-w-[1280px] mx-auto px-6">
        <div className="bg-white rounded-xl border border-slate-200/50 p-6 md:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-[#0b1c30] font-bold py-1 px-3 bg-[#FAF9F5] border border-slate-200/40 rounded-full">
              Automated Ambient Curation
            </span>
            
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl tracking-tight text-[#0b1c30] leading-tight">
              Design Aesthetics: The Modern Smart Home
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed">
              Explore dynamic forms where automation serves tranquility. Featuring smart PM2.5 monitoring air purifiers, 360 acoustic smart speakers, and high-CRI ambient lights scheduled to match your wakeful circadian rhythms.
            </p>

            <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 text-[#0b1c30]">
              <div>
                <span className="block font-bold text-lg">6</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rooms Covered</span>
              </div>
              <div>
                <span className="block font-bold text-lg">9</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aesthetic Themes</span>
              </div>
              <div>
                <span className="block font-bold text-lg">100%</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Connected Guarantee</span>
              </div>
            </div>

            <Link
              to="/products?category=Smart Home"
              className="bg-black hover:bg-slate-800 text-white text-xs font-bold tracking-widest uppercase py-3.5 px-8 rounded shadow-sm transition-all cursor-pointer inline-block text-center"
            >
              Browse Smart Home Tech
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-[210px] bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <img
                  src={featuredTech[0]?.imageUrl}
                  alt="Feature 1"
                  className="w-full h-full object-cover float-none"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="h-[140px] bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <img
                  src={featuredTech[1]?.imageUrl}
                  alt="Feature 2"
                  className="w-full h-full object-cover float-none"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="pt-8 space-y-4">
              <div className="h-[140px] bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop"
                  alt="Curated details"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[210px] bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <img
                  src={featuredTech[2]?.imageUrl}
                  alt="Feature 3"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. THE LUMINA JOURNAL: EDITORIALS */}
      <section className="max-w-[1280px] mx-auto px-6 border-t border-slate-200/50 pt-16">
        <div className="text-center max-w-lg mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Lumina Journal</span>
          <h2 className="text-2xl font-extrabold text-[#0b1c30] mt-1">Aesthetic Editorial Stories</h2>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            Delving deeper into smart home connectivity setups, minimalist wabi-sabi room styling, and natural sustainable interior design philosophy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* ARTICLE 1 */}
          <article className="space-y-4 group">
            <div className="aspect-[16/10] bg-slate-200 overflow-hidden rounded-lg cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600&auto=format&fit=crop"
                alt="Story 1"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest block font-mono">
              JOURNAL • ISSUE 05
            </span>
            <h3 className="font-bold text-base text-slate-800 group-hover:text-black cursor-pointer group-hover:underline decoration-1 underline-offset-4">
              Circadian Lighting: Tuning Ambient Light to Wakeful Patterns
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              How scheduling RGB smart bulbs and ambient LED paths to transition from cool white to deep warm glows can optimize hormone releases and rest quality.
            </p>
          </article>

          {/* ARTICLE 2 */}
          <article className="space-y-4 group">
            <div className="aspect-[16/10] bg-slate-200 overflow-hidden rounded-lg cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=600&auto=format&fit=crop"
                alt="Story 2"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest block font-mono">
              INTERIORS • Curated
            </span>
            <h3 className="font-bold text-base text-slate-800 group-hover:text-black cursor-pointer group-hover:underline decoration-1 underline-offset-4">
              The Architecture of the Modern Silent Desk Space
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              Combining solid oak steam-bent standing desks, cement desk trays, and PM2.5 clean air purification filters to support quiet concentration blocks.
            </p>
          </article>

          {/* ARTICLE 3 */}
          <article className="space-y-4 group">
            <div className="aspect-[16/10] bg-slate-200 overflow-hidden rounded-lg cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop"
                alt="Story 3"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest block font-mono">
              MEDITATION • BALCONY
            </span>
            <h3 className="font-bold text-base text-slate-800 group-hover:text-black cursor-pointer group-hover:underline decoration-1 underline-offset-4">
              Designing Wabi-Sabi Sanctuaries with Preserved Moss & Sandscapes
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
              Delving into natural sandstone ceramics, aroma vapor diffusion, and zero-maintenance preserved forest moss artwork to construct spaces of active meditation.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
