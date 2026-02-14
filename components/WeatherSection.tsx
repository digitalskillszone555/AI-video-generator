
import React, { useState, useEffect } from 'react';
import { WeatherData } from '../types';

const WeatherSection: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTimeout(() => {
          setWeather({
            temp: 24,
            condition: 'Sunny',
            humidity: 65,
            uvIndex: 4,
            location: 'Local Production Zone',
            advice: 'High photosynthetic potential detected. Optimal period for nitrogen-rich fertilization and aggressive pruning. Monitor substrate moisture closely.'
          });
          setLoading(false);
        }, 1500);
      },
      () => {
        setWeather({
          temp: 18,
          condition: 'Cloudy',
          humidity: 80,
          uvIndex: 1,
          location: 'Global Monitoring Node',
          advice: 'Diffuse light conditions detected. Ideal for delicate specimen transplantation and root zone remediation. Relative humidity suggests reduced irrigation frequency.'
        });
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto h-96 flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Climate Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-5xl font-bold text-white font-serif tracking-tight">Climate Intelligence</h1>
        <p className="text-stone-500">Real-time telemetry and professional environmental optimization.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-white/5 rounded-[3rem] p-12 border border-white/5 flex flex-col items-center justify-center space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="relative w-56 h-56 flex items-center justify-center scale-110">
             <WeatherIcon condition={weather?.condition || 'Sunny'} />
          </div>
          <div className="text-center relative z-10">
            <div className="text-8xl font-bold text-white tracking-tighter">{weather?.temp}°C</div>
            <div className="text-2xl font-bold text-emerald-400 mt-2 uppercase tracking-widest">{weather?.condition}</div>
            <div className="text-stone-500 text-xs font-bold uppercase tracking-[0.3em] mt-3">{weather?.location}</div>
          </div>
        </div>

        <div className="space-y-8 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-6">
             <DetailCard icon="💧" label="Atmospheric Humidity" value={`${weather?.humidity}%`} />
             <DetailCard icon="☀️" label="Ultraviolet Index" value={`${weather?.uvIndex}`} />
          </div>

          <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group flex-1">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="text-sm font-bold mb-6 flex items-center gap-3 text-emerald-400 uppercase tracking-[0.3em]">
              <span>💡</span> Neural Protocol
            </h3>
            <p className="text-xl text-stone-200 leading-relaxed font-serif">
              "{weather?.advice}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
    <div className="text-3xl mb-4">{icon}</div>
    <div className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] mb-1">{label}</div>
    <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
  </div>
);

const WeatherIcon = ({ condition }: { condition: WeatherData['condition'] }) => {
  if (condition === 'Sunny') {
    return (
      <svg className="w-full h-full text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    );
  }
  return (
    <svg className="w-full h-full text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.4-1.9-4.4-4.3-4.5-.6-2.5-2.8-4.4-5.5-4.4-2.1 0-4 1.1-5 2.8C5.1 8.6 3 10.8 3 13.5 3 16.5 5.5 19 8.5 19h9z" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
};

export default WeatherSection;
