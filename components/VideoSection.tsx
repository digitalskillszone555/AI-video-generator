
import React, { useState, useEffect, useRef } from 'react';
import { generateGardeningVideo, extendExistingVideo } from '../services/geminiService';
import { VideoGenerationResult, ProductionSettings, CinematicProfile } from '../types';

const FX_SUITE: {id: CinematicProfile, name: string, icon: string, prompt: string}[] = [
  { id: 'hdr', name: 'Ultra HDR', icon: '✨', prompt: 'Cinematic 8K, vibrant botanical color grade, ultra-sharp detail.' },
  { id: 'log-c', name: 'Arri Log-C', icon: '🎥', prompt: 'Arri Alexa style, high dynamic range, neutral shadows, filmic grain.' },
  { id: 'raw', name: '35mm Film', icon: '🎞️', prompt: 'Kodak 35mm stock feel, anamorphic lens flares, organic warmth.' },
  { id: 'standard', name: 'Studio', icon: '🏛️', prompt: 'Studio daylight, realistic botanical motion, clean Rec.709 grade.' }
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
    checkAuthorizationStatus();
  }, []);

  const checkAuthorizationStatus = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      const selected = await window.aistudio.hasSelectedApiKey();
      setIsAuthorized(selected);
    } else {
      // Fallback if the utility isn't available - assume API key exists if we reach here
      setIsAuthorized(!!process.env.API_KEY);
    }
  };

  const handleAuthorize = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success as per racing condition guidelines
      setIsAuthorized(true);
    } else {
      setIsAuthorized(true);
    }
  };

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setStatus("Synthesizing Master Clip...");
    try {
      const res = await generateGardeningVideo(prompt, settings, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setWorkspaceMode('edit');
    } catch (err) {
      console.error(err);
      setStatus("Neural Exception. Key Authorization Failed.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const handleEdit = async () => {
    if (!activeClip || !editPrompt.trim()) return;
    setIsProcessing(true);
    setStatus("Master Refinement In Progress...");
    try {
      const res = await extendExistingVideo(activeClip, editPrompt, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setEditPrompt('');
    } catch (err) {
      console.error(err);
      setStatus("Edit cluster failure. Check prompt complexity.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const downloadMaster = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `VERIDION_MASTER_RENDER_${Date.now()}.mp4`;
    a.click();
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto py-40 px-12 text-center space-y-16 animate-in fade-in duration-1000">
        <div className="w-32 h-32 bg-emerald-600 rounded-[3.5rem] flex items-center justify-center mx-auto text-6xl shadow-[0_25px_60px_rgba(16,185,129,0.4)]">🎬</div>
        <div className="space-y-6">
          <h2 className="text-6xl font-bold font-serif tracking-tight leading-none text-white">Studio Locked</h2>
          <p className="text-stone-500 text-2xl font-medium leading-relaxed">Authorization required for 4K Neural Ingestion. Connect your Studio Access Key to unlock the rendering cluster.</p>
        </div>
        <button 
          onClick={handleAuthorize} 
          className="w-full bg-white text-black py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-stone-200 transition-all shadow-2xl active:scale-95"
        >
          Authorize Creative Cluster
        </button>
        <p className="text-[10px] text-stone-700 uppercase tracking-widest">Protocol V4.5-STABLE • Verified Pay-As-You-Go Billing Required</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto grid lg:grid-cols-12 gap-12 animate-in fade-in duration-1000">
      <div className="lg:col-span-3 space-y-10">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[4rem] p-10 shadow-2xl">
          <h3 className="text-[11px] font-black text-stone-600 uppercase tracking-[0.5em] mb-8">Neural Profiles</h3>
          <div className="grid grid-cols-2 gap-5">
            {FX_SUITE.map(fx => (
              <button 
                key={fx.id}
                onClick={() => setSettings({...settings, profile: fx.id})}
                className={`flex flex-col items-center gap-5 p-6 rounded-[2.5rem] border-2 transition-all ${settings.profile === fx.id ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-stone-600'}`}
              >
                <span className="text-4xl">{fx.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">{fx.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[4rem] p-10 shadow-2xl overflow-hidden">
          <h3 className="text-[11px] font-black text-stone-600 uppercase tracking-[0.5em] mb-8">Master Vault</h3>
          <div className="flex lg:flex-col gap-8 overflow-x-auto pb-6">
            {clips.map(clip => (
              <div 
                key={clip.id}
                onClick={() => { setActiveClip(clip); setWorkspaceMode('edit'); }}
                className={`relative flex-shrink-0 w-64 lg:w-full aspect-video rounded-[2.5rem] overflow-hidden border-4 cursor-pointer transition-all ${activeClip?.id === clip.id ? 'border-emerald-500 scale-[1.05] shadow-[0_20px_50px_rgba(16,185,129,0.3)]' : 'border-white/5 opacity-40 hover:opacity-100'}`}
              >
                <video src={clip.url} className="w-full h-full object-cover" />
              </div>
            ))}
            {clips.length === 0 && (
              <div className="py-24 border-2 border-dashed border-white/5 rounded-[3rem] text-center text-stone-800 uppercase tracking-[0.4em] text-[10px] font-black">Awaiting Scene Script</div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-9 space-y-12">
        <div className="bg-[#080808] rounded-[5rem] border border-white/5 overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.9)] relative">
          <div className="aspect-video bg-black relative flex items-center justify-center shadow-inner">
            {activeClip ? (
              <video ref={videoRef} src={activeClip.url} className="w-full h-full object-contain" controls autoPlay />
            ) : (
              <div className="text-center space-y-10 animate-pulse">
                <div className="w-40 h-40 bg-white/[0.03] rounded-[4rem] flex items-center justify-center text-7xl border border-white/10 mx-auto shadow-inner">🎞️</div>
                <p className="text-stone-700 uppercase tracking-[1em] text-sm font-black">Awaiting Neural Render</p>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-20 text-center">
                 <div className="w-28 h-28 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin mb-16 shadow-[0_0_80px_rgba(16,185,129,0.4)]"></div>
                 <div className="space-y-4">
                    <p className="text-emerald-500 font-black uppercase tracking-[0.8em] animate-pulse text-2xl">{status}</p>
                    <p className="text-stone-600 font-bold uppercase tracking-widest text-[11px]">Initializing 4K Cinema Farm Node...</p>
                 </div>
              </div>
            )}
          </div>

          <div className="p-16 lg:p-24">
            {workspaceMode === 'create' ? (
              <div className="space-y-12">
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-[0.6em] ml-4">Production Script Ingest</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. A slow cinematic zoom into a Monstera leaf with morning dew drops, 4K realistic cinematography..."
                    className="w-full h-64 bg-[#0c0c0c] border border-white/5 rounded-[3.5rem] p-14 text-white text-4xl font-serif focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none placeholder:text-stone-900 leading-tight shadow-inner"
                  />
                </div>
                <button 
                  onClick={handleCreate}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full py-12 bg-emerald-600 text-white rounded-[4rem] font-black text-2xl hover:bg-emerald-500 transition-all shadow-[0_30px_70px_rgba(16,185,129,0.4)] disabled:opacity-20 active:scale-[0.98] uppercase tracking-[0.5em]"
                >
                  Start Master Rendering
                </button>
              </div>
            ) : (
              <div className="space-y-16 animate-in slide-in-from-bottom-12 duration-1000">
                <div className="flex flex-col md:flex-row justify-between items-center gap-12 bg-white/[0.02] p-14 rounded-[4rem] border border-white/5 shadow-inner">
                  <div className="flex items-center gap-10">
                    <div className="w-24 h-24 bg-emerald-600 rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl">✨</div>
                    <div>
                       <h4 className="text-4xl font-bold text-white font-serif tracking-tight leading-none mb-4">Master Rendered</h4>
                       <p className="text-[11px] text-stone-600 uppercase tracking-[0.6em] font-black">{settings.resolution} • {settings.profile} • CINEMATIC MASTER</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => activeClip && downloadMaster(activeClip.url)}
                    className="px-20 py-8 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] hover:bg-stone-200 transition-all shadow-2xl active:scale-95"
                  >
                    Export Master
                  </button>
                </div>

                <div className="space-y-8">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-[0.6em] ml-4 text-center block">Neural Refinement (Revision Layer)</label>
                  <div className="flex flex-col md:flex-row gap-8">
                    <input 
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g. Apply 3D animation style, add warm sunset lighting..."
                      className="flex-1 bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] px-12 py-8 text-white text-2xl font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-stone-900 shadow-inner"
                    />
                    <button 
                      onClick={handleEdit}
                      disabled={isProcessing || !editPrompt.trim()}
                      className="px-16 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[11px] hover:bg-emerald-500 transition-all shadow-2xl py-8 md:py-0 active:scale-95"
                    >
                      Apply Edit
                    </button>
                  </div>
                  <div className="flex justify-center pt-4">
                     <button onClick={() => setWorkspaceMode('create')} className="text-stone-700 hover:text-white uppercase tracking-[0.5em] text-[10px] font-black transition-colors">Start New Scene Project</button>
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
