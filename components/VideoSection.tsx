
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
  const [hasKey, setHasKey] = useState(true); // Default to true to prevent blank screen, check in button
  const [workspaceMode, setWorkspaceMode] = useState<'create' | 'edit'>('create');

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    
    // Check key right before calling API
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      return;
    }

    setIsProcessing(true);
    setStatus("Synthesizing Master Clip...");
    try {
      const fx = FX_SUITE.find(f => f.id === settings.profile);
      const enrichedPrompt = `${prompt}. Style: ${fx?.prompt}`;
      const res = await generateGardeningVideo(enrichedPrompt, settings, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setWorkspaceMode('edit');
    } catch (err) {
      console.error(err);
      setStatus("Error: Authorization or Network Failure.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  const handleEdit = async () => {
    if (!activeClip || !editPrompt.trim()) return;
    setIsProcessing(true);
    setStatus("Rendering Master Edit...");
    try {
      const res = await extendExistingVideo(activeClip, editPrompt, setStatus);
      setClips(prev => [res, ...prev]);
      setActiveClip(res);
      setEditPrompt('');
    } catch (err) {
      console.error(err);
      setStatus("Edit Error detected.");
    } finally {
      setIsProcessing(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-10 animate-in fade-in duration-1000">
      
      {/* Sidebar */}
      <div className="lg:col-span-3 space-y-8">
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-8 shadow-2xl">
          <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em] mb-6">Neural FX Profiles</h3>
          <div className="grid grid-cols-2 gap-4">
            {FX_SUITE.map(fx => (
              <button 
                key={fx.id}
                onClick={() => setSettings({...settings, profile: fx.id})}
                className={`flex flex-col items-center gap-4 p-5 rounded-3xl border-2 transition-all ${settings.profile === fx.id ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400' : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-stone-600'}`}
              >
                <span className="text-3xl">{fx.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-center">{fx.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-8 shadow-2xl overflow-hidden">
          <h3 className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em] mb-6">Timeline Assets</h3>
          <div className="flex lg:flex-col gap-6 overflow-x-auto pb-4">
            {clips.map(clip => (
              <div 
                key={clip.id}
                onClick={() => { setActiveClip(clip); setWorkspaceMode('edit'); }}
                className={`relative flex-shrink-0 w-56 lg:w-full aspect-video rounded-[2rem] overflow-hidden border-4 cursor-pointer transition-all ${activeClip?.id === clip.id ? 'border-emerald-500' : 'border-white/5 opacity-50'}`}
              >
                <video src={clip.url} className="w-full h-full object-cover" />
              </div>
            ))}
            {clips.length === 0 && (
              <div className="py-20 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center text-stone-800 uppercase tracking-widest text-[9px]">Awaiting First Render</div>
            )}
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="lg:col-span-9 space-y-10">
        <div className="bg-[#080808] rounded-[4.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="aspect-video bg-black relative flex items-center justify-center">
            {activeClip ? (
              <video ref={videoRef} src={activeClip.url} className="w-full h-full object-contain" controls autoPlay />
            ) : (
              <div className="text-center space-y-8">
                <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-5xl border border-white/10 mx-auto">🎬</div>
                <p className="text-stone-700 uppercase tracking-[0.6em] text-xs">Veridion Neural Engine V4.0</p>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-16 text-center">
                 <div className="w-24 h-24 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin mb-12"></div>
                 <p className="text-emerald-500 font-black uppercase tracking-[0.6em] animate-pulse text-lg">{status}</p>
              </div>
            )}
          </div>

          <div className="p-12 lg:p-20">
            {workspaceMode === 'create' ? (
              <div className="space-y-10">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your botanical scene (e.g., A golden hour macro of a monstera leaf...)"
                  className="w-full h-56 bg-[#0c0c0c] border border-white/5 rounded-[3rem] p-12 text-white text-3xl font-serif focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none placeholder:text-stone-900 leading-tight"
                />
                <button onClick={handleCreate} disabled={isProcessing || !prompt.trim()} className="w-full py-10 bg-emerald-600 text-white rounded-[3.5rem] font-black text-xl hover:bg-emerald-500 shadow-2xl transition-all uppercase tracking-[0.4em] disabled:opacity-20">
                  Initialize Render
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                <h4 className="text-2xl font-bold text-white font-serif">Apply Edit / Refinement</h4>
                <div className="flex gap-6">
                  <input 
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g., Add cinematic fog, zoom into the drops..."
                    className="flex-1 bg-[#0c0c0c] border border-white/5 rounded-3xl px-10 py-7 text-white text-xl"
                  />
                  <button onClick={handleEdit} disabled={isProcessing || !editPrompt.trim()} className="px-14 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-emerald-500">
                    Run Edit
                  </button>
                </div>
                <button onClick={() => setWorkspaceMode('create')} className="text-stone-600 hover:text-white uppercase tracking-widest text-[10px] font-bold">Start New Project</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
