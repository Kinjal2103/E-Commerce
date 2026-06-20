import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PRODUCTS, GAMES } from '../data/hardwareData';
import { Cpu, Layers, Wrench, Trash2, ShieldAlert, CheckCircle2, RefreshCw, BarChart2, Share2, FileDown, PlusCircle, Bookmark } from 'lucide-react';

export default function Builder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  // Selected Slots State
  const [build, setBuild] = useState({
    cpu: null,
    motherboard: null,
    gpu: null,
    ram: null,
    ssd: null,
    psu: null,
    case: null,
    cooler: null
  });

  // Share / Export Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [savedStatus, setSavedStatus] = useState('');

  // Active FPS Resolution
  const [activeResolution, setActiveResolution] = useState('1440p'); // '1080p' | '1440p' | '4K'

  // Load active configuration from local storage on mount
  useEffect(() => {
    try {
      // Check clone parameter from community builds
      const cloneId = searchParams.get('clone');
      if (cloneId) {
        const communityBuilds = [
          {
            id: 'build-obsidian',
            specs: { cpu: 'cpu-i9-14900k', gpu: 'gpu-rtx-4090', ram: 'ram-dominator-64', motherboard: 'mb-z790-carbon', ssd: 'ssd-990-pro', psu: 'psu-rm1000x', case: 'case-nv7', cooler: 'cooler-h150i' }
          },
          {
            id: 'build-stealth-amd',
            specs: { cpu: 'cpu-ryzen-7800x3d', gpu: 'gpu-rx-7900xtx', ram: 'ram-trident-z5-32', motherboard: 'mb-x670e-rog-strix', ssd: 'ssd-990-pro', psu: 'psu-focus-850', case: 'case-o11d-evo', cooler: 'cooler-nhd15' }
          }
        ];
        const target = communityBuilds.find(b => b.id === cloneId);
        if (target) {
          const loadedBuild = {};
          Object.entries(target.specs).forEach(([slot, prodId]) => {
            loadedBuild[slot] = PRODUCTS.find(p => p.id === prodId) || null;
          });
          setBuild(loadedBuild);
          localStorage.setItem('forge_current_build', JSON.stringify(loadedBuild));
          // Clear query param
          navigate('/builder', { replace: true });
          return;
        }
      }

      const stored = localStorage.getItem('forge_current_build');
      if (stored) {
        setBuild(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, [searchParams, navigate]);

  // Remove item from a configuration slot
  const handleRemoveSlot = (slotKey) => {
    const updated = { ...build, [slotKey]: null };
    setBuild(updated);
    localStorage.setItem('forge_current_build', JSON.stringify(updated));
  };

  // Navigating to filter products for slot selection
  const handleSelectSlot = (categoryName) => {
    navigate(`/products?selectForBuilder=${encodeURIComponent(categoryName)}`);
  };

  // Financial calculations
  const totalPrice = useMemo(() => {
    return Object.values(build).reduce((acc, item) => acc + (item ? item.price : 0), 0);
  }, [build]);

  // Dynamic compatibility engine checking
  const compatibilityEngine = useMemo(() => {
    const alerts = [];
    let score = 100;

    // Slots completeness count
    const selectedCount = Object.values(build).filter(Boolean).length;
    if (selectedCount === 0) {
      return { alerts: [{ type: 'info', text: 'Select components to run the compatibility engine.' }], score: 100, tdp: 0, psuWatt: 0 };
    }

    // Calculated TDP draws
    let calculatedTDP = 80; // Baseline motherboard & SSD power draw
    if (build.cpu) {
      const cpuTdp = parseInt(build.cpu.specs?.['TDP']) || 120;
      calculatedTDP += cpuTdp;
    }
    if (build.gpu) {
      const gpuTdp = parseInt(build.gpu.specs?.['TDP']) || 250;
      calculatedTDP += gpuTdp;
    }
    if (build.cooler && build.cooler.specs?.['Radiator Size']) {
      calculatedTDP += 25; // AIO Liquid cooler pumps draw extra power
    }

    // PSU check
    let psuWatt = 0;
    if (build.psu) {
      psuWatt = parseInt(build.psu.specs?.['Wattage']) || 850;
      if (psuWatt < calculatedTDP) {
        score -= 30;
        alerts.push({
          type: 'error',
          text: `Insufficient Wattage: Selected PSU is ${psuWatt}W but estimated load requires at least ${calculatedTDP}W.`
        });
      } else if (psuWatt < calculatedTDP + 150) {
        score -= 10;
        alerts.push({
          type: 'warning',
          text: `Low PSU Overhead: PSU provides ${psuWatt}W. We recommend 150W-200W safety overhead for boost transients.`
        });
      } else {
        alerts.push({
          type: 'success',
          text: `PSU Wattage sufficient: ${psuWatt}W provides a safe ${Math.round(((psuWatt - calculatedTDP) / psuWatt) * 100)}% overhead.`
        });
      }
    }

    // CPU and Motherboard socket checks
    if (build.cpu && build.motherboard) {
      const cpuSocket = build.cpu.specs?.['Socket Type'];
      const mbSocket = build.motherboard.specs?.['Socket Type'];
      if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
        score -= 40;
        alerts.push({
          type: 'error',
          text: `Socket Conflict: CPU requires socket ${cpuSocket} but motherboard has socket ${mbSocket}.`
        });
      } else {
        alerts.push({
          type: 'success',
          text: `Compatible Sockets: CPU and Motherboard both support socket ${cpuSocket || mbSocket}.`
        });
      }
    }

    // RAM slots compatibility checking (DDR5 vs DDR4)
    if (build.ram && build.motherboard) {
      const ramType = build.ram.specs?.['Type'];
      const mbRamSlots = build.motherboard.specs?.['RAM Slots'];
      if (ramType && mbRamSlots && !mbRamSlots.includes(ramType)) {
        score -= 30;
        alerts.push({
          type: 'error',
          text: `RAM Mismatch: RAM modules are ${ramType} but Motherboard supports ${mbRamSlots}.`
        });
      } else {
        alerts.push({
          type: 'success',
          text: `Compatible memory slots: RAM standard matches Motherboard slots.`
        });
      }
    }

    // Cabinet Case GPU length clearance check
    if (build.gpu && build.case) {
      const gpuLen = parseInt(build.gpu.specs?.['Length']) || 300;
      const caseLen = parseInt(build.case.specs?.['Max GPU Length']) || 400;
      if (gpuLen > caseLen) {
        score -= 20;
        alerts.push({
          type: 'error',
          text: `Cabinet Space Conflict: Case fits up to ${caseLen}mm GPUs but selected GPU length is ${gpuLen}mm.`
        });
      } else {
        alerts.push({
          type: 'success',
          text: `GPU Clearance verified: GPU fits comfortably inside the selected case.`
        });
      }
    }

    // If no warnings, add general success logs
    if (alerts.filter(a => a.type === 'error').length === 0 && score === 100) {
      alerts.unshift({ type: 'success', text: 'All checked components are compatible!' });
    }

    return {
      alerts,
      score: Math.max(10, score),
      tdp: calculatedTDP,
      psuWatt
    };
  }, [build]);

  // FPS Estimator calculations
  const fpsEstimations = useMemo(() => {
    const estimations = [];
    
    // CPU Coeff
    let cpuCoeff = 0.2;
    if (build.cpu) {
      if (build.cpu.id.includes('14900k')) cpuCoeff = 1.0;
      else if (build.cpu.id.includes('7800x3d')) cpuCoeff = 1.05;
      else cpuCoeff = 0.9;
    }
    
    // GPU Coeff
    let gpuCoeff = 0.15;
    if (build.gpu) {
      if (build.gpu.id.includes('4090')) gpuCoeff = 1.0;
      else if (build.gpu.id.includes('7900xtx')) gpuCoeff = 0.85;
      else gpuCoeff = 0.72;
    }

    const resolutionFactors = { '1080p': 1.15, '1440p': 0.82, '4K': 0.44 };
    const resFactor = resolutionFactors[activeResolution];

    GAMES.forEach((game) => {
      const baseFps = game.resolutionFPS['1440p']; // standard baseline
      // Calculate dynamic FPS based on hardware choice
      const estimatedFps = Math.round(baseFps * cpuCoeff * gpuCoeff * (resFactor / 0.82));
      estimations.push({
        name: game.name,
        fps: estimatedFps
      });
    });

    return estimations;
  }, [build, activeResolution]);

  // Save current build to profile saved list
  const handleSaveBuild = () => {
    if (Object.values(build).filter(Boolean).length === 0) {
      setSavedStatus('Error: Select at least one component first.');
      return;
    }

    try {
      const stored = localStorage.getItem('forge_saved_builds');
      const savedBuilds = stored ? JSON.parse(stored) : [];

      const newBuildRecord = {
        id: 'user_build_' + Date.now(),
        name: `Custom Build #${savedBuilds.length + 1}`,
        budget: totalPrice,
        performanceScore: compatibilityEngine.score >= 90 ? 'Extreme' : 'Mid-Tier',
        compatibilityScore: compatibilityEngine.score,
        specs: {
          cpu: build.cpu?.name || 'None',
          gpu: build.gpu?.name || 'None',
          case: build.case?.name || 'None'
        },
        rawBuild: build
      };

      savedBuilds.push(newBuildRecord);
      localStorage.setItem('forge_saved_builds', JSON.stringify(savedBuilds));

      setSavedStatus('✓ Configuration saved to your Profile Saved Builds!');
      setTimeout(() => setSavedStatus(''), 4000);
    } catch (e) {
      console.error(e);
      setSavedStatus('Error saving build.');
    }
  };

  const handleShareBuild = () => {
    const buildId = 'BF-' + Math.floor(Math.random() * 900000 + 100000);
    setShareLink(`https://buildforge.com/builder?share=${buildId}`);
    setShowShareModal(true);
  };

  const handleCheckoutBuild = () => {
    // Add all selected components to cart
    Object.values(build).forEach(item => {
      if (item) {
        addToCart(item, 1, 'Default', 'Standard');
      }
    });
    navigate('/cart');
  };

  // PC Builder configuration rows
  const builderSlots = [
    { key: 'cpu', label: 'Processor (CPU)', category: 'CPUs', icon: Cpu },
    { key: 'motherboard', label: 'Motherboard', category: 'Motherboards', icon: Wrench },
    { key: 'gpu', label: 'Graphics Card (GPU)', category: 'GPUs', icon: Layers },
    { key: 'ram', label: 'Memory (RAM)', category: 'RAM', icon: RefreshCw },
    { key: 'ssd', label: 'Storage (SSD)', category: 'Storage', icon: BarChart2 },
    { key: 'psu', label: 'Power Supply (PSU)', category: 'Power Supplies', icon: Cpu },
    { key: 'cooler', label: 'Cooling', category: 'Cooling', icon: RefreshCw },
    { key: 'case', label: 'Cabinet Case', category: 'Cases', icon: Wrench },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen">
      {/* Title */}
      <div className="mb-8 border-b border-white/5 pb-6 text-left flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Configure Machine</span>
          <h1 className="text-3xl font-black text-white mt-1">Rig Customizer</h1>
          <p className="text-slate-400 text-xs mt-2">Pick components and watch real-time compatibility scores adjust.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSaveBuild}
            className="bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Bookmark className="w-4 h-4 text-blue-400" />
            Save Configuration
          </button>
          <button
            onClick={handleShareBuild}
            className="bg-transparent border border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            Share Build
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="bg-[#1E293B] hover:bg-white/5 text-slate-300 font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 border border-white/5"
          >
            <FileDown className="w-4 h-4 text-blue-400" />
            Export Spec
          </button>
        </div>
      </div>

      {savedStatus && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-semibold text-left">
          {savedStatus}
        </div>
      )}

      {/* Main columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left builder slots list */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {/* Compatibility Engine Summary bar */}
          <div className={`glass-panel rounded-2xl p-4 flex items-center gap-6 border-l-4 ${
            compatibilityEngine.alerts.some(a => a.type === 'error') ? 'border-red-500' : 'border-blue-500'
          } text-left`}>
            <div className="flex -space-x-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                compatibilityEngine.alerts.some(a => a.type === 'error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
              }`}>
                {compatibilityEngine.alerts.some(a => a.type === 'error') ? '!' : '✓'}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-bold font-sans">Compatibility Status</p>
              <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                {compatibilityEngine.alerts[0]?.text || 'No conflicts detected.'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-white font-black text-xl font-mono">{compatibilityEngine.score}%</div>
              <div className="text-[9px] text-slate-500 uppercase font-black">Verify Score</div>
            </div>
          </div>

          {/* Slots grid */}
          <div className="space-y-4">
            {builderSlots.map((slot) => {
              const selectedItem = build[slot.key];
              const Icon = slot.icon;

              return (
                <div
                  key={slot.key}
                  className={`glass-panel rounded-2xl p-4 flex items-center gap-6 transition-all border ${
                    selectedItem 
                      ? 'bg-[#1E293B] border-white/5 hover:border-blue-500/30' 
                      : 'bg-[#1E293B]/20 border-dashed border-white/10 hover:border-blue-500/20'
                  } text-left relative`}
                >
                  {/* Slot Icon representation */}
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    selectedItem ? 'bg-[#0F172A]' : 'bg-[#1E293B]/40 text-slate-650'
                  }`}>
                    {selectedItem ? (
                      <img src={selectedItem.imageUrl} alt={selectedItem.name} className="max-h-[85%] max-w-[85%] object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <Icon className="w-6 h-6 text-slate-500" />
                    )}
                  </div>

                  {/* Slot meta details */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                      {slot.label}
                    </span>
                    {selectedItem ? (
                      <div className="mt-1">
                        <h4 className="font-bold text-white text-sm truncate">{selectedItem.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {selectedItem.brand} | {selectedItem.specs?.['TDP'] ? `Power Draw: ${selectedItem.specs['TDP']}` : 'Standard Wattage'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">Configure slot with compatible hardware...</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-3">
                    {selectedItem ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-blue-400 font-mono mr-2">
                          ${selectedItem.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleSelectSlot(slot.category)}
                          className="p-2 bg-[#0F172A] border border-white/5 rounded-lg text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all cursor-pointer"
                          title="Change component"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveSlot(slot.key)}
                          className="p-2 bg-[#0F172A] border border-white/5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Clear slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectSlot(slot.category)}
                        className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Configure
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Rail Details */}
        <aside className="lg:col-span-4 flex flex-col gap-6 text-left">
          {/* Summary Card */}
          <div className="glass-panel rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-lg text-white border-b border-white/5 pb-3">Build Overview</h3>

            {/* Total Pricing */}
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total MSRP</span>
              <div className="text-right">
                <span className="text-3xl font-black text-blue-400 font-mono">${totalPrice.toFixed(2)}</span>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">MSRP tax excluded</p>
              </div>
            </div>

            {/* TDP Watt draw */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-400 uppercase text-[10px] tracking-wider">Estimated Power</span>
                <span className="text-white font-mono">
                  {compatibilityEngine.tdp}W {compatibilityEngine.psuWatt > 0 && `/ ${compatibilityEngine.psuWatt}W`}
                </span>
              </div>
              <div className="h-2 w-full bg-[#0F172A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (compatibilityEngine.tdp / (compatibilityEngine.psuWatt || 1000)) * 100)}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Action Checkout */}
            <div className="space-y-3.5 pt-2">
              <button
                onClick={handleCheckoutBuild}
                disabled={totalPrice === 0}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add Build to Cart
              </button>
            </div>
          </div>

          {/* FPS Estimator */}
          <div className="glass-panel rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-base text-white">FPS Estimator</h3>
              
              {/* Resolutions */}
              <div className="flex bg-[#0F172A] border border-white/10 rounded-lg p-0.5 text-[9px] font-bold">
                {['1080p', '1440p', '4K'].map((res) => (
                  <button
                    key={res}
                    onClick={() => setActiveResolution(res)}
                    className={`px-2 py-1 rounded cursor-pointer transition-all ${
                      activeResolution === res ? 'bg-blue-500 text-white' : 'text-slate-400'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-450">
              {fpsEstimations.map((game, i) => (
                <div key={i} className="flex justify-between items-center bg-[#0F172A]/50 border border-white/5 p-3 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-200">{game.name}</span>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Ultra Settings</p>
                  </div>
                  <span className="text-blue-400 font-bold font-mono">{game.fps} FPS</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compatibility Engine Log Panel */}
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white border-b border-white/5 pb-3">Compatibility Logs</h3>
            <div className="space-y-3.5 text-left max-h-48 overflow-y-auto pr-2 no-scrollbar">
              {compatibilityEngine.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-[11px] font-medium leading-relaxed flex gap-2 items-start ${
                    alert.type === 'error'
                      ? 'bg-red-500/5 border-red-500/20 text-red-400'
                      : alert.type === 'warning'
                      ? 'bg-orange-500/5 border-orange-500/20 text-orange-400'
                      : alert.type === 'success'
                      ? 'bg-green-500/5 border-green-500/20 text-green-400'
                      : 'bg-blue-500/5 border-blue-500/20 text-blue-400'
                  }`}
                >
                  <span className="font-black font-sans">{alert.type === 'success' ? '✓' : alert.type === 'error' ? '✗' : '!'}</span>
                  <span>{alert.text}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-[#1E293B] border border-white/10 max-w-sm w-full rounded-2xl p-6 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Share Configuration</h3>
            <p className="text-xs text-slate-400 mb-4">Copy this link to share your hardware design with others.</p>
            <input
              type="text"
              readOnly
              value={shareLink}
              className="bg-[#0F172A] border border-white/10 rounded-lg p-2.5 text-center text-xs text-blue-400 w-full focus:outline-none mb-4 font-mono"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                alert("Link copied!");
                setShowShareModal(false);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* Export Modal Dialog */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExportModal(true)} />
          <div className="relative bg-[#1E293B] border border-white/10 max-w-md w-full rounded-2xl p-6 text-left shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 border-b border-white/5 pb-2">Specification Sheet Export</h3>
            <div className="bg-[#0F172A] p-4 rounded-xl border border-white/5 font-mono text-[10px] text-slate-350 max-h-60 overflow-y-auto space-y-1 my-4 scrollbar-thin">
              <p className="font-bold text-white">=== BUILDFORGE PC CONFIGURATION ===</p>
              <p>MSRP Estimate: ${totalPrice.toFixed(2)}</p>
              <p>Power Draw: {compatibilityEngine.tdp}W</p>
              <p>----------------------------------</p>
              {Object.entries(build).map(([key, item]) => (
                <p key={key}>{key.toUpperCase()}: {item ? `${item.name} ($${item.price})` : 'Not Selected'}</p>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  alert("Configuration PDF successfully generated!");
                  setShowExportModal(false);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase py-2.5 rounded-lg cursor-pointer text-center"
              >
                Download PDF
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 border border-white/10 hover:bg-white/5 text-white font-bold text-xs uppercase rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
