import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit3, Copy, Share2, Wrench, ShieldCheck, Heart } from 'lucide-react';

export default function SavedBuilds() {
  const navigate = useNavigate();
  const [builds, setBuilds] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('forge_saved_builds');
      if (stored) {
        setBuilds(JSON.parse(stored));
      } else {
        setBuilds([]);
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
                  Est. Budget: <strong className="text-blue-400">₹{b.budget.toLocaleString('en-IN')}</strong>
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
