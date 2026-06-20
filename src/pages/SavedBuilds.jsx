import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit3, Copy, Share2, Wrench, ShieldCheck, Heart } from 'lucide-react';

export default function SavedBuilds() {
  const navigate = useNavigate();
  const [builds, setBuilds] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  // Default pre-seeded builds if none exist in localStorage
  const preseededBuilds = [
    {
      id: 'preseed-1',
      name: 'Project Obsidian (Default)',
      budget: 3840.00,
      performanceScore: 'Extreme',
      compatibilityScore: 98,
      specs: {
        cpu: 'Intel Core i9-14900K',
        gpu: 'ROG Strix GeForce RTX 4090 OC',
        case: 'Phanteks NV7 Premium Glass'
      },
      rawBuild: {
        cpu: { id: 'cpu-i9-14900k', name: 'Intel Core i9-14900K', price: 589 },
        gpu: { id: 'gpu-rtx-4090', name: 'ROG Strix GeForce RTX 4090 OC', price: 1999 },
        motherboard: { id: 'mb-z790-carbon', name: 'MPG Z790 Carbon WiFi', price: 429 },
        ram: { id: 'ram-dominator-64', name: 'Dominator Titanium 64GB DDR5', price: 294 },
        ssd: { id: 'ssd-990-pro', name: 'Samsung 990 Pro M.2 NVMe 2TB', price: 169 },
        psu: { id: 'psu-rm1000x', name: 'Corsair RM1000x Shift ATX 3.0', price: 209 },
        case: { id: 'case-nv7', name: 'Phanteks NV7 Premium Glass', price: 219 },
        cooler: { id: 'cooler-h150i', name: 'Corsair iCUE H150i Elite LCD XT', price: 259 }
      }
    },
    {
      id: 'preseed-2',
      name: 'AMD Value Stealth',
      budget: 2320.00,
      performanceScore: 'Extreme',
      compatibilityScore: 100,
      specs: {
        cpu: 'AMD Ryzen 7 7800X3D',
        gpu: 'Radeon RX 7900 XTX Gaming',
        case: 'Lian Li O11 Dynamic EVO'
      },
      rawBuild: {
        cpu: { id: 'cpu-ryzen-7800x3d', name: 'AMD Ryzen 7 7800X3D', price: 369 },
        gpu: { id: 'gpu-rx-7900xtx', name: 'Radeon RX 7900 XTX Gaming', price: 949 },
        motherboard: { id: 'mb-x670e-rog-strix', name: 'ROG Strix X670E-E Gaming WiFi', price: 489 },
        ram: { id: 'ram-trident-z5-32', name: 'Trident Z5 RGB 32GB DDR5', price: 185 },
        ssd: { id: 'ssd-990-pro', name: 'Samsung 990 Pro M.2 NVMe 2TB', price: 169 },
        psu: { id: 'psu-focus-850', name: 'Seasonic Focus GX-850 Gold', price: 139 },
        case: { id: 'case-o11d-evo', name: 'Lian Li O11 Dynamic EVO', price: 169 },
        cooler: { id: 'cooler-nhd15', name: 'Noctua NH-D15 chromax.black', price: 119 }
      }
    }
  ];

  useEffect(() => {
    try {
      const stored = localStorage.getItem('forge_saved_builds');
      if (stored) {
        setBuilds(JSON.parse(stored));
      } else {
        setBuilds(preseededBuilds);
        localStorage.setItem('forge_saved_builds', JSON.stringify(preseededBuilds));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleDelete = (id) => {
    const updated = builds.filter(b => b.id !== id);
    setBuilds(updated);
    localStorage.setItem('forge_saved_builds', JSON.stringify(updated));
    showStatus('✓ Build successfully deleted.');
  };

  const handleClone = (buildRecord) => {
    try {
      localStorage.setItem('forge_current_build', JSON.stringify(buildRecord.rawBuild));
      navigate('/builder');
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (buildRecord) => {
    try {
      localStorage.setItem('forge_current_build', JSON.stringify(buildRecord.rawBuild));
      navigate('/builder');
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = (id) => {
    navigator.clipboard.writeText(`https://buildforge.com/builder?share=${id}`);
    showStatus('✓ Shareable link copied to clipboard!');
  };

  const showStatus = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 font-sans mt-8 min-h-screen">
      {/* Title */}
      <div className="mb-8 border-b border-white/5 pb-6 text-left flex justify-between items-end">
        <div>
          <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Stored Schemes</span>
          <h1 className="text-3xl font-black text-white mt-1">Saved PC Builds</h1>
          <p className="text-slate-400 text-xs mt-2">Access and manage your customized gaming rigs configurations.</p>
        </div>
        <button
          onClick={() => navigate('/builder')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer"
        >
          Create New Configuration
        </button>
      </div>

      {statusMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-semibold text-left">
          {statusMessage}
        </div>
      )}

      {builds.length === 0 ? (
        <div className="glass-panel rounded-3xl py-20 px-6 text-center max-w-lg mx-auto">
          <Wrench className="w-16 h-16 text-slate-700 mx-auto mb-4 stroke-[1.2]" />
          <h3 className="text-lg font-bold text-white mb-2">No saved configs found</h3>
          <p className="text-xs text-slate-500 mb-6">You haven't saved any custom setups yet. Open the rig customizer to begin.</p>
          <button
            onClick={() => navigate('/builder')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase px-6 py-3 rounded-lg cursor-pointer"
          >
            Open Rig Customizer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map((b) => (
            <div
              key={b.id}
              className="glass-panel rounded-2xl p-5 flex flex-col justify-between text-left hover:border-blue-500/30 transition-all duration-300 relative group"
            >
              {/* Score Indicators */}
              <div className="absolute top-4 right-4 flex gap-1.5">
                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold font-mono text-[9px] px-2 py-0.5 rounded">
                  Score: {b.compatibilityScore}%
                </span>
              </div>

              {/* Title & Stats */}
              <div>
                <h3 className="font-bold text-white text-base leading-tight group-hover:text-blue-400 transition-colors">
                  {b.name}
                </h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block mt-1">
                  Est. Budget: <strong className="text-blue-400">${b.budget.toFixed(2)}</strong>
                </span>

                {/* Technical specs short list */}
                <div className="mt-4 p-3 bg-[#0F172A] border border-white/5 rounded-xl text-[11px] text-slate-400 space-y-1.5 font-sans">
                  <p className="truncate">CPU: <strong className="text-slate-200">{b.specs?.cpu || 'None'}</strong></p>
                  <p className="truncate">GPU: <strong className="text-slate-200">{b.specs?.gpu || 'None'}</strong></p>
                  <p className="truncate">Case: <strong className="text-slate-200">{b.specs?.case || 'None'}</strong></p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-2 bg-[#0F172A] border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Edit build"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleShare(b.id)}
                    className="p-2 bg-[#0F172A] border border-white/5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                    title="Share config"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 bg-[#0F172A] border border-white/5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    title="Delete config"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleClone(b)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] uppercase px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Load Config
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
