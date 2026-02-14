
import React, { useState, useRef, useEffect } from 'react';
import { identifyPlant } from '../services/geminiService';
import { PlantCareInfo } from '../types';

const PlantIdSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [plantInfo, setPlantInfo] = useState<PlantCareInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      await processBase64Image(base64);
    };
    reader.readAsDataURL(file);
  };

  const processBase64Image = async (base64: string) => {
    const base64Clean = base64.split(',')[1];
    setImage(base64);
    setLoading(true);
    setError(null);
    setPlantInfo(null);
    
    try {
      const result = await identifyPlant(base64Clean);
      setPlantInfo(result);
    } catch (err) {
      setError("Analysis failed. Ensure the specimen is centered and well-lit.");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 1280, height: 720 }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Lens access denied. Check system permissions.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        processBase64Image(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-white font-serif tracking-tight">Specimen Analysis</h1>
          <p className="text-stone-500">Deploy high-precision neural networks to identify and evaluate botanical samples.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Ingest File
          </button>
          <button 
            onClick={startCamera}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all flex items-center gap-3 shadow-xl shadow-emerald-500/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Live Lens
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        </div>
      </div>

      {isCameraActive ? (
        <div className="relative rounded-[3rem] overflow-hidden aspect-video bg-black border border-white/10 shadow-2xl">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
            <div className="w-full h-full border border-emerald-500/50 rounded-2xl flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-emerald-500 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-8">
            <button onClick={stopCamera} className="p-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-white hover:bg-black/60 transition-all">Cancel</button>
            <button onClick={capturePhoto} className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all border-[6px] border-white/20">
               <div className="w-16 h-16 bg-white border-2 border-emerald-500 rounded-full"></div>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-12">
          {image && (
            <div className="rounded-[3rem] overflow-hidden bg-stone-100 border border-stone-200 shadow-xl aspect-square relative group">
              <img src={image} alt="Specimen" className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white font-bold text-sm uppercase tracking-widest">Neural Analysis Active</p>
                </div>
              )}
            </div>
          )}

          {plantInfo && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-bold text-white font-serif">{plantInfo.name}</h2>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    plantInfo.care.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    plantInfo.care.difficulty === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {plantInfo.care.difficulty} Difficulty
                  </span>
                </div>
                <p className="text-emerald-500 font-bold italic font-serif text-xl">{plantInfo.scientificName}</p>
              </div>

              <p className="text-stone-400 leading-relaxed text-lg">{plantInfo.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <CareCard icon="💧" label="Hydration" value={plantInfo.care.watering} />
                <CareCard icon="☀️" label="Sunlight" value={plantInfo.care.sunlight} />
                <CareCard icon="🌡️" label="Climate" value={plantInfo.care.temperature} />
                <CareCard icon="🌱" label="Substrate" value={plantInfo.care.soil} />
              </div>

              <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                <h3 className="font-bold text-stone-300 uppercase tracking-widest text-xs">Diagnostic Warnings</h3>
                <ul className="space-y-2">
                  {plantInfo.commonIssues.map((issue, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-stone-400">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {error && (
            <div className="lg:col-span-2 bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
              <p className="text-red-400 font-bold">{error}</p>
              <button onClick={() => setError(null)} className="mt-4 text-xs font-bold uppercase text-stone-500 hover:text-white transition-colors">Dismiss Error</button>
            </div>
          )}

          {!image && !loading && !error && (
            <div className="lg:col-span-2 py-32 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center space-y-6 text-stone-600">
              <div className="text-6xl opacity-20">🔬</div>
              <p className="text-xl font-medium">Ready for Ingestion. Select a file or activate Live Lens.</p>
            </div>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const CareCard = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
    <div className="flex items-center gap-3 mb-2">
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-sm font-bold text-white leading-snug">{value}</p>
  </div>
);

export default PlantIdSection;
