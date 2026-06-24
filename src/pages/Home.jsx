import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PRODUCTS, COMMUNITY_BUILDS } from '../data/hardwareData';
import { ArrowRight, Cpu, Layers, Wrench, Shield, Zap, Sparkles, Star, ShoppingCart, Eye, Heart, Users } from 'lucide-react';

function WebGLHeroBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
        vec2 uv = v_texCoord;
        float color = 0.0;
        
        // Dynamic wave patterns
        color += sin(uv.x * 8.0 + u_time * 0.5) * 0.08;
        color += sin(uv.y * 12.0 - u_time * 0.4) * 0.08;
        
        vec3 background = vec3(0.059, 0.090, 0.165); // #0F172A
        vec3 accent = vec3(0.231, 0.510, 0.965);    // #3B82F6 (Electric Blue)
        vec3 purple = vec3(0.545, 0.361, 0.965);    // #8B5CF6 (Purple)
        
        float mask = smoothstep(0.35, 0.65, uv.y + color);
        vec3 finalColor = mix(background, mix(accent, purple, uv.x), mask * 0.25);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function compileShader(type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uResolution = gl.getUniformLocation(program, 'u_resolution');

    let animId;
    function render(time) {
      if (!canvas) return;
      
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, time * 0.001);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    }
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'mock_token_success') return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload).id;
  } catch (err) {
    return null;
  }
};

