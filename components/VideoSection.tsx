
import React, { useState, useEffect, useRef } from 'react';
import { generateGardeningVideo } from '../services/geminiService';
import { VideoGenerationResult, VideoTemplate, BackgroundAudio } from '../types';

const PRO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'commercial',
    title: 'Botanical Ad',
    description: 'High-energy, professional product commercial style.',
    prompt: 'A vibrant commercial for an organic plant nursery, fast-paced cuts of blooming flowers, slow motion watering, bright morning sun, luxury garden aesthetic.',
    previewEmoji: '📽️'
  },
  {
    id: '3d-anim',
    title: '3D Growth',
    description: 'Hyper-realistic 3D animation of growth cycles.',
    prompt: 'A hyper-realistic 3D render of a Monstera leaf unfurling in time-lapse, clean white background, studio lighting, unreal engine 5 style, extreme detail.',
    previewEmoji: '💎'
  },
  {
    id: 'docu',
    title: 'Nature Documentary',
    description: 'Breathtaking drone shots and macro cinematography.',
    prompt: 'A cinematic drone sweep over a lush misty terraced garden at sunrise, National Geographic style, soft fog, deep greens, majestic and calm.',
    previewEmoji: '🦅'
  },
  {
    id: 'minimal',
    title: 'Minimalist Promo',
    description: 'Geometric layouts and soft architectural shadows.',
    prompt: 'Architectural shot of minimalist succulents on a concrete ledge, harsh sunlight creating sharp geometric shadows, modern interior design vibe, high contrast.',
    previewEmoji: '🔳'
  }
];

