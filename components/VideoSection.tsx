
import React, { useState, useEffect, useRef } from 'react';
import { generateGardeningVideo, extendExistingVideo } from '../services/geminiService';
import { VideoGenerationResult, ProductionSettings, CinematicProfile } from '../types';

const PRO_TEMPLATES = [
  { id: 'lux', title: 'Luxury Ad', prompt: 'Cinematic 4K close-up of expensive rare plants, soft morning light, water droplets, luxury aesthetic, Arri Alexa.', emoji: '✨' },
  { id: 'macro', title: 'Macro Growth', prompt: 'Hyper-realistic macro time-lapse of a budding flower opening, extreme detail, studio lighting, black background.', emoji: '🔍' },
  { id: 'aerial', title: 'Aerial Estate', prompt: 'Drone sweep over a perfectly manicured botanical garden at sunrise, 4K, misty mountain background.', emoji: '🚁' }
];

const VideoSection: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [settings, setSettings] = useState<ProductionSettings>({
    profile: 'standard',
    framerate: 24,
    resolution: '1080p',
    aspectRatio: '16:9'
  });
  
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [timeline, setTimeline] = useState<VideoGenerationResult[]>([]);
  const [selectedClip, setSelectedClip] = useState<VideoGenerationResult | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

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
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
      setStatus('');
    }
  };

  const handleExtend = async () => {
    if (!selectedClip || !prompt.trim()) return;
    setIsExtending(true);
    setGenerating(true);
    try {
      const result = await extendExistingVideo(selectedClip, prompt, setStatus);
      setTimeline(prev => [result, ...prev]);
      setSelectedClip(result);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
      setIsExtending(false);
      setStatus('');
    }
  };

  const downloadClip = (clip: VideoGenerationResult) => {
    const link = document.createElement('a');
    link.href = clip.url;
    link.download = `Veridion_Production_${clip.id}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto py-32 text-center space-y-12">
        <div className="w-32 h-32 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto text-white text-5xl shadow-2xl animate-pulse">🎬</div>
        <div className="space-y-4">
          <h2 className="text-5xl font-bold font-serif">Production Access Restricted</h2>
          <p className="text-stone-500 text-xl max-w-lg mx-auto">Connect your professional Studio Key to initialize the Veo 3.1 Neural Production Suite.</p>
        </div>
        <button onClick={handleOpenKey} className="px-12 py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-stone-200 transition-all shadow-2xl tracking-widest uppercase">Connect Studio</button>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-8 animate-in fade-in duration-1000">
      
      {/* Sidebar: Assets & Templates */}
      <div className="lg:col-span-3 space-y-8 h-[calc(100vh-12rem)] overflow-y-auto pr-4">
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Production Templates</h3>
          <div className="space-y-3">
            {PRO_TEMPLATES.map(t => (
              <button 
                key={t.id} 
                onClick={() => setPrompt(t.prompt)}
                className={`w-full text-left p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all group ${prompt === t.prompt ? 'bg-emerald-500/5 border-emerald-500/50' : ''}`}
              >
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{t.emoji}</span>
                  <div className="font-bold text-sm text-white">{t.title}</div>
                </div>
                <p className="text-[10px] text-stone-500 leading-relaxed line-clamp-2">{t.prompt}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Master Timeline</h3>
          <div className="space-y-4">
            {timeline.map(clip => (
              <div 
                key={clip.id} 
                onClick={() => setSelectedClip(clip)}
                className={`relative rounded-3xl overflow-hidden aspect-video border-2 cursor-pointer transition-all ${selectedClip?.id === clip.id ? 'border-emerald-500 shadow-2xl scale-[1.02]' : 'border-white/5 grayscale opacity-50'}`}
              >
                <video src={clip.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                  <div className="text-[8px] font-bold text-white uppercase tracking-widest">Clip {clip.id}</div>
                  <div className="text-[8px] text-emerald-400 font-bold">{clip.resolution} • 24fps</div>
                </div>
              </div>
            ))}
            {timeline.length === 0 && (
              <div className="py-20 border border-dashed border-white/5 rounded-[2rem] text-center text-[10px] font-bold text-stone-800 uppercase tracking-widest">Timeline Empty</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Edit Suite */}
      <div className="lg:col-span-9 space-y-8">
        <div className="bg-[#080808] rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
          {/* Main Monitor */}
          <div className="aspect-video bg-black relative group">
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
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl animate-pulse">🎬</div>
                <p className="text-stone-700 font-bold uppercase tracking-[0.5em] text-[10px]">Awaiting Master Ingestion</p>
              </div>
            )}
            {generating && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
                 <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                 <div className="text-center space-y-2">
                    <p className="text-emerald-500 font-bold uppercase tracking-[0.4em] animate-pulse">{status}</p>
                    <p className="text-[10px] text-stone-600 uppercase tracking-widest">Neural Cluster ID: VEO-3.1-NODE-04</p>
                 </div>
              </div>
            )}
          </div>

          {/* Editor Controls */}
          <div className="p-10 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="flex-1 space-y-3 w-full">
                <label className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.4em] ml-2">Neural Production Script</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the scene or editing instruction..."
                  className="w-full h-32 bg-white/[0.03] border border-white/5 rounded-[2rem] p-8 text-white text-xl font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none placeholder:text-stone-800"
                />
              </div>
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <button 
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="px-12 py-6 bg-emerald-600 text-white rounded-[2rem] font-bold text-lg hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-950/50 flex items-center justify-center gap-4 disabled:opacity-20"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Produce Master
                </button>
                {selectedClip && (
                  <button 
                    onClick={handleExtend}
                    disabled={generating || !prompt.trim()}
                    className="px-12 py-6 bg-white/5 border border-white/10 text-white rounded-[2rem] font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-4 disabled:opacity-20"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Extend (+7s)
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-8 pt-8 border-t border-white/5">
              <SettingSelector 
                label="Cinematic Profile"
                value={settings.profile}
                options={['standard', 'log-c', 'raw', 'hdr']}
                onChange={(val) => setSettings({...settings, profile: val as CinematicProfile})}
              />
              <SettingSelector 
                label="Aspect Ratio"
                value={settings.aspectRatio}
                options={['16:9', '9:16']}
                onChange={(val) => setSettings({...settings, aspectRatio: val as '16:9' | '9:16'})}
              />
              <SettingSelector 
                label="Quality Target"
                value={settings.resolution}
                options={['720p', '1080p']}
                onChange={(val) => setSettings({...settings, resolution: val as '720p' | '1080p'})}
              />
              <div className="space-y-4">
                 <label className="text-[10px] font-bold text-stone-700 uppercase tracking-widest ml-1">Export Mode</label>
                 <button 
                  disabled={!selectedClip}
                  onClick={() => selectedClip && downloadClip(selectedClip)}
                  className="w-full py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-stone-200 transition-all disabled:opacity-10"
                 >
                   Export Master 4K
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingSelector = ({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) => (
  <div className="space-y-4">
    <label className="text-[10px] font-bold text-stone-700 uppercase tracking-widest ml-1">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button 
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${value === opt ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/5 text-stone-500 hover:text-stone-300'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export default VideoSection;
