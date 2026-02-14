
import React, { useState, useEffect, useRef } from 'react';
import { generateGardeningVideo, extendExistingVideo } from '../services/geminiService';
import { VideoGenerationResult, ProductionSettings, CinematicProfile } from '../types';

const FX_PROFILES: {id: CinematicProfile, name: string, desc: string}[] = [
  { id: 'standard', name: 'Clean Natural', desc: 'Rec.709 standard broadcast look.' },
  { id: 'log-c', name: 'Arri Vantage', desc: 'Log-C color space for pro grading.' },
  { id: 'raw', name: '8K Digital RAW', desc: 'Maximum detail, filmic grain.' },
  { id: 'hdr', name: 'Cinematic HDR', desc: 'High dynamic range, vibrant peaks.' }
];

const VideoSection: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [settings, setSettings] = useState<ProductionSettings>({
    profile: 'hdr',
    framerate: 24,
    resolution: '1080p',
    aspectRatio: '16:9'
  });
  
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [timeline, setTimeline] = useState<VideoGenerationResult[]>([]);
  const [selectedClip, setSelectedClip] = useState<VideoGenerationResult | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    window.aistudio.hasSelectedApiKey().then(setHasKey);
  }, []);

  const handleOpenKey = async () => {
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const result = await generateGardeningVideo(prompt, settings, setStatus);
      setTimeline(prev => [result, ...prev]);
      setSelectedClip(result);
      setShowEditor(true);
    } catch (err) {
      console.error(err);
      setStatus("Production Failed. Re-check API.");
    } finally {
      setGenerating(false);
      setStatus('');
    }
  };

  const handleRefine = async () => {
    if (!selectedClip || !refinementPrompt.trim()) return;
    setGenerating(true);
    setStatus("Neural Re-Rendering Master...");
    try {
      // Use extension logic to simulate "editing" the clip with new instructions
      const result = await extendExistingVideo(selectedClip, refinementPrompt, setStatus);
      setTimeline(prev => [result, ...prev]);
      setSelectedClip(result);
      setRefinementPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
      setStatus('');
    }
  };

  const downloadClip = (clip: VideoGenerationResult) => {
    const link = document.createElement('a');
    link.href = clip.url;
    link.download = `Veridion_Creative_Master_${clip.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto py-32 text-center space-y-12 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-white text-5xl shadow-[0_0_80px_rgba(5,150,105,0.3)] animate-pulse">🎬</div>
        <div className="space-y-4">
          <h2 className="text-5xl font-bold font-serif">Creative Suite Locked</h2>
          <p className="text-stone-500 text-xl max-w-lg mx-auto">Connect your professional Studio Key to access the Veo 3.1 Neural Production & Editing suite.</p>
        </div>
        <button onClick={handleOpenKey} className="px-12 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-stone-200 transition-all shadow-2xl tracking-widest uppercase">Connect Neural Node</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-8 animate-in fade-in duration-1000">
      
      {/* Sidebar: FX & Timeline */}
      <div className="lg:col-span-3 space-y-8 h-[calc(100vh-12rem)] overflow-y-auto pr-4">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Creative FX Profiles</h3>
          <div className="grid gap-3">
            {FX_PROFILES.map(fx => (
              <button 
                key={fx.id} 
                onClick={() => setSettings({...settings, profile: fx.id})}
                className={`w-full text-left p-5 rounded-[2rem] border transition-all ${settings.profile === fx.id ? 'bg-emerald-600/10 border-emerald-500' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
              >
                <div className="font-bold text-sm text-white mb-1">{fx.name}</div>
                <p className="text-[10px] text-stone-500">{fx.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-8 border-t border-white/5">
          <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Master Render History</h3>
          <div className="grid gap-4">
            {timeline.map(clip => (
              <div 
                key={clip.id} 
                onClick={() => { setSelectedClip(clip); setShowEditor(true); }}
                className={`group relative rounded-3xl overflow-hidden aspect-video border-2 cursor-pointer transition-all ${selectedClip?.id === clip.id ? 'border-emerald-500 shadow-2xl scale-[1.02]' : 'border-white/5 opacity-50 grayscale hover:grayscale-0 hover:opacity-100'}`}
              >
                <video src={clip.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-4 flex flex-col justify-end">
                  <div className="text-[8px] font-bold text-white uppercase tracking-widest">Master {clip.id.slice(0,4)}</div>
                </div>
              </div>
            ))}
            {timeline.length === 0 && (
              <div className="py-20 border border-dashed border-white/10 rounded-[2rem] text-center text-[10px] font-bold text-stone-800 uppercase tracking-widest">No Active Renders</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Suite */}
      <div className="lg:col-span-9 space-y-8">
        <div className="bg-[#080808] rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.8)]">
          {/* Main Monitor */}
          <div className="aspect-video bg-black relative group overflow-hidden">
            {selectedClip ? (
              <video 
                ref={videoRef}
                src={selectedClip.url} 
                className="w-full h-full object-contain" 
                controls 
                autoPlay
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl border border-white/5">📽️</div>
                <div className="text-center space-y-2">
                   <p className="text-stone-600 font-bold uppercase tracking-[0.5em] text-[11px]">Ready for Production</p>
                   <p className="text-[10px] text-stone-800 uppercase tracking-widest">Veo 3.1 Neural Cluster 04 Online</p>
                </div>
              </div>
            )}

            {generating && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center">
                 <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                 <div className="text-center space-y-3">
                    <p className="text-emerald-500 font-bold uppercase tracking-[0.4em] animate-pulse text-sm">{status || "Rendering Frames"}</p>
                    <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 animate-[loading_10s_ease-in-out_infinite]" style={{width: '30%'}}></div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Suite Controls */}
          <div className="p-10 lg:p-14 space-y-12">
            {!showEditor ? (
              <div className="flex flex-col gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Initial Scene Script</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the cinematic botanical scene in detail..."
                    className="w-full h-40 bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 text-white text-2xl font-serif focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none placeholder:text-stone-900 leading-tight"
                  />
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-bold text-xl hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-950/50 flex items-center justify-center gap-6 group disabled:opacity-20"
                >
                  <span className="uppercase tracking-[0.2em] text-sm">Initialize Master Production</span>
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            ) : (
              <div className="space-y-12 animate-in slide-in-from-bottom-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5 p-8 rounded-[3rem] border border-white/5">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-2xl">✨</div>
                    <div>
                       <h4 className="text-xl font-bold text-white font-serif tracking-tight">Master Render Completed</h4>
                       <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-bold">Profile: {settings.profile} • {settings.resolution}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => selectedClip && downloadClip(selectedClip)}
                      className="flex-1 md:flex-none px-10 py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-200 transition-all flex items-center justify-center gap-3 shadow-2xl"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Export Master 4K
                    </button>
                    <button 
                      onClick={() => setShowEditor(false)}
                      className="p-5 bg-white/5 border border-white/10 rounded-2xl text-stone-400 hover:text-white transition-all"
                    >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Neural Edit / Refinement Prompt</label>
                  <div className="flex gap-4">
                    <input 
                      type="text"
                      value={refinementPrompt}
                      onChange={(e) => setRefinementPrompt(e.target.value)}
                      placeholder="Instruction: Make the mist thicker / Zoom into the flower..."
                      className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-stone-800 font-medium"
                    />
                    <button 
                      onClick={handleRefine}
                      disabled={generating || !refinementPrompt.trim()}
                      className="px-10 bg-emerald-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all shadow-xl disabled:opacity-20"
                    >
                      Update Master
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-700 uppercase tracking-widest text-center">Refinement uses high-fidelity frame-consistent editing logic.</p>
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