const AUDIO_TRACKS: BackgroundAudio[] = [
  { id: 'birds', name: 'Morning Birdsong', category: 'Ambient', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_34d36f33e5.mp3?filename=nature-birds-morning-6240.mp3' },
  { id: 'rain', name: 'Gentle Greenhouse Rain', category: 'Nature', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_655909240a.mp3?filename=gentle-rain-loop-14068.mp3' },
  { id: 'zen', name: 'Zen Garden', category: 'Music', url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_67b3607490.mp3?filename=zen-garden-1621.mp3' },
  { id: 'lofi', name: 'Garden Lofi', category: 'Music', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808d30483.mp3?filename=lofi-study-112191.mp3' }
];

const VideoSection: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [videoResult, setVideoResult] = useState<VideoGenerationResult | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio State
  const [selectedAudio, setSelectedAudio] = useState<BackgroundAudio | null>(AUDIO_TRACKS[0]);
  const [bgVolume, setBgVolume] = useState(0.4);
  const [videoVolume, setVideoVolume] = useState(1.0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    window.aistudio.hasSelectedApiKey().then(setHasKey);
  }, []);

  // Sync background audio with video playback
  useEffect(() => {
    if (videoResult && audioRef.current && videoRef.current) {
      const v = videoRef.current;
      const a = audioRef.current;
      
      const onPlay = () => a.play();
      const onPause = () => a.pause();
      const onSeek = () => { a.currentTime = v.currentTime % (a.duration || 1); };

      v.addEventListener('play', onPlay);
      v.addEventListener('pause', onPause);
      v.addEventListener('seeking', onSeek);

      return () => {
        v.removeEventListener('play', onPlay);
        v.removeEventListener('pause', onPause);
        v.removeEventListener('seeking', onSeek);
      };
    }
  }, [videoResult]);

  // Fix: Property 'volume' does not exist on audio element in JSX.
  // Using useEffect to set volume on the DOM element instead to ensure reactivity to slider changes.
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = bgVolume;
    }
  }, [bgVolume]);

  const handleOpenKey = async () => {
    await window.aistudio.openSelectKey();
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    setVideoResult(null);
    
    // Auto-editor: Inject audio mood into prompt
    const audioContextPrompt = selectedAudio 
      ? ` The video should perfectly match the rhythm and mood of ${selectedAudio.name} (${selectedAudio.category}).` 
      : "";

    try {
      const result = await generateGardeningVideo(prompt + audioContextPrompt, resolution, setStatus);
      setVideoResult(result);
    } catch (err: any) {
      setError("The production studio is busy. Please re-select your key or try again.");
      setHasKey(false);
    } finally {
      setGenerating(false);
      setStatus('');
    }
  };

  if (!hasKey) {
    return (
      <div className="max-w-2xl mx-auto bg-stone-900 text-white rounded-[3rem] p-16 text-center space-y-8 shadow-2xl border border-stone-800">
        <div className="w-24 h-24 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto text-white text-5xl shadow-emerald-500/20 shadow-2xl animate-pulse">🎬</div>
        <div className="space-y-4">
          <h2 className="text-4xl font-bold font-serif">Pro Studio Access</h2>
          <p className="text-stone-400 max-w-sm mx-auto">Generate 4K gardening commercials and cinematic 3D animations with your Studio Key.</p>
        </div>
        <button onClick={handleOpenKey} className="bg-white text-black px-10 py-5 rounded-2xl font-bold hover:bg-stone-200 transition-all shadow-xl">Connect Studio Key</button>
        <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Powered by Veo 3.1 & Gemini 3 Pro</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Fix: removed non-existent volume prop, volume is now handled via useEffect */}
      <audio ref={audioRef} src={selectedAudio?.url} loop />
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-stone-900 font-serif">Botanical Production Studio</h1>
          <p className="text-stone-500">Automated 4K cinematography & audio mixing. No manual editing required.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-stone-200 gap-1 shadow-sm">
          {(['720p', '1080p'] as const).map(res => (
            <button 
              key={res} 
              onClick={() => setResolution(res)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${resolution === res ? 'bg-emerald-600 text-white shadow-lg' : 'text-stone-500 hover:bg-stone-50'}`}
            >
              {res === '1080p' ? 'Ultra HD (4K Style)' : 'Standard HD'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Column: Templates & Audio Selection */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-2">Cinematic Style</h3>
            <div className="grid grid-cols-1 gap-3">
              {PRO_TEMPLATES.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setPrompt(t.prompt)}
                  className={`group text-left p-4 rounded-2xl bg-white border transition-all ${prompt === t.prompt ? 'border-emerald-500 shadow-lg shadow-emerald-50' : 'border-stone-100 hover:border-emerald-200'}`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{t.previewEmoji}</span>
                    <div className="font-bold text-sm text-stone-900">{t.title}</div>
                  </div>
                  <p className="text-[10px] text-stone-400 leading-relaxed line-clamp-1">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-2">Audio Mix</h3>
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-6">
              <div className="space-y-4">
                {AUDIO_TRACKS.map(track => (
                  <button 
                    key={track.id}
                    onClick={() => setSelectedAudio(track)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedAudio?.id === track.id ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-stone-50 border-stone-100 text-stone-500 hover:bg-stone-100'}`}
                  >
                    <div className="text-left">
                      <div className="text-[10px] font-bold">{track.name}</div>
                      <div className="text-[8px] opacity-60 uppercase">{track.category}</div>
                    </div>
                    {selectedAudio?.id === track.id && <span className="text-emerald-500">🔊</span>}
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-bold text-stone-400 uppercase tracking-widest">
                    <span>Background Volume</span>
                    <span className="text-emerald-600">{Math.round(bgVolume * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={bgVolume} onChange={(e) => setBgVolume(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1 bg-stone-100 rounded-full appearance-none cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-bold text-stone-400 uppercase tracking-widest">
                    <span>Scene Audio Volume</span>
                    <span className="text-emerald-600">{Math.round(videoVolume * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.01" 
                    value={videoVolume} onChange={(e) => setVideoVolume(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1 bg-stone-100 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prompting & Results */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Cinematic Script</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your scene... e.g., A macro shot of a blooming cactus under desert moonlight."
                className="w-full h-40 bg-stone-50 border border-stone-100 rounded-3xl p-6 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none text-lg shadow-inner"
              />
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full bg-stone-900 text-white py-6 rounded-[2rem] font-bold text-xl hover:bg-black disabled:opacity-50 transition-all shadow-2xl flex items-center justify-center gap-4 group"
            >
              {generating ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{status}</span>
                </>
              ) : (
                <>
                  <span>Produce Automated Master</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
            {error && <p className="text-center text-red-500 text-xs font-bold">{error}</p>}
          </div>

          {videoResult && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
              <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-stone-200 relative group">
                <video 
                  ref={videoRef} 
                  src={videoResult.url} 
                  controls 
                  className="w-full aspect-video" 
                  autoPlay 
                  style={{ opacity: 1 }}
                  onPlay={() => {
                    if(audioRef.current) {
                      audioRef.current.volume = bgVolume;
                      audioRef.current.play();
                    }
                  }}
                  onVolumeChange={(e) => {
                    setVideoVolume((e.target as HTMLVideoElement).volume);
                  }}
                />
                <div className="absolute top-6 right-6 px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-xl">
                  {resolution} Cinematic Master
                </div>
              </div>
              <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border border-stone-100 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl">🎬</div>
                  <div>
                    <h4 className="font-bold text-stone-900">Scene Ready for Release</h4>
                    <p className="text-xs text-stone-400 uppercase font-bold tracking-tighter">AI-Mixed with {selectedAudio?.name}</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <a 
                    href={videoResult.url} 
                    download="SageAndSoil_Master.mp4"
                    className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Master
                  </a>
                  <button 
                    onClick={() => {
                      if(videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play();
                      }
                    }}
                    className="p-4 bg-stone-100 text-stone-600 rounded-2xl hover:bg-stone-200 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoSection;
