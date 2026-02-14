
import React, { useState, useEffect, useRef } from 'react';
import { generateGardeningVideo, extendExistingVideo } from '../services/geminiService';
import { VideoGenerationResult, ProductionSettings, CinematicProfile } from '../types';

const FX_SUITE: {id: CinematicProfile, name: string, icon: string, prompt: string}[] = [
  { id: 'hdr', name: 'Ultra HDR', icon: '✨', prompt: 'High dynamic range, deep contrast, vibrant colors, 8K detail.' },
  { id: 'log-c', name: 'Arri Log-C', icon: '🎥', prompt: 'Shot on Arri Alexa, Log-C profile, professional film grade, muted shadows.' },
  { id: 'raw', name: '35mm Film', icon: '🎞️', prompt: '35mm film stock, organic grain, cinematic warmth, high fidelity.' },
  { id: 'standard', name: 'Natural', icon: '🌿', prompt: 'Natural lighting, clear focus, standard Rec.709 color.' }
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
    // Safety check for window.aistudio to prevent blank screen errors
    if (window.aistudio?.hasSelectedApiKey) {
      window.aistudio.hasSelectedApiKey().then(setHasKey);
    } else {
      // If window.aistudio is missing, we might be in an environment where it's injected later
      // or we can assume key selection is handled by the process.env.API_KEY directly if valid
      setHasKey(!!process.env.API_KEY);
    }
  }, []);

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setStatus("Synthesizing Master Clip...");
    try {
      // Append FX prompt
      const fx = FX_SUITE.find(f => f.id === settings.profile);
      const enrichedPrompt = `${prompt}. Style: ${fx?.prompt}`;
      
      const res = await generateGardeningVideo(enrichedPrompt, settings, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setWorkspaceMode('edit');
    } catch (err) {
      console.error(err);
      setStatus("Neural Exception. Please re-initiate.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const handleEdit = async () => {
    if (!activeClip || !editPrompt.trim()) return;
    setIsProcessing(true);
    setStatus("Neural Re-Rendering Master...");
    try {
      const res = await extendExistingVideo(activeClip, editPrompt, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setEditPrompt('');
    } catch (err) {
      console.error(err);
      setStatus("Editing Fault.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const exportMaster = (clip: VideoGenerationResult) => {
    const link = document.createElement('a');
    link.href = clip.url;
    link.download = `VERIDION_EDIT_${clip.id.toUpperCase()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasKey) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-4xl shadow-2xl">🎬</div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold font-serif">Studio Access Locked</h2>
          <p className="text-stone-500 text-lg">Connect your professional Studio Key to begin 4K Neural Production & Editing.</p>
        </div>
        <button 
          onClick={() => window.aistudio?.openSelectKey?.().then(() => setHasKey(true))} 
          className="w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-widest text-sm hover:bg-stone-200 transition-all shadow-xl"
        >
          Authorize Creative Node
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-8 animate-in fade-in duration-1000">
      
      {/* Timeline & FX Panel */}
      <div className="lg:col-span-3 order-2 lg:order-1 space-y-8 h-fit lg:sticky lg:top-24">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-2xl">
          <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Neural FX Profiles</h3>
          <div className="grid grid-cols-2 gap-3">
            {FX_SUITE.map(fx => (
              <button 
                key={fx.id}
                onClick={() => setSettings({...settings, profile: fx.id})}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${settings.profile === fx.id ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' : 'bg-white/[0.02] border-white/5 hover:border-white/10 text-stone-500'}`}
              >
                <span className="text-2xl">{fx.icon}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-center leading-tight">{fx.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-2xl">
          <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Master History</h3>
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-x-hidden pb-2">
            {clips.map(clip => (
              <div 
                key={clip.id}
                onClick={() => { setActiveClip(clip); setWorkspaceMode('edit'); }}
                className={`relative flex-shrink-0 w-48 lg:w-full aspect-video rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${activeClip?.id === clip.id ? 'border-emerald-500 shadow-xl scale-[1.02]' : 'border-white/5 opacity-40'}`}
              >
                <video src={clip.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[8px] font-bold text-white uppercase tracking-widest">Master {clip.id.slice(0,4)}</span>
                </div>
              </div>
            ))}
            {clips.length === 0 && (
              <div className="py-12 border border-dashed border-white/5 rounded-2xl text-center text-[9px] font-bold text-stone-800 uppercase tracking-widest">No Active Renders</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Suite Monitor */}
      <div className="lg:col-span-9 order-1 lg:order-2 space-y-8">
        <div className="bg-[#080808] rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="aspect-video bg-black relative group flex items-center justify-center overflow-hidden">
            {activeClip ? (
              <video 
                ref={videoRef}
                src={activeClip.url}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            ) : (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl border border-white/5 mx-auto">📽️</div>
                <div className="space-y-2">
                   <p className="text-stone-500 font-bold uppercase tracking-[0.4em] text-[11px]">Creative Suite 4.0 Ready</p>
                   <p className="text-[9px] text-stone-800 uppercase tracking-widest">Connect sample script to initialize master production</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-12 text-center">
                 <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-10"></div>
                 <div className="space-y-4 max-w-sm">
                    <p className="text-emerald-500 font-bold uppercase tracking-[0.5em] animate-pulse text-sm">{status || "Processing Frame Buffer"}</p>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 animate-[loading_10s_ease-in-out_infinite]" style={{width: '60%'}}></div>
                    </div>
                    <p className="text-[10px] text-stone-600 uppercase tracking-widest">High-fidelity rendering takes a few moments. Please remain in the suite.</p>
                 </div>
              </div>
            )}
          </div>

          <div className="p-10 lg:p-14">
            {workspaceMode === 'create' ? (
              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Production Script / Prompt</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your botanical scene in vivid detail for the AI editor..."
                    className="w-full h-48 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-10 text-white text-2xl font-serif focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none placeholder:text-stone-900"
                  />
                </div>
                <button 
                  onClick={handleCreate}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-bold text-xl hover:bg-emerald-500 transition-all shadow-2xl flex items-center justify-center gap-6 group disabled:opacity-20"
                >
                  <span className="uppercase tracking-[0.2em] text-sm">Initialize Production</span>
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            ) : (
              <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-white/[0.03] p-10 rounded-[3rem] border border-white/5 shadow-xl">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-2xl">✨</div>
                    <div>
                       <h4 className="text-2xl font-bold text-white font-serif tracking-tight leading-none mb-2">Render Complete</h4>
                       <p className="text-[10px] text-stone-500 uppercase tracking-[0.3em] font-bold">Res: {settings.resolution} • Profile: {settings.profile}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => activeClip && exportMaster(activeClip)}
                      className="flex-1 md:flex-none px-12 py-6 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-200 transition-all shadow-2xl flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Master Export
                    </button>
                    <button 
                      onClick={() => setWorkspaceMode('create')}
                      className="px-8 bg-white/5 border border-white/10 rounded-2xl text-stone-500 hover:text-white transition-all flex items-center justify-center"
                    >
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Neural Refinement Prompt</label>
                    <div className="flex gap-4">
                      <input 
                        type="text"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g. Add cinematic bloom, increase saturation, pan left..."
                        className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-6 text-white text-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-stone-800"
                      />
                      <button 
                        onClick={handleEdit}
                        disabled={isProcessing || !editPrompt.trim()}
                        className="px-10 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all shadow-xl disabled:opacity-20"
                      >
                        Run Edit
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] text-stone-700 uppercase tracking-[0.5em] text-center">Refinement prompts apply frame-consistent neural modifications to the active master clip.</p>
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
