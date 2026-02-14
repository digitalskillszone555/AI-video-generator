
import React, { useState, useRef, useEffect } from 'react';
import { identifyPlant } from '../services/geminiService';
import { PlantCareInfo } from '../types';

const PlantIdSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantCareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isNonBotanical, setIsNonBotanical] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (image && !plantInfo && !loading) {
      triggerAnalysis(image);
    }
  }, [image]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setPlantInfo(null);
      setError(null);
      setIsNonBotanical(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerAnalysis = async (imgData: string) => {
    const base64 = imgData.split(',')[1];
    setLoading(true);
    setError(null);
    setIsNonBotanical(false);
    
    try {
      const result = await identifyPlant(base64);
      if (!result || result.isBotanical === false) {
        setIsNonBotanical(true);
        setPlantInfo(null);
      } else {
        setPlantInfo(result);
      }
    } catch (err: any) {
      console.error(err);
      setError("AI Analysis Interrupted. Ensure your Specimen is clearly visible and organic.");
    } finally {
      setLoading(false);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL('image/jpeg'));
        setPlantInfo(null);
        setError(null);
        setIsNonBotanical(false);
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
    <div className="max-w-[1400px] mx-auto space-y-12 pb-24 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.5em]">Neural Analysis Core V4</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white font-serif tracking-tight leading-none">Specimen Indexing</h1>
          <p className="text-stone-500 text-xl font-medium">Professional botanical telemetry and health diagnostics.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Ingest Specimen
          </button>
          <button 
            onClick={() => { setIsCameraActive(true); navigator.mediaDevices.getUserMedia({ video: true }).then(s => { streamRef.current = s; if(videoRef.current) videoRef.current.srcObject = s; }); }}
            className="flex-1 md:flex-none px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest shadow-[0_15px_40px_rgba(16,185,129,0.3)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
            Live Lens Hub
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
        </div>
      </div>

      {isCameraActive ? (
        <div className="relative rounded-[4rem] overflow-hidden aspect-video bg-black border-4 border-emerald-500/20 shadow-2xl">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
             <div className="w-[70%] h-[70%] border border-white/20 rounded-[2rem] relative">
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-3xl"></div>
             </div>
          </div>
          <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-10">
            <button onClick={stopCamera} className="px-12 py-5 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full text-white text-[10px] font-extrabold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">Abort</button>
            <button onClick={capture} className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all">
               <div className="w-24 h-24 border-4 border-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full animate-pulse"></div>
               </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="space-y-8">
            {image ? (
              <div className="rounded-[4rem] overflow-hidden bg-[#080808] border border-white/10 shadow-2xl aspect-square relative group">
                <img src={image} alt="Specimen" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                {loading && <div className="scan-laser"></div>}
                {loading && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xl flex flex-col items-center justify-center z-30">
                    <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-10"></div>
                    <p className="text-emerald-500 font-bold text-[11px] uppercase tracking-[0.6em] animate-pulse">Decoding Specimen Signal</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square border-4 border-dashed border-white/5 rounded-[5rem] flex flex-col items-center justify-center space-y-10 text-stone-900 group hover:border-emerald-500/20 transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="text-9xl opacity-10 group-hover:scale-110 transition-transform group-hover:opacity-30">🔬</div>
                <div className="text-center space-y-4">
                  <p className="text-4xl font-serif text-stone-600 font-bold tracking-tight">Ready for Ingestion</p>
                  <p className="text-[11px] uppercase tracking-[0.6em] font-bold opacity-30">Studio Node 01-B Nominal</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center min-h-[500px] py-10">
            {plantInfo && !loading && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-1000">
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <h2 className="text-6xl font-bold text-white font-serif tracking-tight leading-tight">{plantInfo.name}</h2>
                    <span className={`px-8 py-3 rounded-full text-[11px] font-extrabold uppercase tracking-[0.3em] border ${
                      plantInfo.care.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      plantInfo.care.difficulty === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      {plantInfo.care.difficulty} Protocol
                    </span>
                  </div>
                  <p className="text-emerald-500 font-bold italic font-serif text-3xl tracking-wide">{plantInfo.scientificName}</p>
                </div>

                <p className="text-stone-400 leading-relaxed text-2xl font-medium border-l-4 border-emerald-500/30 pl-10 italic">"{plantInfo.description}"</p>

                <div className="grid grid-cols-2 gap-8">
                  <CareCard icon="💧" label="Hydration" value={plantInfo.care.watering} />
                  <CareCard icon="☀️" label="Radiation" value={plantInfo.care.sunlight} />
                  <CareCard icon="🌡️" label="Thermal" value={plantInfo.care.temperature} />
                  <CareCard icon="🌱" label="Substrate" value={plantInfo.care.soil} />
                </div>
              </div>
            )}

            {isNonBotanical && !loading && (
              <div className="bg-amber-500/5 border-2 border-amber-500/20 p-16 rounded-[4rem] space-y-10 animate-in zoom-in-95 duration-700 text-center">
                <div className="w-24 h-24 bg-amber-500/20 rounded-[2rem] flex items-center justify-center text-5xl mx-auto shadow-2xl">🚫</div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-amber-400 font-serif">Signature Mismatch</h3>
                  <p className="text-stone-400 text-xl leading-relaxed font-medium">Neural sensors indicate this is a non-botanical entity. The analysis core is optimized for organic plant life only.</p>
                </div>
                <button onClick={() => {setImage(null); setIsNonBotanical(false);}} className="text-[11px] font-black uppercase text-amber-500 hover:text-white transition-all tracking-[0.5em] px-12 py-5 border border-amber-500/20 rounded-2xl bg-amber-500/10">Re-Initialize Core</button>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-500/5 border-2 border-red-500/20 p-16 rounded-[4rem] space-y-10 text-center animate-in zoom-in-95 duration-700">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center text-5xl mx-auto shadow-2xl">⚠️</div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold text-red-400 font-serif">Protocol Exception</h3>
                  <p className="text-stone-400 text-xl font-medium">{error}</p>
                </div>
                <button onClick={() => {setError(null); setImage(null);}} className="text-[11px] font-black uppercase text-white hover:bg-emerald-600 transition-all tracking-[0.5em] px-12 py-5 border border-white/10 rounded-2xl bg-white/5 shadow-2xl">Restart Handshake</button>
              </div>
            )}
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const CareCard = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <div className="bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/5 hover:bg-white/[0.08] hover:border-emerald-500/30 transition-all duration-700 group shadow-xl">
    <div className="flex items-center gap-5 mb-5">
      <span className="text-4xl group-hover:scale-125 transition-transform duration-500">{icon}</span>
      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.3em]">{label}</span>
    </div>
    <p className="text-lg font-bold text-white leading-relaxed tracking-tight">{value}</p>
  </div>
);

export default PlantIdSection;
