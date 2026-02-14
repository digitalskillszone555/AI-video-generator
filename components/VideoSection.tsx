
import React, { useState, useEffect, useRef } from 'react';
import { generateGardeningVideo, extendExistingVideo } from '../services/geminiService';
import { VideoGenerationResult, ProductionSettings, CinematicProfile } from '../types';

const FX_SUITE: {id: CinematicProfile, name: string, icon: string, prompt: string}[] = [
  { id: 'hdr', name: 'Ultra HDR', icon: '✨', prompt: 'Cinematic 8K, vibrant nature color grade, ultra-sharp detail, HDR peaks.' },
  { id: 'log-c', name: 'Arri Log-C', icon: '🎥', prompt: 'Arri Alexa Log-C, flat profile, maximum dynamic range, professional shadows.' },
  { id: 'raw', name: '35mm Film', icon: '🎞️', prompt: '35mm film stock, organic grain, anamorphic flare, cinematic warmth.' },
  { id: 'standard', name: 'Studio', icon: '🏛️', prompt: 'Clean studio lighting, realistic botanical movement, natural colors.' }
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<'create' | 'edit'>('create');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setIsAuthorized(selected);
    } else {
      setIsAuthorized(!!process.env.API_KEY);
    }
  };

  const handleAuthorize = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setIsAuthorized(true);
    } else {
      setIsAuthorized(true);
    }
  };

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setStatus("Booting Cinema Compute...");
    try {
      const res = await generateGardeningVideo(prompt, settings, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setWorkspaceMode('edit');
    } catch (err) {
      console.error(err);
      setStatus("Neural Node Error. Please re-authorize.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const handleEdit = async () => {
    if (!activeClip || !editPrompt.trim()) return;
    setIsProcessing(true);
    setStatus("Rendering Master Refinement...");
    try {
      const res = await extendExistingVideo(activeClip, editPrompt, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setEditPrompt('');
    } catch (err) {
      console.error(err);
      setStatus("Edit cluster failure.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const downloadMaster = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `VERIDION_CINEMA_${Date.now()}.mp4`;
    a.click();
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-48 px-12 text-center space-y-16 animate-in fade-in duration-1000">
        <div className="w-32 h-32 bg-emerald-600 rounded-[4rem] flex items-center justify-center mx-auto text-6xl shadow-2xl">🎬</div>
        <div className="space-y-6">
          <h2 className="text-6xl font-bold font-serif tracking-tight leading-none">Studio Access Locked</h2>
          <p className="text-stone-500 text-2xl font-medium leading-relaxed">Authorization required for 4K Neural Production. Connect your paid API key to unlock the master rendering cluster.</p>
        </div>
        <button 
          onClick={handleAuthorize} 
          className="w-full bg-white text-black py-8 rounded-[3rem] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-stone-200 transition-all shadow-2xl active:scale-95"
        >
          Authorize Creative Cluster
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto grid lg:grid-cols-12 gap-12 animate-in fade-in duration-1000">
      <div className="lg:col-span-3 space-y-10">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[4rem] p-10 shadow-2xl">
          <h3 className="text-[11px] font-black text-stone-600 uppercase tracking-[0.5em] mb-10">Neural Profiles</h3>
          <div className="grid grid-cols-2 gap-6">
            {FX_SUITE.map(fx => (
              <button 
                key={fx.id}
                onClick={() => setSettings({...settings, profile: fx.id})}
                className={`flex flex-col items-center gap-6 p-8 rounded-[3rem] border-2 transition-all ${settings.profile === fx.id ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-stone-600'}`}
              >
                <span className="text-5xl">{fx.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">{fx.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[4rem] p-10 shadow-2xl overflow-hidden">
          <h3 className="text-[11px] font-black text-stone-600 uppercase tracking-[0.5em] mb-8">Asset Vault</h3>
          <div className="flex lg:flex-col gap-10 overflow-x-auto pb-10">
            {clips.map(clip => (
              <div 
                key={clip.id}
                onClick={() => { setActiveClip(clip); setWorkspaceMode('edit'); }}
                className={`relative flex-shrink-0 w-72 lg:w-full aspect-video rounded-[3rem] overflow-hidden border-4 cursor-pointer transition-all ${activeClip?.id === clip.id ? 'border-emerald-500 scale-[1.05] shadow-2xl' : 'border-white/5 opacity-40 hover:opacity-100'}`}
              >
                <video src={clip.url} className="w-full h-full object-cover" />
              </div>
            ))}
            {clips.length === 0 && (
              <div className="py-24 border-2 border-dashed border-white/5 rounded-[3.5rem] text-center text-stone-800 uppercase tracking-[0.4em] text-[10px] font-black">Awaiting Generation</div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-9 space-y-12">
        <div className="bg-[#080808] rounded-[5rem] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="aspect-video bg-black relative flex items-center justify-center">
            {activeClip ? (
              <video ref={videoRef} src={activeClip.url} className="w-full h-full object-contain" controls autoPlay loop />
            ) : (
              <div className="text-center space-y-12 animate-pulse">
                <div className="w-48 h-48 bg-white/[0.03] rounded-[4rem] flex items-center justify-center text-8xl border border-white/10 mx-auto shadow-inner">🎬</div>
                <p className="text-stone-700 uppercase tracking-[1em] text-sm font-black">Output Master Standby</p>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-24 text-center">
                 <div className="w-32 h-32 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin mb-16 shadow-[0_0_80px_rgba(16,185,129,0.4)]"></div>
                 <div className="space-y-6">
                    <p className="text-emerald-500 font-black uppercase tracking-[0.8em] animate-pulse text-3xl">{status}</p>
                    <p className="text-stone-600 font-bold uppercase tracking-widest text-sm">Synthesizing Temporal Sequence...</p>
                 </div>
              </div>
            )}
          </div>

          <div className="p-20 lg:p-28">
            {workspaceMode === 'create' ? (
              <div className="space-y-12">
                <div className="space-y-6">
                  <label className="text-[12px] font-black text-stone-700 uppercase tracking-[0.6em] ml-6">Cinema Prompt Ingest</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. A hyper-realistic macro slow-motion of a Venus Flytrap snapping shut..."
                    className="w-full h-64 bg-[#0c0c0c] border border-white/5 rounded-[4rem] p-16 text-white text-4xl font-serif focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none placeholder:text-stone-900 leading-tight shadow-inner"
                  />
                </div>
                <button 
                  onClick={handleCreate}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full py-12 bg-emerald-600 text-white rounded-[4rem] font-black text-2xl hover:bg-emerald-500 transition-all shadow-2xl disabled:opacity-20 active:scale-[0.98] uppercase tracking-[0.5em]"
                >
                  Initiate Render
                </button>
              </div>
            ) : (
              <div className="space-y-16 animate-in slide-in-from-bottom-12 duration-1000">
                <div className="flex flex-col md:flex-row justify-between items-center gap-12 bg-white/[0.02] p-14 rounded-[4rem] border border-white/5">
                  <div className="flex items-center gap-12">
                    <div className="w-28 h-28 bg-emerald-600 rounded-[3.5rem] flex items-center justify-center text-7xl shadow-2xl">🎞️</div>
                    <div>
                       <h4 className="text-4xl font-bold text-white font-serif tracking-tight leading-none mb-4">Master Rendered</h4>
                       <p className="text-[12px] text-stone-600 uppercase tracking-[0.6em] font-black">{settings.resolution} • {settings.profile} • CINEMATIC EXPORT READY</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => activeClip && downloadMaster(activeClip.url)}
                    className="px-24 py-10 bg-white text-black rounded-[3rem] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-stone-200 transition-all shadow-2xl active:scale-95"
                  >
                    Export Master
                  </button>
                </div>

                <div className="space-y-8">
                  <label className="text-[12px] font-black text-stone-700 uppercase tracking-[0.6em] ml-6 text-center block">Neural Refinement Instructions</label>
                  <div className="flex flex-col md:flex-row gap-8">
                    <input 
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g. Change lighting to sunset, add 3D animated style..."
                      className="flex-1 bg-[#0c0c0c] border border-white/5 rounded-[3rem] px-14 py-10 text-white text-2xl font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-stone-900 shadow-inner"
                    />
                    <button 
                      onClick={handleEdit}
                      disabled={isProcessing || !editPrompt.trim()}
                      className="px-20 bg-emerald-600 text-white rounded-[3rem] font-black uppercase tracking-[0.3em] text-[12px] hover:bg-emerald-500 transition-all shadow-2xl py-10 md:py-0 active:scale-95"
                    >
                      Apply Edit
                    </button>
                  </div>
                  <div className="flex justify-center pt-6">
                     <button onClick={() => setWorkspaceMode('create')} className="text-stone-700 hover:text-white uppercase tracking-[0.6em] text-[11px] font-black transition-colors">Initialize New Sequence</button>
                  </div>
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