export default function Home() {
  const navigate = useNavigate();
  const { quickAdd } = useCart();
  const trendingCarouselRef = useRef(null);
  const [products, setProducts] = useState(PRODUCTS);
  const [showcaseBuilds, setShowcaseBuilds] = useState(COMMUNITY_BUILDS);

  const currentUserId = getUserIdFromToken();

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

    const fetchCommunityBuilds = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {};
        if (token && token !== 'mock_token_success') {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch('/api/products/community-builds', { headers });
        const data = await res.json();
        if (data.success && data.communityBuilds && data.communityBuilds.length > 0) {
          const mapped = data.communityBuilds.map(b => ({
            ...b,
            id: b.id || b._id
          }));
          setShowcaseBuilds(mapped.slice(0, 4));
        }
      } catch (err) {
        console.warn('Backend offline or error fetching community builds, using local fallback.');
      }
    };

    fetchProducts();
    fetchCommunityBuilds();
  }, []);

  const handleLike = async (id) => {
    const token = localStorage.getItem('token');
    const userId = getUserIdFromToken();

    if (token && token !== 'mock_token_success' && !String(id).startsWith('build-')) {
      try {
        const res = await fetch(`/api/community-builds/${id}/like`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setShowcaseBuilds(prev =>
            prev.map(post => {
              if (post.id === id) {
                const likedBy = Array.isArray(post.likedBy) ? [...post.likedBy] : [];
                if (data.liked) {
                  if (userId && !likedBy.includes(userId)) likedBy.push(userId);
                } else {
                  if (userId) {
                    const idx = likedBy.indexOf(userId);
                    if (idx > -1) likedBy.splice(idx, 1);
                  }
                }
                return { ...post, likes: data.likesCount, likedBy };
              }
              return post;
            })
          );
          return;
        }
      } catch (err) {
        console.error('Error toggling like:', err);
      }
    }

    setShowcaseBuilds(prev =>
      prev.map(post => {
        if (post.id === id) {
          const likedKey = `liked_${id}`;
          const isLiked = localStorage.getItem(likedKey);
          if (isLiked) {
            localStorage.removeItem(likedKey);
            return { ...post, likes: post.likes - 1 };
          } else {
            localStorage.setItem(likedKey, 'true');
            return { ...post, likes: post.likes + 1 };
          }
        }
        return post;
      })
    );
  };

  // Extract categoric counts
  const categoriesList = [
    { name: 'CPUs', label: 'Processors', icon: Cpu, count: '48 Parts', url: '/products?category=CPUs' },
    { name: 'GPUs', label: 'Graphics Cards', icon: Layers, count: '36 Parts', url: '/products?category=GPUs' },
    { name: 'Motherboards', label: 'Motherboards', icon: Wrench, count: '42 Parts', url: '/products?category=Motherboards' },
    { name: 'RAM', label: 'Memory', icon: Zap, count: '54 Parts', url: '/products?category=RAM' },
    { name: 'Storage', label: 'Storage', icon: Sparkles, count: '32 Parts', url: '/products?category=Storage' },
  ];

  // Filtering hardware
  const trendingHardware = products.filter(p => p.isTrending || p.isFeatured);

  const scrollCarousel = (direction) => {
    if (trendingCarouselRef.current) {
      const scrollAmt = 340;
      trendingCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmt : scrollAmt,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-24 pb-16 font-sans">
      {/* SECTION 1 - HERO */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0F172A] border-b border-white/5 py-12">
        {/* WebGL gradient rendering */}
        <WebGLHeroBackground />
        
        {/* Ambient neon radial gradients */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1440px] mx-auto px-6 md:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Copy */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-500/20 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence Driven Builder
            </div>
            
            <h1 className="font-sans font-black text-5xl sm:text-6xl tracking-tight leading-[1.08] text-white">
              Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Dream Gaming PC</span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-lg leading-relaxed">
              Find high-performance components, verify hardware compatibility, estimate FPS performance, and save your perfect custom setup.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/builder"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold tracking-wider text-xs uppercase px-8 py-4 rounded-xl shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] active:scale-95 transition-all flex items-center gap-2"
              >
                Start Building <Wrench className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="border border-[#334155] hover:bg-white/5 text-white font-bold tracking-wider text-xs uppercase px-8 py-4 rounded-xl transition-all active:scale-95"
              >
                Browse Components
              </Link>
            </div>
          </div>

          {/* Graphical Rig Render & Floating Cards */}
          <div className="relative hidden lg:block h-[500px]">
            {/* Case Illustration Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=800&auto=format&fit=crop"
                alt="Enthusiast Gaming PC Case Setup"
                className="w-[85%] h-[85%] object-cover rounded-3xl border border-white/10 floating shadow-2xl"
              />
            </div>

            {/* GPU Card floating */}
            <div className="absolute top-10 right-4 glass-panel p-4 rounded-2xl floating shadow-lg" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white font-sans">RTX 4090 OC</p>
                  <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider">In Stock</p>
                </div>
              </div>
            </div>

            {/* CPU Card floating */}
            <div className="absolute bottom-16 left-4 glass-panel p-4 rounded-2xl floating shadow-lg" style={{ animationDelay: '1.2s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white font-sans">Ryzen 7 7800X3D</p>
                  <p className="text-[10px] text-purple-400 font-bold">120W TDP</p>
                </div>
              </div>
            </div>

            {/* RAM floating badge */}
            <div className="absolute top-1/2 -left-6 glass-panel py-2 px-4 rounded-full floating shadow-md" style={{ animationDelay: '2s' }}>
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">64GB DDR5 7200</span>
            </div>

            {/* SSD floating badge */}
            <div className="absolute bottom-10 right-10 glass-panel py-2.5 px-4 rounded-xl floating shadow-md" style={{ animationDelay: '2.8s' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-mono font-bold text-slate-350">7450 MB/s NVMe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - FEATURED CATEGORIES */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="mb-10 text-left">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Premium Categories</h2>
          <p className="text-slate-400 mt-2 text-sm">Discover hardware designed for extreme rendering and high-refresh gaming.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categoriesList.map((cat, idx) => {
            const IconComp = cat.icon;
            return (
              <Link
                key={idx}
                to={cat.url}
                className="group glass-panel p-6 rounded-2xl flex flex-col items-center text-center hover:bg-blue-500/5 hover:border-blue-500/30 transition-all duration-300 shadow-md"
              >
                <div className="w-14 h-14 bg-[#0F172A] border border-white/5 text-blue-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <IconComp className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{cat.label}</span>
                <span className="text-xs text-slate-400 mt-1 font-mono">{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION 3 - TRENDING PRODUCTS */}
      <section className="bg-[#111827] py-16 border-y border-white/5 overflow-hidden relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8">
          <div className="flex justify-between items-end mb-10">
            <div className="text-left">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Trending Hardware</h2>
              <p className="text-slate-400 mt-2 text-sm">Most popular items in build templates right now.</p>
            </div>
            
            {/* Scroll Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="p-2 border border-[#334155] rounded-xl hover:bg-white/5 text-white transition-all cursor-pointer"
              >
                ←
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="p-2 border border-[#334155] rounded-xl hover:bg-white/5 text-white transition-all cursor-pointer"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={trendingCarouselRef}
            className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {trendingHardware.map((product) => (
              <div
                key={product.id}
                className="min-w-[290px] md:min-w-[320px] snap-start glass-panel rounded-2xl p-5 flex flex-col hover:border-blue-500/30 transition-all duration-300 relative group"
              >
                {/* Brand Badge */}
                <div className="absolute top-4 right-4 bg-[#0F172A] border border-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-blue-400 tracking-wider">
                  {product.badge || 'PREMIUM'}
                </div>

                {/* Image */}
                <Link
                  to={`/product/${product.id}`}
                  className="h-44 w-full bg-[#0F172A] rounded-xl p-4 flex items-center justify-center overflow-hidden mb-4 border border-white/5 cursor-pointer block"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </Link>

                {/* Copy */}
                <div className="text-left flex-1 flex flex-col">
                  <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {product.brand} | {Object.entries(product.specs || {}).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </p>
                  
                  <div className="flex items-center gap-1.5 mt-2">
                    <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-bold text-slate-200">{product.rating}</span>
                    <span className="text-[10px] text-slate-500">({product.reviews} reviews)</span>
                  </div>

                  {/* Pricing/Action */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-lg font-black text-white">₹{product.price.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => quickAdd(product)}
                      className="bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white p-2.5 rounded-xl transition-all cursor-pointer hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 - BUILD A PC CTA */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[32px] border border-white/5 p-8 md:p-14 relative overflow-hidden shadow-2xl">
          {/* Neon light behind banner */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Details */}
            <div className="text-left space-y-6">
              <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
                Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Art of PC Building</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Configure your gaming platform utilizing our intelligent builder. Add parts, calculate raw power drawing, verify dimensions, and estimate dynamic FPS metrics instantly.
              </p>
              
              <div className="space-y-3 pt-2 text-sm text-slate-350">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs">✓</span>
                  <span>Interactive Real-time Compatibility Validator</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs">✓</span>
                  <span>Automated Power Draw overhead warnings</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-xs">✓</span>
                  <span>Resolution FPS Estimator (1080p, 1440p, 4K)</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/builder"
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold tracking-wider text-xs uppercase px-8 py-4 rounded-xl shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer"
                >
                  Launch PC Builder
                </Link>
              </div>
            </div>

            {/* Visual build block mockup */}
            <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 text-left shadow-xl max-w-md mx-auto w-full font-sans">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-white text-base">Your Build Preview</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">Configuration slot #1</p>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">92% Complete</span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div className="flex items-center gap-3 p-3 bg-[#1E293B] border-l-4 border-blue-500 rounded-r-lg">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">Intel Core i9-14900K</p>
                    <p className="text-[10px] text-slate-400">Processor</p>
                  </div>
                  <span className="font-bold text-slate-350">₹58,900</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-[#1E293B] border-l-4 border-blue-500 rounded-r-lg">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="font-semibold text-white">ROG Strix RTX 4090 OC</p>
                    <p className="text-[10px] text-slate-400">Graphics Card</p>
                  </div>
                  <span className="font-bold text-slate-350">₹1,99,900</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/30 border-l-4 border-orange-500 rounded-r-lg text-orange-400">
                  <span className="text-xs font-bold text-orange-400 font-sans">!</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Power Supply Required</p>
                    <p className="text-[10px] text-slate-400">Estimated load draws ~642 Watts</p>
                  </div>
                  <Link to="/products?category=Power Supplies" className="underline font-bold text-[10px] hover:text-orange-300">Select</Link>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Estimated Price</p>
                  <p className="text-2xl font-black text-white">₹2,58,800</p>
                </div>
                <span className="text-[10px] font-mono text-green-400 flex items-center gap-1">
                  ✓ Core Components Compatible
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - WHY CHOOSE BUILDFORGE */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl text-left space-y-3">
          <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Compatibility Checker</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Our rules engine scans sockets, PCI slots, case length constraints, and memory types to prevent build failures.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl text-left space-y-3">
          <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">AI Recommendations</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unsure of which cooler fits your LGA 1700 processor? Ask our Forge Consultant chatbot for real-time matches.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl text-left space-y-3">
          <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">FPS Estimator</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Forecast gaming frame rates dynamically for 1080p, 1440p, and 4K settings on popular AAA titles before purchase.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl text-left space-y-3">
          <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white">Community Builds</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Examine and copy rigs created by other enthusiasts. Clone templates directly into the builder to customize.
          </p>
        </div>
      </section>

      {/* SECTION 6 - TOP BUILDS */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="flex justify-between items-end mb-10">
          <div className="text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Top Showcase Builds</h2>
            <p className="text-slate-400 mt-2 text-sm">Highly rated rigs styled by the community.</p>
          </div>
          <Link
            to="/community"
            className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
          >
            Explore Feed <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {showcaseBuilds.map((build) => (
            <div
              key={build.id}
              className="glass-panel rounded-3xl overflow-hidden flex flex-col lg:flex-row hover:border-blue-500/30 transition-all duration-300"
            >
              {/* Build Image */}
              <div className="lg:w-[45%] h-56 lg:h-auto relative bg-[#0F172A] overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
                <img
                  src={build.imageUrl}
                  alt={build.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <p className="text-xs text-slate-350">Designed by</p>
                  <p className="text-sm font-bold text-white">@{build.creator}</p>
                </div>
              </div>

              {/* Build Stats / Actions */}
              <div className="flex-1 p-6 flex flex-col justify-between text-left font-sans">
                <div>
                  <h3 className="text-xl font-bold text-white">{build.name}</h3>
                  <div className="flex items-center gap-4 mt-2 font-mono text-[11px] text-slate-400">
                    <span>Budget: <strong className="text-white">₹{build.budget.toLocaleString('en-IN')}</strong></span>
                    <span>Score: <strong className="text-blue-400">98%</strong></span>
                  </div>
                  
                  <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                    <p className="truncate">CPU: <strong className="text-slate-200">{build.specs.cpu}</strong></p>
                    <p className="truncate">GPU: <strong className="text-slate-200">{build.specs.gpu}</strong></p>
                    <p className="truncate">Case: <strong className="text-slate-200">{build.specs.case}</strong></p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(build.id)}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        (currentUserId
                          ? Array.isArray(build.likedBy) && build.likedBy.includes(currentUserId)
                          : localStorage.getItem(`liked_${build.id}`))
                          ? 'text-red-500 font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 transition-all ${
                        (currentUserId
                          ? Array.isArray(build.likedBy) && build.likedBy.includes(currentUserId)
                          : localStorage.getItem(`liked_${build.id}`))
                          ? 'text-red-500 fill-red-500'
                          : 'text-slate-400 fill-none'
                      }`} /> {build.likes}
                    </button>
                    <span className="text-slate-400">
                      💬 {build.comments}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/builder?clone=${build.id}`)}
                    className="bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white px-4 py-2 rounded-lg font-bold transition-all text-xs cursor-pointer shadow-sm"
                  >
                    Clone Rig
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
