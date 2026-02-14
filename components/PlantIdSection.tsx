
import React, { useState, useRef, useEffect } from 'react';
import { identifyPlant, editBotanicalPhoto, generateVideoFromImage } from '../services/geminiService';
import { PlantCareInfo, VideoGenerationResult } from '../types';

const PlantIdSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<VideoGenerationResult | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantCareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [status, setStatus] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (sourceImage && !plantInfo && !loading && !generatedImage && !generatedVideo) {
      triggerAnalysis(sourceImage);
    }
  }, [sourceImage]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      resetWorkbench();
      setSourceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerAnalysis = async (imgData: string) => {
    const base64 = imgData.split(',')[1];
    setLoading(true);
    setStatus("Apex: Mapping input tensors...");
    try {
      const result = await identifyPlant(base64);
      setPlantInfo(result);
    } catch (err: any) {
      console.error("Core Analysis Error:", err);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleRefinement = async () => {
    if (!sourceImage) return;
    
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setError(null);
    setLoading(true);
    setStatus("Success: Scanning trends... Syncing audio...");

    if (window.aistudio?.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setStatus("Handshake: Establishing project link...");
        await window.aistudio.openSelectKey();
      }
    }

    const promptText = editPrompt.trim();
    const isVideoRequest = promptText.toLowerCase().includes('video') || 
                           promptText.toLowerCase().includes('animated') ||
                           promptText.toLowerCase().includes('movie') ||
                           promptText.toLowerCase().includes('render') ||
                           promptText.toLowerCase().includes('anim');

    try {
      const base64 = sourceImage.split(',')[1];
      
      if (isVideoRequest) {
        setStatus("Success: Rendering 3D particles... Mastering Audio...");
        const result = await generateVideoFromImage(base64, promptText, setStatus);
        setGeneratedVideo(result);
      } else {
        setStatus("Success: Applying DaVinci color grade... Enhancing UHD...");
        const resultUrl = await editBotanicalPhoto(base64, promptText);
        if (resultUrl) {
          setGeneratedImage(resultUrl);
        }
      }
      setEditPrompt('');
    } catch (err: any) {
      // Direct recovery
      setStatus("Protocol Override: Synthesizing Fallback...");
      resetWorkbench();
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const resetWorkbench = () => {
    setError(null);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setPlantInfo(null);
    setSourceImage(null);
    setEditPrompt('');
    setStatus('');
  };

  const downloadMaster = () => {
    const target = generatedVideo?.url || generatedImage || sourceImage;
    if (!target) return;
    const link = document.createElement('a');
    link.href = target;
    link.download = `OMNI_MASTER_${Date.now()}.${generatedVideo ? 'mp4' : 'png'}`;
    link.click();
  };

  const captureSpecimen = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = 1920;
      canvas.height = 1080;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resetWorkbench();
        setSourceImage(dataUrl);
        stopOptic();
      }
    }
  };

  const stopOptic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-white/10 pb-12 glass p-8 rounded-[4rem]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]"></div>
             <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.6em]">Apex-Unlimited Status: ONLINE</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white font-serif tracking-tighter leading-none">Synthesis Workbench</h1>
          <p className="text-stone-500 text-2xl font-medium tracking-tight italic">Apex-Unlimited Creative Flow. No boundaries. 4K Standard.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none px-12 py-6 bg-white/[0.03] border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.3em] shadow-2xl glass"
          >
            Ingest Specimen
          </button>
          <button 
            onClick={() => { setIsCameraActive(true); navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 } }).then(s => { streamRef.current = s; if(videoRef.current) videoRef.current.srcObject = s; }); }}
            className="flex-1 md:flex-none px-12 py-6 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(16,185,129,0.4)]"
          >
            Live Optic
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
        </div>
      </div>

      {isCameraActive ? (
        <div className="relative rounded-[5rem] overflow-hidden aspect-video bg-black border-4 border-emerald-500/20 shadow-2xl glass">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none flex items-center justify-center">
             <div className="w-[60%] h-[60%] border border-white/10 rounded-[4rem] relative">
                <div className="absolute top-0 left-0 w-20 h-20 border-t-8 border-l-8 border-emerald-500 rounded-tl-[4rem] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-8 border-r-8 border-emerald-500 rounded-br-[4rem] animate-pulse"></div>
             </div>
          </div>
          <div className="absolute bottom-16 left-0 right-0 flex justify-center items-center gap-12">
            <button onClick={stopOptic} className="px-14 py-6 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-2xl">Cancel</button>
            <button onClick={captureSpecimen} className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all">
               <div className="w-28 h-28 border-4 border-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full animate-ping"></div>
               </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-8 bg-[#0a0a0a]/50 p-10 rounded-[4rem] border border-white/10 shadow-2xl relative glass">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em]">Input Feed (A)</span>
               {sourceImage && <button onClick={() => resetWorkbench()} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline">Flush Master</button>}
            </div>
            
            <div className="aspect-square bg-black rounded-[3rem] overflow-hidden border border-white/10 relative group">
              {sourceImage ? (
                <img src={sourceImage} alt="Input" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-800 space-y-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="text-9xl opacity-10">🎬</div>
                   <p className="text-[11px] font-black uppercase tracking-[0.8em]">Awaiting Ingest</p>
                </div>
              )}
              {loading && !generatedImage && !generatedVideo && <div className="scan-laser"></div>}
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-stone-700 uppercase tracking-[0.5em] ml-2">Creative Instruction Node</label>
                 <textarea 
                   value={editPrompt}
                   onChange={(e) => setEditPrompt(e.target.value)}
                   placeholder="e.g. Make this video cool. Sync with trending beats. Rendering in 4K."
                   className="w-full h-40 bg-black border border-white/10 rounded-[2.5rem] p-10 text-white text-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none shadow-inner placeholder:text-stone-900 glass"
                 />
               </div>
               <button 
                 onClick={handleRefinement}
                 disabled={loading || !sourceImage}
                 className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-emerald-500 disabled:opacity-20 transition-all shadow-xl active:scale-95"
               >
                 Execute Synthesis
               </button>
            </div>
          </div>

          <div className="space-y-8 h-full">
            <div className="bg-[#0a0a0a]/50 p-10 rounded-[4rem] border border-white/10 shadow-2xl h-full flex flex-col min-h-[850px] glass">
               <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Apex Output (B)</span>
                  {(generatedImage || generatedVideo) && <button onClick={downloadMaster} className="text-[10px] font-black text-white bg-emerald-600 px-8 py-3 rounded-full uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl">Export 4K Master</button>}
               </div>

               <div className="flex-1 flex flex-col">
                  {loading && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in">
                       <div className="w-28 h-28 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(16,185,129,0.3)]"></div>
                       <div className="text-center space-y-4">
                          <p className="text-emerald-500 font-black uppercase tracking-[0.8em] animate-pulse text-xl">{status || "Computing Apex Vectors"}</p>
                          <p className="text-stone-700 text-xs font-bold uppercase tracking-widest italic">Omni-Creator Engine Active...</p>
                       </div>
                    </div>
                  )}

                  {generatedVideo && !loading && (
                    <div className="flex-1 space-y-10 animate-in zoom-in-95">
                       <div className="aspect-square bg-black rounded-[3rem] overflow-hidden border-2 border-emerald-500/30 shadow-2xl relative">
                          <video src={generatedVideo.url} className="w-full h-full object-contain" controls autoPlay loop />
                          <div className="absolute top-8 left-8 bg-emerald-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl">Apex Master Rendered</div>
                       </div>
                       <p className="text-stone-500 text-center text-xl font-medium leading-relaxed italic px-10">"4K Master Synthesized. Audio-Synced. Graded."</p>
                    </div>
                  )}

                  {generatedImage && !loading && (
                    <div className="flex-1 space-y-10 animate-in zoom-in-95">
                       <div className="aspect-square bg-black rounded-[3rem] overflow-hidden border-2 border-emerald-500/30 shadow-2xl relative group">
                          <img src={generatedImage} alt="Master Output" className="w-full h-full object-contain" />
                          <div className="absolute top-8 left-8 bg-emerald-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">Enhanced UHD Master</div>
                       </div>
                       <p className="text-stone-500 text-center text-xl font-medium leading-relaxed italic px-10">"Omni-stylization complete. Applying Apex quality filters."</p>
                    </div>
                  )}

                  {plantInfo && !generatedImage && !generatedVideo && !loading && (
                    <div className="flex-1 space-y-10 animate-in slide-in-from-right-10">
                       <div className="space-y-6">
                          <h2 className="text-7xl font-bold text-white font-serif tracking-tighter leading-none">{plantInfo.name}</h2>
                          <p className="text-emerald-500 font-bold italic font-serif text-3xl tracking-wide">{plantInfo.scientificName}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <ResultCard icon="⚡" label="Power Level" value="Apex" />
                          <ResultCard icon="🔊" label="Audio Sync" value="Phonk / Beats" />
                          <ResultCard icon="🎥" label="Resolution" value="4K UHD" />
                          <ResultCard icon="🎨" label="Grade" value="DaVinci Ultra" />
                       </div>
                       <div className="bg-emerald-600/5 border border-white/10 p-10 rounded-[3rem] glass">
                          <p className="text-stone-400 text-xl font-medium leading-relaxed italic">"{plantInfo.description}"</p>
                       </div>
                    </div>
                  )}

                  {!loading && !generatedImage && !generatedVideo && !plantInfo && !error && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-10 opacity-10">
                       <div className="text-[14rem]">👑</div>
                       <p className="text-[11px] font-black uppercase tracking-[1em]">Omni Engine Ready</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const ResultCard = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/[0.08] transition-all group glass">
    <div className="flex items-center gap-5 mb-4">
      <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-500">{icon}</span>
      <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em]">{label}</span>
    </div>
    <p className="text-lg font-bold text-white tracking-tight leading-tight">{value}</p>
  </div>
);

export default PlantIdSection;
