
import React, { useState, useEffect, useRef } from 'react';
import { generateGardeningVideo } from '../services/geminiService';
import { VideoGenerationResult, VideoTemplate } from '../types';

const PRO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'commercial',
    title: 'Ad Master',
    description: 'High-energy cinematic commercial.',
    prompt: 'A premium 4K commercial for high-end botany, fast cuts, morning dew on leaves, soft focus sunlight, high dynamic range, Arri Alexa style.',
    previewEmoji: '📽️'
  },
  {
    id: '3d-growth',
    title: 'Neural Growth',
    description: '3D Growth time-lapse simulation.',
    prompt: 'Hyper-realistic 3D render of a rare fern unfurling in time-lapse, studio black background, vibrant bioluminescence, Unreal Engine 5 style.',
    previewEmoji: '💎'
  },
  {
    id: 'drone',
    title: 'Aerial Suite',
    description: 'Breathtaking drone cinematography.',
    prompt: 'Cinematic drone sweep over a lush rain forest at dawn, deep greens, misty atmosphere, epic lighting, 4K resolution.',
    previewEmoji: '🦅'
  }
];

const VideoSection: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [videoResult, setVideoResult] = useState<VideoGenerationResult | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    window.aistudio.hasSelectedApiKey().then(setHasKey);
  }, []);

  // Simulate granular progress based on status updates
  useEffect(() => {
    if (generating) {
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + Math.random() * 2 : prev));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [generating]);

  const handleOpenKey = async () => {
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    setVideoResult(null);
    setProgress(5);
    
    try {
      const result = await generateGardeningVideo(prompt, resolution, setStatus);
      setVideoResult(result);
      setProgress(100);
    } catch (err: any) {
      setError("Production node busy or API handshake failed. Re-verify Studio Key.");
      setHasKey(false);
    } finally {
      setGenerating(false);
      setStatus('');
    }
  };

  const downloadVideo = () => {
    if (videoResult) {
      const link = document.createElement('a');
      link.href = videoResult.url;
      link.download = `Veridion_Master_${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!hasKey) {
    return (
      <div className="max-w-2xl mx-auto bg-[#0a0a0a] rounded-[3rem] p-20 text-center space-y-10 shadow-2xl border border-white/5 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto text-white text-6xl shadow-[0_0_80px_rgba(5,150,105,0.3)] animate-pulse">🎬</div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold font-serif tracking-tight">Production Access Locked</h2>
          <p className="text-stone-500 text-lg leading-relaxed">Connect your professional Studio Key to access the Veo 3.1 Neural Production suite.</p>
        </div>
        <button onClick={handleOpenKey} className="w-full bg-white text-black py-5 rounded-2xl font-bold text-lg hover:bg-stone-200 transition-all shadow-xl tracking-widest uppercase">Connect Neural Node</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-white font-serif tracking-tight leading-none">Cinematography Hub</h1>
          <p className="text-stone-500 text-lg">Automated 4K botanical video production system.</p>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 gap-1 shadow-2xl">
          {(['720p', '1080p'] as const).map(res => (
            <button 
              key={res} 
              onClick={() => setResolution(res)}
              className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${resolution === res ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'}`}
            >
              {res} Master
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-4">Studio Templates</h3>
          <div className="space-y-4">
            {PRO_TEMPLATES.map(t => (
              <button 
                key={t.id} 
                onClick={() => setPrompt(t.prompt)}
                className={`w-full text-left p-6 rounded-[2rem] bg-white/[0.02] border transition-all group ${prompt === t.prompt ? 'border-emerald-500 bg-emerald-500/5 shadow-2xl' : 'border-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-3xl group-hover:scale-110 transition-transform">{t.previewEmoji}</span>
                  <div className="font-bold text-sm text-white tracking-tight">{t.title}</div>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0a0a0a] rounded-[3rem] p-10 border border-white/5 shadow-2xl space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Neural Prompt Interface</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the cinematic botanical scene..."
                className="w-full h-48 bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none text-xl font-medium tracking-tight placeholder:text-stone-800"
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-bold text-xl hover:bg-emerald-500 disabled:opacity-20 transition-all shadow-2xl shadow-emerald-950/50 flex items-center justify-center gap-4 group"
            >
              {generating ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="tracking-widest uppercase text-xs">{status || "Processing"}</span>
                  </div>
                </div>
              ) : (
                <>
                  <span>Initialize 4K Production</span>
                  <svg className="h-6 w-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
            
            {generating && (
              <div className="space-y-2 animate-in fade-in duration-500">
                 <div className="flex justify-between text-[9px] font-bold text-stone-600 uppercase tracking-[0.2em]">
                    <span>Neural Rendering Progress</span>
                    <span>{Math.round(progress)}%</span>
                 </div>
                 <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                 </div>
              </div>
            )}
            
            {error && <p className="text-center text-red-500 text-[10px] font-bold uppercase tracking-widest">{error}</p>}
          </div>

          {videoResult && (
            <div className="animate-in slide-in-from-bottom-12 duration-1000 space-y-6">
              <div className="bg-black rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 relative group aspect-video">
                <video 
                  ref={videoRef} 
                  src={videoResult.url} 
                  controls 
                  className="w-full h-full object-cover" 
                  autoPlay 
                />
                <div className="absolute top-8 right-8 px-5 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-[0.3em] shadow-2xl">
                  {resolution} Master
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <button 
                  onClick={downloadVideo}
                  className="flex-1 bg-white text-black py-5 rounded-2xl font-bold hover:bg-stone-200 transition-all shadow-xl flex items-center justify-center gap-4 text-sm uppercase tracking-widest"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export Master 4K
                </button>
                <button 
                  onClick={() => setVideoResult(null)}
                  className="px-10 py-5 bg-white/5 border border-white/10 text-stone-400 rounded-2xl font-bold hover:bg-white/10 hover:text-white transition-all text-sm uppercase tracking-widest"
                >
                  Clear Studio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
