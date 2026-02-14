
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
      setSourceImage(reader.result as string);
      setGeneratedImage(null);
      setGeneratedVideo(null);
      setPlantInfo(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerAnalysis = async (imgData: string) => {
    const base64 = imgData.split(',')[1];
    setLoading(true);
    setStatus("Analyzing botanical signature...");
    try {
      const result = await identifyPlant(base64);
      if (result && result.isBotanical !== false) {
        setPlantInfo(result);
      }
    } catch (err: any) {
      console.error("Analysis Error:", err);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleRefinement = async () => {
    if (!sourceImage || !editPrompt.trim()) return;
    
    // Check key selection first
    const hasKey = await window.aistudio?.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio?.openSelectKey();
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setStatus("Syncing with Production Node...");

    const isVideoRequest = editPrompt.toLowerCase().includes('video') || 
                           editPrompt.toLowerCase().includes('animated') ||
                           editPrompt.toLowerCase().includes('movie') ||
                           editPrompt.toLowerCase().includes('render');

    try {
      const base64 = sourceImage.split(',')[1];
      
      if (isVideoRequest) {
        setStatus("Initializing Video Master...");
        const result = await generateVideoFromImage(base64, editPrompt, setStatus);
        setGeneratedVideo(result);
      } else {
        setStatus("Processing Neural Edit...");
        const resultUrl = await editBotanicalPhoto(base64, editPrompt);
        if (resultUrl) {
          setGeneratedImage(resultUrl);
        } else {
          throw new Error("Neural output was empty. Please re-initiate.");
        }
      }
      setEditPrompt('');
    } catch (err: any) {
      console.error("Neural Error Details:", err);
      let errorMsg = "Neural Conflict. The production node failed to process the request.";
      
      if (err.message?.includes("entity was not found") || err.message?.includes("403")) {
        errorMsg = "Authorization Conflict. Please select your API project to continue production.";
      } else if (err.message?.includes("payload") || err.message?.includes("large")) {
        errorMsg = "Payload Latency. The captured image is too large for the current buffer. Try capturing again.";
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const resetState = () => {
    setError(null);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    setPlantInfo(null);
    setSourceImage(null);
    setEditPrompt('');
  };

  const downloadResult = () => {
    const target = generatedVideo?.url || generatedImage || sourceImage;
    if (!target) return;
    const link = document.createElement('a');
    link.href = target;
    link.download = `VERIDION_MASTER_${Date.now()}.${generatedVideo ? 'mp4' : 'png'}`;
    link.click();
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // High Fidelity capture optimized for payload reliability
      canvas.width = 1280;
      canvas.height = 720;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSourceImage(dataUrl);
        setGeneratedImage(null);
        setGeneratedVideo(null);
        setPlantInfo(null);
        setError(null);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]"></div>
             <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.6em]">Neural Mastering Engine V5.0-CINEMA</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white font-serif tracking-tighter leading-none">Neural Workbench</h1>
          <p className="text-stone-500 text-2xl font-medium tracking-tight">AI Cinematic Rendering and Technical Botanical Forensics.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none px-12 py-6 bg-white/[0.03] border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.3em] shadow-2xl"
          >
            Ingest Specimen
          </button>
          <button 
            onClick={() => { setIsCameraActive(true); navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } }).then(s => { streamRef.current = s; if(videoRef.current) videoRef.current.srcObject = s; }); }}
            className="flex-1 md:flex-none px-12 py-6 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(16,185,129,0.4)]"
          >
            Live Optic
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
        </div>
      </div>

      {isCameraActive ? (
        <div className="relative rounded-[5rem] overflow-hidden aspect-video bg-black border-4 border-emerald-500/20 shadow-2xl">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none flex items-center justify-center">
             <div className="w-[60%] h-[60%] border border-white/10 rounded-[4rem] relative">
                <div className="absolute top-0 left-0 w-20 h-20 border-t-8 border-l-8 border-emerald-500 rounded-tl-[4rem] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-8 border-r-8 border-emerald-500 rounded-br-[4rem] animate-pulse"></div>
             </div>
          </div>
          <div className="absolute bottom-16 left-0 right-0 flex justify-center items-center gap-12">
            <button onClick={stopCamera} className="px-14 py-6 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-2xl">Cancel</button>
            <button onClick={capture} className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all">
               <div className="w-28 h-28 border-4 border-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full animate-ping"></div>
               </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* MONITOR A */}
          <div className="space-y-8 bg-[#0a0a0a] p-10 rounded-[4rem] border border-white/5 shadow-2xl relative">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em]">Input Feed (A)</span>
               {sourceImage && <button onClick={() => resetState()} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline">Flush Stream</button>}
            </div>
            
            <div className="aspect-square bg-black rounded-[3rem] overflow-hidden border border-white/10 relative group">
              {sourceImage ? (
                <img src={sourceImage} alt="Input" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-800 space-y-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="text-9xl opacity-10">🔬</div>
                   <p className="text-[11px] font-black uppercase tracking-[0.8em]">Awaiting Data Feed</p>
                </div>
              )}
              {loading && !generatedImage && !generatedVideo && <div className="scan-laser"></div>}
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-stone-700 uppercase tracking-[0.5em] ml-2">Neural Refinement Prompt</label>
                 <textarea 
                   value={editPrompt}
                   onChange={(e) => setEditPrompt(e.target.value)}
                   placeholder="E.g. Generate a high-definition 3D animated video of this plant..."
                   className="w-full h-40 bg-black border border-white/10 rounded-[2.5rem] p-10 text-white text-xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none shadow-inner placeholder:text-stone-900"
                 />
               </div>
               <button 
                 onClick={handleRefinement}
                 disabled={loading || !sourceImage || !editPrompt.trim()}
                 className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-emerald-500 disabled:opacity-20 transition-all shadow-xl active:scale-95"
               >
                 Apply Neural Edit
               </button>
            </div>
          </div>

          {/* MONITOR B */}
          <div className="space-y-8 h-full">
            <div className="bg-[#0a0a0a] p-10 rounded-[4rem] border border-white/5 shadow-2xl h-full flex flex-col min-h-[850px]">
               <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Output Master (B)</span>
                  {(generatedImage || generatedVideo) && <button onClick={downloadResult} className="text-[10px] font-black text-white bg-emerald-600 px-8 py-3 rounded-full uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl">Export Output</button>}
               </div>

               <div className="flex-1 flex flex-col">
                  {loading && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in">
                       <div className="w-28 h-28 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(16,185,129,0.3)]"></div>
                       <div className="text-center space-y-4">
                          <p className="text-emerald-500 font-black uppercase tracking-[0.8em] animate-pulse text-xl">{status || "Neural Compute In Progress"}</p>
                          <p className="text-stone-700 text-xs font-bold uppercase tracking-widest">Mastering Cinematic Protocol...</p>
                       </div>
                    </div>
                  )}

                  {generatedVideo && !loading && (
                    <div className="flex-1 space-y-10 animate-in zoom-in-95">
                       <div className="aspect-square bg-black rounded-[3rem] overflow-hidden border-2 border-emerald-500/30 shadow-2xl relative">
                          <video src={generatedVideo.url} className="w-full h-full object-contain" controls autoPlay loop />
                          <div className="absolute top-8 left-8 bg-emerald-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl">Video Master Rendered</div>
                       </div>
                       <p className="text-stone-500 text-center text-xl font-medium leading-relaxed italic px-10">"Cinema sequence synthesized. Style: {generatedVideo.prompt}"</p>
                    </div>
                  )}

                  {generatedImage && !loading && (
                    <div className="flex-1 space-y-10 animate-in zoom-in-95">
                       <div className="aspect-square bg-black rounded-[3rem] overflow-hidden border-2 border-emerald-500/30 shadow-2xl relative group">
                          <img src={generatedImage} alt="Master Output" className="w-full h-full object-contain" />
                          <div className="absolute top-8 left-8 bg-emerald-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest">Stylized Master Ready</div>
                       </div>
                       <p className="text-stone-500 text-center text-xl font-medium leading-relaxed italic px-10">"High-fidelity stylization complete. Specimen aesthetic optimized."</p>
                    </div>
                  )}

                  {plantInfo && !generatedImage && !generatedVideo && !loading && (
                    <div className="flex-1 space-y-10 animate-in slide-in-from-right-10">
                       <div className="space-y-6">
                          <h2 className="text-7xl font-bold text-white font-serif tracking-tighter leading-none">{plantInfo.name}</h2>
                          <p className="text-emerald-500 font-bold italic font-serif text-3xl tracking-wide">{plantInfo.scientificName}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <ResultCard icon="💧" label="Watering" value={plantInfo.care.watering} />
                          <ResultCard icon="☀️" label="Sunlight" value={plantInfo.care.sunlight} />
                          <ResultCard icon="🌡️" label="Temperature" value={plantInfo.care.temperature} />
                          <ResultCard icon="🌱" label="Substrate" value={plantInfo.care.soil} />
                       </div>
                       <div className="bg-emerald-600/5 border border-emerald-500/10 p-10 rounded-[3rem]">
                          <p className="text-stone-400 text-xl font-medium leading-relaxed italic">"{plantInfo.description}"</p>
                       </div>
                    </div>
                  )}

                  {error && !loading && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-10 bg-red-500/5 rounded-[4rem] border border-red-500/20 p-16 text-center animate-in zoom-in-95">
                       <div className="text-8xl">⚠️</div>
                       <div className="space-y-4">
                          <h3 className="text-4xl font-bold text-red-500 font-serif">Neural Conflict</h3>
                          <p className="text-stone-400 text-xl font-medium leading-relaxed">{error}</p>
                       </div>
                       <button onClick={() => {setError(null); resetState();}} className="text-[11px] font-black uppercase tracking-[0.5em] text-white px-12 py-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all shadow-2xl">Re-initiate Cluster</button>
                    </div>
                  )}

                  {!loading && !generatedImage && !generatedVideo && !plantInfo && !error && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-10 opacity-10">
                       <div className="text-[14rem]">🌿</div>
                       <p className="text-[11px] font-black uppercase tracking-[1em]">Monitor Standby</p>
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
  <div className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.08] transition-all group">
    <div className="flex items-center gap-5 mb-4">
      <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-500">{icon}</span>
      <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.3em]">{label}</span>
    </div>
    <p className="text-lg font-bold text-white tracking-tight leading-tight">{value}</p>
  </div>
);

export default PlantIdSection;
