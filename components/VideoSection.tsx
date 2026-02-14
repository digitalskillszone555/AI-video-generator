import React, { useState, useEffect, useRef } from 'react';
import { generateGardeningVideo, extendExistingVideo } from '../services/geminiService';
import { VideoGenerationResult, ProductionSettings, CinematicProfile } from '../types';

const FX_SUITE: {id: CinematicProfile, name: string, icon: string, prompt: string}[] = [
  { id: 'hdr', name: 'Ultra HDR', icon: '✨', prompt: 'Vibrant nature colors, high contrast, cinematic bloom, 8K detail.' },
  { id: 'log-c', name: 'Arri Log-C', icon: '🎥', prompt: 'Professional Arri Alexa flat profile, film grade potential, high dynamic range.' },
  { id: 'raw', name: '35mm Film', icon: '🎞️', prompt: 'Organic film grain, cinematic warmth, anamorphic flare, nostalgic 35mm feel.' },
  { id: 'standard', name: 'Natural', icon: '🌿', prompt: 'Soft daylight, shallow depth of field, realistic botanical movement.' }
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
    const checkKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setIsAuthorized(selected);
      }
    };
    checkKey();
  }, []);

  const handleAuthorize = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setIsAuthorized(true);
    }
  };

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setStatus("Synthesizing Master Sequence...");
    try {
      const res = await generateGardeningVideo(prompt, settings, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setWorkspaceMode('edit');
    } catch (err) {
      console.error(err);
      setStatus("Neural Exception. Please check authorization.");
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
      setStatus("Edit cluster fault. Ensure detailed instruction.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const downloadMaster = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `VERIDION_MASTER_${Date.now()}.mp4`;
    a.click();
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-xl mx-auto py-32 px-10 text-center space-y-12 animate-in fade-in duration-1000">
        <div className="w-28 h-28 bg-emerald-600 rounded-[3rem] flex items-center justify-center mx-auto text-5xl shadow-2xl">🎬</div>
        <div className="space-y-6">
          <h2 className="text-5xl font-bold font-serif tracking-tight leading-none">Studio Access Locked</h2>
          <p className="text-stone-500 text-xl font-medium leading-relaxed">Authorization required for 4K Neural Production. Connect your Studio Access Key.</p>
        </div>
        <button 
          onClick={handleAuthorize} 
          className="w-full bg-white text-black py-6 rounded-3xl font-extrabold uppercase tracking-[0.4em] text-xs hover:bg-stone-200 transition-all shadow-2xl active:scale-95"
        >
          Authorize Creative Node
        </button>
        <p className="text-[9px] text-stone-700 uppercase tracking-widest leading-none">Veridion Cloud Compute Protocol V4.2</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-10 animate-in fade-in duration-1000">
      <div className="lg:col-span-3 space-y-8">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-8 shadow-2xl">
          <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em] mb-6">Neural Profiles</h3>
          <div className="grid grid-cols-2 gap-4">
            {FX_SUITE.map(fx => (
              <button 
                key={fx.id}
                onClick={() => setSettings({...settings, profile: fx.id})}
                className={`flex flex-col items-center gap-4 p-5 rounded-3xl border-2 transition-all ${settings.profile === fx.id ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-stone-600'}`}
              >
                <span className="text-3xl">{fx.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">{fx.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-8 shadow-2xl overflow-hidden">
          <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em] mb-6">Master Vault</h3>
          <div className="flex lg:flex-col gap-6 overflow-x-auto pb-4">
            {clips.map(clip => (
              <div 
                key={clip.id}
                onClick={() => { setActiveClip(clip); setWorkspaceMode('edit'); }}
                className={`relative flex-shrink-0 w-56 lg:w-full aspect-video rounded-[2rem] overflow-hidden border-4 cursor-pointer transition-all ${activeClip?.id === clip.id ? 'border-emerald-500 scale-[1.03]' : 'border-white/5 opacity-50 hover:opacity-100'}`}
              >
                <video src={clip.url} className="w-full h-full object-cover" />
              </div>
            ))}
            {clips.length === 0 && (
              <div className="py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center text-stone-800 uppercase tracking-widest text-[9px]">Ingest Prompt to Start</div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-9 space-y-10">
        <div className="bg-[#080808] rounded-[4.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="aspect-video bg-black relative flex items-center justify-center">
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
                <p className="text-stone-700 uppercase tracking-[0.6em] text-xs font-black">Waiting for Master Script</p>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-16 text-center">
                 <div className="w-24 h-24 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin mb-12 shadow-[0_0_50px_rgba(16,185,129,0.3)]"></div>
                 <p className="text-emerald-500 font-black uppercase tracking-[0.6em] animate-pulse text-lg">{status}</p>
              </div>
            )}
          </div>

          <div className="p-12 lg:p-20">
            {workspaceMode === 'create' ? (
              <div className="space-y-10">
                <div className="space-y-5">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-[0.5em] ml-2">Production Script</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. A high-fidelity macro of a venus flytrap closing, cinematic 35mm grain, slow motion..."
                    className="w-full h-56 bg-[#0c0c0c] border border-white/5 rounded-[3rem] p-12 text-white text-3xl font-serif focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none placeholder:text-stone-900 leading-tight shadow-inner"
                  />
                </div>
                <button 
                  onClick={handleCreate}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full py-10 bg-emerald-600 text-white rounded-[3.5rem] font-black text-xl hover:bg-emerald-500 transition-all shadow-2xl group disabled:opacity-20 active:scale-95"
                >
                  <span className="uppercase tracking-[0.4em] text-sm">Initialize Mastering</span>
                </button>
              </div>
            ) : (
              <div className="space-y-12 animate-in slide-in-from-bottom-10 duration-1000">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 bg-[#0c0c0c] p-12 rounded-[4rem] border border-white/5 shadow-inner">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl">🎞️</div>
                    <div>
                       <h4 className="text-3xl font-bold text-white font-serif tracking-tight leading-none mb-3">Master Active</h4>
                       <p className="text-[11px] text-stone-600 uppercase tracking-[0.4em] font-black">{settings.resolution} • {settings.profile} • {clips.length} Refinements</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => activeClip && downloadMaster(activeClip.url)}
                    className="px-16 py-7 bg-white text-black rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:bg-stone-200 transition-all shadow-2xl active:scale-95"
                  >
                    Export Pro Master
                  </button>
                </div>

                <div className="space-y-6">
                  <label className="text-[11px] font-black text-stone-700 uppercase tracking-[0.5em] ml-2">Neural Refinement (Capstone CapCut style)</label>
                  <div className="flex flex-col md:flex-row gap-6">
                    <input 
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="E.g. Make it a 3D animated video, add sunset lighting, zoom in more..."
                      className="flex-1 bg-[#0c0c0c] border border-white/5 rounded-3xl px-10 py-7 text-white text-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-stone-900 shadow-inner"
                    />
                    <button 
                      onClick={handleEdit}
                      disabled={isProcessing || !editPrompt.trim()}
                      className="px-14 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-emerald-500 transition-all shadow-2xl disabled:opacity-20 active:scale-95 py-7 md:py-0"
                    >
                      Apply Refinement
                    </button>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <button onClick={() => setWorkspaceMode('create')} className="text-stone-700 hover:text-white uppercase tracking-widest text-[9px] font-black transition-colors">Create New Master</button>
                    <span className="text-[9px] text-stone-800 uppercase font-black tracking-widest">Veo 3.1 Neural Cluster Active</span>
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