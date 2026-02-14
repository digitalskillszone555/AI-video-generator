
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
      console.error(err);
      setError("I couldn't identify this plant. Please try a clearer photo.");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
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
        const dataUrl = canvas.toDataURL('image/jpeg');
        processBase64Image(dataUrl);
        stopCamera();
      }
    }
  };

  const reset = () => {
    setImage(null);
    setPlantInfo(null);
    setError(null);
    stopCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-stone-900 font-serif">Identify Your Plant</h1>
        <p className="text-stone-600">Use our professional AI vision to unlock expert care knowledge.</p>
      </div>

      {!image && !isCameraActive ? (
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-100 transition-all group shadow-sm"
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <p className="font-semibold text-emerald-800">Upload Plant Photo</p>
            <p className="text-emerald-600 text-sm">Drag & drop or click to browse</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-px bg-stone-200 flex-1"></div>
            <span className="text-stone-400 text-xs font-bold uppercase tracking-widest">OR</span>
            <div className="h-px bg-stone-200 flex-1"></div>
          </div>

          <button 
            onClick={startCamera}
            className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Open Live Camera
          </button>
        </div>
      ) : isCameraActive ? (
        <div className="relative rounded-3xl overflow-hidden aspect-square md:aspect-video bg-black shadow-2xl animate-in fade-in zoom-in duration-300">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
            <button 
              onClick={stopCamera}
              className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button 
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all border-4 border-emerald-500"
            >
              <div className="w-14 h-14 rounded-full border-2 border-stone-200"></div>
            </button>
            <div className="w-14 h-14"></div> {/* Spacer for balance */}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-stone-100 shadow-lg">
              <img src={image!} alt="Analyzed plant" className="w-full h-full object-cover" />
              {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="font-medium">Identifying your leafy friend...</p>
                </div>
              )}
            </div>
            <button 
              onClick={reset}
              className="w-full py-4 px-6 rounded-2xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50 transition-colors"
            >
              Start New Analysis
            </button>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100">
                {error}
              </div>
            )}

            {plantInfo && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-4xl font-bold text-stone-900 font-serif">{plantInfo.name}</h2>
                  <p className="text-emerald-700 italic font-medium">{plantInfo.scientificName}</p>
                </div>
                
                <p className="text-stone-700 leading-relaxed">{plantInfo.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  <InfoCard label="Difficulty" value={plantInfo.care.difficulty} icon="🌱" color="bg-orange-50 text-orange-700" />
                  <InfoCard label="Sunlight" value={plantInfo.care.sunlight} icon="☀️" color="bg-yellow-50 text-yellow-700" />
                  <InfoCard label="Watering" value={plantInfo.care.watering} icon="💧" color="bg-blue-50 text-blue-700" />
                  <InfoCard label="Soil" value={plantInfo.care.soil} icon="🪴" color="bg-stone-50 text-stone-700" />
                </div>

                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
                  <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    Common Issues & Fixes
                  </h3>
                  <ul className="space-y-2">
                    {plantInfo.commonIssues.map((issue, i) => (
                      <li key={i} className="text-emerald-800 text-sm flex gap-2">
                        <span className="text-emerald-400">•</span> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const InfoCard = ({ label, value, icon, color }: { label: string, value: string, icon: string, color: string }) => (
  <div className={`p-4 rounded-2xl ${color}`}>
    <div className="text-xl mb-1">{icon}</div>
    <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</div>
    <div className="text-sm font-semibold">{value}</div>
  </div>
);

export default PlantIdSection;
