
import React, { useState, useEffect, useRef } from 'react';
import { generateGardeningVideo, extendExistingVideo } from '../services/geminiService';
import { VideoGenerationResult, ProductionSettings, CinematicProfile } from '../types';

const FX_SUITE: {id: CinematicProfile, name: string, icon: string, prompt: string}[] = [
  { id: 'hdr', name: 'Ultra HDR', icon: '✨', prompt: 'High dynamic range, deep contrast, vibrant colors, 8K detail, cinematic bloom.' },
  { id: 'log-c', name: 'Arri Log-C', icon: '🎥', prompt: 'Arri Alexa Log-C profile, professional film grade, neutral highlights, flat color for grading.' },
  { id: 'raw', name: '35mm Film', icon: '🎞️', prompt: '35mm film stock, organic grain, cinematic warmth, high fidelity, anamorphic lens flares.' },
  { id: 'standard', name: 'Natural', icon: '🌿', prompt: 'Natural daylight, soft focus, standard Rec.709 colors, realistic botanical motion.' }
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
    // Robust key check to prevent blank screen crash
    const checkKey = async () => {
      try {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } else {
          setHasKey(!!process.env.API_KEY);
        }
      } catch (err) {
        setHasKey(!!process.env.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setStatus("Synthesizing Base Master...");
    try {
      const fx = FX_SUITE.find(f => f.id === settings.profile);
      const enrichedPrompt = `${prompt}. Style Guidelines: ${fx?.prompt}`;
      
      const res = await generateGardeningVideo(enrichedPrompt, settings, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setWorkspaceMode('edit');
    } catch (err) {
      console.error(err);
      setStatus("Neural Synthesis Error. Verify API Cluster.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const handleEdit = async () => {
    if (!activeClip || !editPrompt.trim()) return;
    setIsProcessing(true);
    setStatus("Neural Re-Mapping & Correction...");
    try {
      const res = await extendExistingVideo(activeClip, editPrompt, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setEditPrompt('');
    } catch (err) {
      console.error(err);
      setStatus("Neural Conflict during Edit.");
    } finally {
      setIsProcessing(false);
      setStatus('');
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
      <div className="max-w-xl mx-auto py-32 px-10 text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="w-28 h-28 bg-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto text-5xl shadow-[0_20px_60px_rgba(16,185,129,0.3)]">🎬</div>
        <div className="space-y-6">
          <h2 className="text-5xl font-bold font-serif tracking-tight leading-tight">Studio Node Offline</h2>
          <p className="text-stone-500 text-xl font-medium leading-relaxed">Authorization required for 4K Neural Production. Connect your Studio Access Key.</p>
        </div>
        <button 
          onClick={() => window.aistudio?.openSelectKey?.().then(() => setHasKey(true))} 
          className="w-full bg-white text-black py-6 rounded-3xl font-extrabold uppercase tracking-[0.3em] text-xs hover:bg-stone-200 transition-all shadow-2xl active:scale-95"
        >
          Authorize Creative Cluster
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-10 animate-in fade-in duration-1000">
      
      {/* Tool & Asset Sidebar */}
      <div className="lg:col-span-3 order-2 lg:order-1 space-y-8 lg:sticky lg:top-24 h-fit">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-8 space-y-8 shadow-2xl">
          <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em] ml-2">Neural FX Profiles</h3>
          <div className="grid grid-cols-2 gap-4">
            {FX_SUITE.map(fx => (
              <button 
                key={fx.id}
                onClick={() => setSettings({...settings, profile: fx.id})}
                className={`flex flex-col items-center gap-4 p-5 rounded-3xl border-2 transition-all ${settings.profile === fx.id ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-stone-600'}`}
              >
                <span className="text-3xl">{fx.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-center leading-tight">{fx.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-8 space-y-8 shadow-2xl overflow-hidden">
          <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em] ml-2">Master Timeline</h3>
          <div className="flex lg:flex-col gap-6 overflow-x-auto lg:overflow-x-hidden pb-4 lg:pb-0">
            {clips.map(clip => (
              <div 
                key={clip.id}
                onClick={() => { setActiveClip(clip); setWorkspaceMode('edit'); }}
                className={`relative flex-shrink-0 w-56 lg:w-full aspect-video rounded-[2rem] overflow-hidden border-4 cursor-pointer transition-all ${activeClip?.id === clip.id ? 'border-emerald-500 shadow-2xl scale-[1.03]' : 'border-white/5 opacity-50 hover:opacity-100'}`}
              >
                <video src={clip.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{clip.id.slice(0,5)}</span>
                </div>
              </div>
            ))}
            {clips.length === 0 && (
              <div className="py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center space-y-4">
                 <div className="text-4xl opacity-20">🎞️</div>
                 <p className="text-[10px] font-black text-stone-800 uppercase tracking-widest">Awaiting Master Ingest</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Production Workspace */}
      <div className="lg:col-span-9 order-1 lg:order-2 space-y-10">
        <div className="bg-[#080808] rounded-[4.5rem] border border-white/5 overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.8)] relative">
          {/* Main Monitor */}
          <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
            {activeClip ? (
              <video 
                ref={videoRef}
                src={activeClip.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            ) : (
              <div className="text-center space-y-8 animate-pulse">
                <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-5xl border border-white/10 mx-auto shadow-inner">🎬</div>
                <div className="space-y-3">
                   <p className="text-stone-500 font-black uppercase tracking-[0.6em] text-xs">Neural Studio Core 4.0</p>
                   <p className="text-[10px] text-stone-800 uppercase tracking-[0.8em]">Awaiting Production Script Input</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-16 text-center">
                 <div className="w-24 h-24 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin mb-12 shadow-[0_0_50px_rgba(16,185,129,0.2)]"></div>
                 <div className="space-y-6 max-w-md">
                    <p className="text-emerald-500 font-black uppercase tracking-[0.6em] animate-pulse text-lg">{status || "Processing Frame Data"}</p>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-emerald-500 animate-[loading_10s_ease-in-out_infinite]" style={{width: '55%'}}></div>
                    </div>
                    <p className="text-[11px] text-stone-600 uppercase tracking-[0.4em] font-bold leading-relaxed">Neural rendering is intense. High-fidelity masters take time to synthesize.</p>
                 </div>
              </div>
            )}
          </div>

          {/* Editor Controls */}
          <div className="p-12 lg:p-20">
            {workspaceMode === 'create' ? (
              <div className="space-y-10">
                <div className="space-y-5">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-[0.5em] ml-2">Scene Construction Script</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. A hyper-realistic 4K macro shot of a monstera leaf with dew drops catching the morning golden hour light..."
                    className="w-full h-56 bg-[#0c0c0c] border border-white/5 rounded-[3rem] p-12 text-white text-3xl font-serif focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none placeholder:text-stone-900 leading-tight shadow-inner"
                  />
                </div>
                <button 
                  onClick={handleCreate}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full py-10 bg-emerald-600 text-white rounded-[3.5rem] font-black text-xl hover:bg-emerald-500 transition-all shadow-[0_25px_60px_rgba(16,185,129,0.3)] flex items-center justify-center gap-8 group disabled:opacity-20 active:scale-95"
                >
                  <span className="uppercase tracking-[0.4em] text-sm">Initialize Master Render</span>
                  <svg className="w-8 h-8 group-hover:translate-x-3 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            ) : (
              <div className="space-y-16 animate-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-[#0c0c0c] p-12 rounded-[4rem] border border-white/5 shadow-2xl">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl">✨</div>
                    <div>
                       <h4 className="text-3xl font-bold text-white font-serif tracking-tight leading-none mb-3">Master Render Completed</h4>
                       <p className="text-[11px] text-stone-600 uppercase tracking-[0.4em] font-black">Production Profile: {settings.profile} • {settings.resolution}</p>
                    </div>
                  </div>
                  <div className="flex gap-6 w-full md:w-auto">
                    <button 
                      onClick={() => activeClip && exportMaster(activeClip)}
                      className="flex-1 md:flex-none px-16 py-7 bg-white text-black rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:bg-stone-200 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Direct Export
                    </button>
                    <button 
                      onClick={() => setWorkspaceMode('create')}
                      className="p-7 bg-white/5 border border-white/10 rounded-3xl text-stone-500 hover:text-white transition-all flex items-center justify-center hover:bg-white/10 active:scale-95"
                    >
                       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-stone-700 uppercase tracking-[0.5em] ml-2">Neural Edit / Refinement Instruction</label>
                    <div className="flex gap-6">
                      <input 
                        type="text"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="E.g. Add film grain, make the lighting moodier, pan down slowly..."
                        className="flex-1 bg-[#0c0c0c] border border-white/5 rounded-3xl px-10 py-7 text-white text-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-stone-900 shadow-inner"
                      />
                      <button 
                        onClick={handleEdit}
                        disabled={isProcessing || !editPrompt.trim()}
                        className="px-14 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-emerald-500 transition-all shadow-2xl disabled:opacity-20 active:scale-95"
                      >
                        Apply Edit
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-800 uppercase tracking-[0.6em] text-center font-bold">Edit instructions utilize advanced frame-consistent neural patching logic.</p>
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
