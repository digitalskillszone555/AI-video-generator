
import React, { useState, useRef, useEffect } from 'react';
import { identifyPlant, editBotanicalPhoto } from '../services/geminiService';
import { PlantCareInfo } from '../types';

const PlantIdSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantCareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (sourceImage && !plantInfo && !loading && !generatedImage) {
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
      setPlantInfo(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerAnalysis = async (imgData: string) => {
    const base64 = imgData.split(',')[1];
    setLoading(true);
    setError(null);
    try {
      const result = await identifyPlant(base64);
      if (result && result.isBotanical !== false) {
        setPlantInfo(result);
      }
    } catch (err: any) {
      console.error(err);
      // We don't show hard error here to allow editing non-plant photos
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhoto = async () => {
    if (!sourceImage || !editPrompt) return;
    setLoading(true);
    setError(null);
    try {
      const base64 = sourceImage.split(',')[1];
      const resultUrl = await editBotanicalPhoto(base64, editPrompt);
      if (resultUrl) {
        setGeneratedImage(resultUrl);
      } else {
        throw new Error("Neural output stream empty.");
      }
    } catch (err) {
      console.error(err);
      setError("Neural refinement failed. Ensure prompt is descriptive and specimen is clearly visible.");
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    const target = generatedImage || sourceImage;
    if (!target) return;
    const link = document.createElement('a');
    link.href = target;
    link.download = `VERIDION_STUDIO_${Date.now()}.png`;
    link.click();
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // High Quality 4K Capture
      canvas.width = 3840;
      canvas.height = 2160;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setSourceImage(dataUrl);
        setGeneratedImage(null);
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
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
             <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.6em]">Neural Mastering Engine V4.5</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white font-serif tracking-tighter leading-none">Neural Workbench</h1>
          <p className="text-stone-500 text-2xl font-medium tracking-tight">AI-driven botanical analysis and high-fidelity cinematography.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none px-12 py-6 bg-white/[0.03] border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.3em] shadow-2xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Ingest Specimen
          </button>
          <button 
            onClick={() => { setIsCameraActive(true); navigator.mediaDevices.getUserMedia({ video: { width: 3840, height: 2160 } }).then(s => { streamRef.current = s; if(videoRef.current) videoRef.current.srcObject = s; }); }}
            className="flex-1 md:flex-none px-12 py-6 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(16,185,129,0.4)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
            Live Optic
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
        </div>
      </div>

      {isCameraActive ? (
        <div className="relative rounded-[5rem] overflow-hidden aspect-video bg-black border-4 border-emerald-500/20 shadow-2xl group">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none flex items-center justify-center">
             <div className="w-[60%] h-[60%] border border-white/10 rounded-[4rem] relative">
                <div className="absolute top-0 left-0 w-20 h-20 border-t-8 border-l-8 border-emerald-500 rounded-tl-[4rem] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-8 border-r-8 border-emerald-500 rounded-br-[4rem] animate-pulse"></div>
             </div>
          </div>
          <div className="absolute bottom-16 left-0 right-0 flex justify-center items-center gap-12">
            <button onClick={stopCamera} className="px-14 py-6 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-2xl">Cancel</button>
            <button onClick={capture} className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-90 transition-all duration-300">
               <div className="w-28 h-28 border-4 border-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full animate-ping"></div>
               </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* LEFT: SOURCE MONITOR */}
          <div className="space-y-8 bg-[#0a0a0a] p-10 rounded-[4rem] border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em]">Input Monitor (A)</span>
               {sourceImage && <button onClick={() => setSourceImage(null)} className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:underline">Clear Feed</button>}
            </div>
            
            <div className="aspect-square bg-black rounded-[3rem] overflow-hidden border border-white/10 relative group">
              {sourceImage ? (
                <img src={sourceImage} alt="Input Specimen" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-800 space-y-6 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                   <div className="text-8xl opacity-10">📸</div>
                   <p className="text-[11px] font-black uppercase tracking-[0.8em]">Awaiting Data Feed</p>
                </div>
              )}
              {loading && !generatedImage && <div className="scan-laser"></div>}
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-stone-700 uppercase tracking-[0.5em] ml-2">Neural Refinement Instructions</label>
                 <textarea 
                   value={editPrompt}
                   onChange={(e) => setEditPrompt(e.target.value)}
                   placeholder="E.g. Transform this into a high-end 3D animated production style..."
                   className="w-full h-40 bg-black border border-white/10 rounded-[2rem] p-8 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none shadow-inner placeholder:text-stone-900"
                 />
               </div>
               <button 
                 onClick={handleEditPhoto}
                 disabled={loading || !sourceImage || !editPrompt.trim()}
                 className="w-full py-7 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-[12px] hover:bg-emerald-500 disabled:opacity-20 transition-all shadow-xl active:scale-95"
               >
                 Apply Neural Edit
               </button>
            </div>
          </div>

          {/* RIGHT: OUTPUT MONITOR */}
          <div className="space-y-8">
            <div className="bg-[#0a0a0a] p-10 rounded-[4rem] border border-white/5 shadow-2xl h-full flex flex-col min-h-[800px]">
               <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">Output Master (B)</span>
                  {generatedImage && <button onClick={downloadResult} className="text-[10px] font-black text-white bg-emerald-600 px-6 py-2 rounded-full uppercase tracking-widest hover:bg-emerald-500 transition-all">Export Result</button>}
               </div>

               <div className="flex-1 flex flex-col">
                  {loading && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-500">
                       <div className="w-24 h-24 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(16,185,129,0.3)]"></div>
                       <div className="text-center space-y-4">
                          <p className="text-emerald-500 font-black uppercase tracking-[0.8em] animate-pulse">Rendering Neural Master</p>
                          <p className="text-stone-700 text-xs font-bold uppercase tracking-widest">Applying cinematic refinement protocols...</p>
                       </div>
                    </div>
                  )}

                  {generatedImage && !loading && (
                    <div className="flex-1 space-y-10 animate-in zoom-in-95 duration-700">
                       <div className="aspect-square bg-black rounded-[3rem] overflow-hidden border-2 border-emerald-500/30 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative group">
                          <img src={generatedImage} alt="Master Output" className="w-full h-full object-contain" />
                          <div className="absolute top-8 left-8 bg-emerald-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl">Cinematic Master Generated</div>
                       </div>
                       <p className="text-stone-500 text-center text-xl font-medium leading-relaxed italic">"Neural refinement complete. High-fidelity stylistic coherence applied to botanical specimen."</p>
                    </div>
                  )}

                  {plantInfo && !generatedImage && !loading && (
                    <div className="flex-1 space-y-10 animate-in slide-in-from-right-10 duration-1000">
                       <div className="space-y-6">
                          <h2 className="text-7xl font-bold text-white font-serif tracking-tighter leading-none">{plantInfo.name}</h2>
                          <p className="text-emerald-500 font-bold italic font-serif text-3xl tracking-wide">{plantInfo.scientificName}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <ResultCard icon="💧" label="Watering" value={plantInfo.care.watering} />
                          <ResultCard icon="☀️" label="Sunlight" value={plantInfo.care.sunlight} />
                          <ResultCard icon="🌡️" label="Climate" value={plantInfo.care.temperature} />
                          <ResultCard icon="🌱" label="Substrate" value={plantInfo.care.soil} />
                       </div>
                       <div className="bg-emerald-600/5 border border-emerald-500/10 p-10 rounded-[2.5rem]">
                          <p className="text-stone-400 text-xl font-medium leading-relaxed italic">"{plantInfo.description}"</p>
                       </div>
                    </div>
                  )}

                  {error && !loading && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 bg-red-500/5 rounded-[3rem] border border-red-500/20 p-12 text-center animate-in zoom-in-95 duration-500">
                       <div className="text-7xl">⚠️</div>
                       <div className="space-y-4">
                          <h3 className="text-3xl font-bold text-red-500 font-serif">Neural Conflict</h3>
                          <p className="text-stone-400 text-lg font-medium leading-relaxed">{error}</p>
                       </div>
                       <button onClick={() => {setError(null); setGeneratedImage(null);}} className="text-[11px] font-black uppercase tracking-[0.4em] text-white px-10 py-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">Re-initiate Cluster</button>
                    </div>
                  )}

                  {!loading && !generatedImage && !plantInfo && !error && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-10 opacity-10">
                       <div className="text-[12rem]">🌿</div>
                       <p className="text-[11px] font-black uppercase tracking-[1em]">Output Standby</p>
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
  <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.08] transition-all group">
    <div className="flex items-center gap-4 mb-3">
      <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{icon}</span>
      <span className="text-[9px] font-black text-stone-600 uppercase tracking-[0.2em]">{label}</span>
    </div>
    <p className="text-md font-bold text-white tracking-tight">{value}</p>
  </div>
);

export default PlantIdSection;
