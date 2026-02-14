
import React, { useState, useEffect, useRef } from 'react';
import { generateGardeningVideo, extendExistingVideo } from '../services/geminiService';
import { VideoGenerationResult, ProductionSettings, CinematicProfile } from '../types';

const FX_SUITE: {id: CinematicProfile, name: string, icon: string}[] = [
  { id: 'hdr', name: 'Ultra HDR', icon: '✨' },
  { id: 'log-c', name: 'Arri Log-C', icon: '🎥' },
  { id: 'raw', name: '35mm Film', icon: '🎞️' },
  { id: 'standard', name: 'Natural', icon: '🌿' }
];

const VideoSection: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [settings, setSettings] = useState<ProductionSettings>({
    profile: 'hdr',
    framerate: 24,
    resolution: '1080p',
    aspectRatio: '16:9'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [clips, setClips] = useState<VideoGenerationResult[]>([]);
  const [activeClip, setActiveClip] = useState<VideoGenerationResult | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<'create' | 'edit'>('create');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    window.aistudio.hasSelectedApiKey().then(setHasKey);
  }, []);

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    try {
      const res = await generateGardeningVideo(prompt, settings, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setWorkspaceMode('edit');
    } catch (err) {
      setStatus("Neural Conflict Detected. Re-check API Key.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const handleEdit = async () => {
    if (!activeClip || !editPrompt.trim()) return;
    setIsProcessing(true);
    setStatus("Neural Re-Mapping for Correction...");
    try {
      const res = await extendExistingVideo(activeClip, editPrompt, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setEditPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportMaster = (clip: VideoGenerationResult) => {
    const link = document.createElement('a');
    link.href = clip.url;
    link.download = `VERIDION_MASTER_${clip.id.toUpperCase()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasKey) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto text-4xl shadow-2xl shadow-emerald-500/20">🎬</div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold font-serif">Pro Studio Gateway</h2>
          <p className="text-stone-500 text-lg leading-relaxed">The Creative Suite requires a verified Studio Key for 4K Neural Production.</p>
        </div>
        <button onClick={() => window.aistudio.openSelectKey().then(() => setHasKey(true))} className="w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-stone-200 transition-all">Authorize Node</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto grid lg:grid-cols-12 gap-8 animate-in fade-in duration-1000">
      
      {/* FX & Timeline Sidebar */}
      <div className="lg:col-span-3 order-2 lg:order-1 space-y-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Neural FX Engine</h3>
          <div className="grid grid-cols-2 gap-3">
            {FX_SUITE.map(fx => (
              <button 
                key={fx.id}
                onClick={() => setSettings({...settings, profile: fx.id})}
                className={`flex flex-col items-center gap-3 p-4 rounded-3xl border transition-all ${settings.profile === fx.id ? 'bg-emerald-600/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
              >
                <span className="text-2xl">{fx.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{fx.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-8 border-t border-white/5">
          <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Production Timeline</h3>
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-x-hidden pb-4">
            {clips.map(clip => (
              <div 
                key={clip.id}
                onClick={() => { setActiveClip(clip); setWorkspaceMode('edit'); }}
                className={`relative flex-shrink-0 w-48 lg:w-full aspect-video rounded-3xl overflow-hidden border-2 cursor-pointer transition-all ${activeClip?.id === clip.id ? 'border-emerald-500 shadow-2xl scale-[1.02]' : 'border-white/5 opacity-40 hover:opacity-100'}`}
              >
                <video src={clip.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">Master {clip.id.slice(0,4)}</span>
                </div>
              </div>
            ))}
            {clips.length === 0 && (
              <div className="py-12 border border-dashed border-white/5 rounded-3xl text-center text-[10px] font-bold text-stone-800 uppercase tracking-widest">Awaiting First Capture</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Production Monitor */}
      <div className="lg:col-span-9 order-1 lg:order-2 space-y-8">
        <div className="bg-[#080808] rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="aspect-video bg-black relative group">
            {activeClip ? (
              <video 
                ref={videoRef}
                src={activeClip.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl border border-white/5">📽️</div>
                <div className="text-center space-y-2">
                   <p className="text-stone-500 font-bold uppercase tracking-[0.4em] text-[10px]">Veridion Creative Workspace</p>
                   <p className="text-[9px] text-stone-800 uppercase tracking-widest">Cluster Node: Active • Status: Awaiting Signal</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl z-50 flex flex-col items-center justify-center">
                 <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                 <div className="text-center space-y-3">
                    <p className="text-emerald-500 font-bold uppercase tracking-[0.4em] animate-pulse text-xs">{status || "Neural Rendering Master"}</p>
                    <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 animate-[loading_10s_ease-in-out_infinite]" style={{width: '45%'}}></div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          <div className="p-8 lg:p-12">
            {workspaceMode === 'create' ? (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Cinematic Production Script</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your scene (e.g., A macro close-up of a cactus flower blooming in the desert morning mist...)"
                    className="w-full h-40 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-white text-xl font-serif focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none placeholder:text-stone-900"
                  />
                </div>
                <button 
                  onClick={handleCreate}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full py-7 bg-emerald-600 text-white rounded-[2rem] font-bold text-lg hover:bg-emerald-500 transition-all shadow-2xl flex items-center justify-center gap-4 group disabled:opacity-20"
                >
                  <span className="uppercase tracking-widest text-xs">Initialize Master Build</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-2xl">🏆</div>
                    <div>
                       <h4 className="text-xl font-bold text-white font-serif tracking-tight">Production Ready</h4>
                       <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold">Profile: {settings.profile} • {settings.resolution}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => activeClip && exportMaster(activeClip)}
                      className="flex-1 md:flex-none px-10 py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-stone-200 transition-all shadow-2xl"
                    >
                      Export Master MP4
                    </button>
                    <button 
                      onClick={() => setWorkspaceMode('create')}
                      className="px-6 bg-white/5 border border-white/10 rounded-2xl text-stone-400 hover:text-white transition-all"
                    >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[9px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Neural Edit / Correction Prompt</label>
                  <div className="flex gap-3">
                    <input 
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g., Make it darker, add more film grain, zoom into the leaves..."
                      className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-stone-800"
                    />
                    <button 
                      onClick={handleEdit}
                      disabled={isProcessing || !editPrompt.trim()}
                      className="px-8 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-500 transition-all shadow-xl disabled:opacity-20"
                    >
                      Update Clip
                    </button>
                  </div>
                  <p className="text-[9px] text-stone-700 uppercase tracking-widest text-center">Refinement utilizes frame-consistent neural editing technology.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
