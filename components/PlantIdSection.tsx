
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
      if (result.isBotanical === false) {
        setIsNonBotanical(true);
        setPlantInfo(null);
      } else {
        setPlantInfo(result);
      }
    } catch (err: any) {
      setError("Neural Handshake Failure. Re-initiate connection.");
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
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em]">Neural Cluster: Active</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white font-serif tracking-tight leading-none">Specimen Analysis</h1>
          <p className="text-stone-500 text-lg">Automated botanical indexing and health telemetry.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none px-8 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Ingest File
          </button>
          <button 
            onClick={() => { setIsCameraActive(true); navigator.mediaDevices.getUserMedia({ video: true }).then(s => { streamRef.current = s; if(videoRef.current) videoRef.current.srcObject = s; }); }}
            className="flex-1 md:flex-none px-8 py-5 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-500/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
            Live Lens
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
        </div>
      </div>

      {isCameraActive ? (
        <div className="relative rounded-[3rem] overflow-hidden aspect-video bg-black border border-emerald-500/30 shadow-2xl">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none flex items-center justify-center">
             <div className="w-[80%] h-[80%] border border-white/10 rounded-3xl relative">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald-500 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald-500 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald-500 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald-500 rounded-br-xl"></div>
             </div>
          </div>
          <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-8">
            <button onClick={stopCamera} className="px-10 py-4 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">Cancel</button>
            <button onClick={capture} className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all">
               <div className="w-20 h-20 border-4 border-emerald-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
               </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            {image ? (
              <div className="rounded-[3.5rem] overflow-hidden bg-[#080808] border border-white/5 shadow-2xl aspect-square relative group">
                <img src={image} alt="Specimen" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" />
                {loading && <div className="scan-laser"></div>}
                {loading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-emerald-500 font-bold text-[10px] uppercase tracking-[0.5em] animate-pulse">Mapping Specimen</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square border-2 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center space-y-8 text-stone-800 group hover:border-emerald-500/20 transition-all">
                <div className="text-8xl opacity-20 group-hover:scale-110 transition-transform">🔬</div>
                <div className="space-y-3">
                  <p className="text-3xl font-serif text-stone-500">Node Ready</p>
                  <p className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30">Awaiting Sample Input</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center min-h-[500px]">
            {plantInfo && !loading && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-10 duration-1000">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-5">
                    <h2 className="text-5xl md:text-6xl font-bold text-white font-serif tracking-tight leading-tight">{plantInfo.name}</h2>
                    <span className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${
                      plantInfo.care.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      plantInfo.care.difficulty === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {plantInfo.care.difficulty} Protocol
                    </span>
                  </div>
                  <p className="text-emerald-500 font-bold italic font-serif text-2xl">{plantInfo.scientificName}</p>
                </div>

                <p className="text-stone-400 leading-relaxed text-xl font-medium border-l-4 border-white/5 pl-8">{plantInfo.description}</p>

                <div className="grid grid-cols-2 gap-6">
                  <CareCard icon="💧" label="Hydration" value={plantInfo.care.watering} />
                  <CareCard icon="☀️" label="Radiation" value={plantInfo.care.sunlight} />
                  <CareCard icon="🌡️" label="Thermal" value={plantInfo.care.temperature} />
                  <CareCard icon="🌱" label="Substrate" value={plantInfo.care.soil} />
                </div>
              </div>
            )}

            {isNonBotanical && !loading && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-12 rounded-[3rem] space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center text-4xl">🚫</div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-amber-400">Non-Botanical Signature</h3>
                  <p className="text-stone-400 text-lg leading-relaxed font-medium">Neural sensors have detected an incompatible specimen. Align a plant or organic sample within the frame for analysis.</p>
                </div>
                <button onClick={() => {setImage(null); setIsNonBotanical(false);}} className="text-[10px] font-bold uppercase text-amber-500/60 hover:text-amber-400 transition-colors tracking-[0.4em]">Reset Core Sensors</button>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-[3rem] space-y-8 text-center animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-4xl mx-auto">⚠️</div>
                <h3 className="text-2xl font-bold text-red-400">Neural Conflict</h3>
                <p className="text-stone-400 font-medium">{error}</p>
                <button onClick={() => {setError(null); setImage(null);}} className="text-[10px] font-bold uppercase text-stone-500 hover:text-white transition-colors tracking-[0.4em] px-10 py-4 border border-white/5 rounded-full bg-white/5">Restart Handshake</button>
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
  <div className="bg-white/[0.03] p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.06] hover:border-emerald-500/20 transition-all duration-500 group">
    <div className="flex items-center gap-4 mb-4">
      <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.2em]">{label}</span>
    </div>
    <p className="text-sm font-bold text-white leading-relaxed tracking-tight">{value}</p>
  </div>
);

export default PlantIdSection;
