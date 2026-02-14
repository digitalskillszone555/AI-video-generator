
import React, { useState, useEffect } from 'react';
import { WeatherData } from '../types';

const WeatherSection: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking weather data based on geolocation for now
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // In a real app, we would fetch from an API like OpenWeather
        // Here we simulate a response
        setTimeout(() => {
          setWeather({
            temp: 24,
            condition: 'Sunny',
            humidity: 65,
            uvIndex: 4,
            location: 'Your Garden',
            advice: 'The soil is drying quickly in this sun. Check your succulents and newly planted seedlings for watering needs.'
          });
          setLoading(false);
        }, 1500);
      },
      () => {
        // Fallback if location denied
        setWeather({
          temp: 18,
          condition: 'Cloudy',
          humidity: 80,
          uvIndex: 1,
          location: 'Remote Garden',
          advice: 'High humidity and cloud cover are great for root development in cuttings. Ideal time for transplanting!'
        });
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto h-96 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-500 font-medium">Reading the skies...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-stone-900 font-serif">Garden Climate</h1>
        <p className="text-stone-600">Real-time local data paired with expert botanical recommendations.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Main Weather Card */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-stone-200 flex flex-col items-center justify-center space-y-6">
          <div className="relative w-48 h-48 flex items-center justify-center">
             <WeatherIcon condition={weather?.condition || 'Sunny'} />
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-stone-900">{weather?.temp}°C</div>
            <div className="text-xl font-medium text-emerald-700 mt-2">{weather?.condition}</div>
            <div className="text-stone-400 text-sm font-bold uppercase tracking-widest mt-1">{weather?.location}</div>
          </div>
        </div>

        {/* Details & Advice */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <DetailCard icon="💧" label="Humidity" value={`${weather?.humidity}%`} />
             <DetailCard icon="☀️" label="UV Index" value={`${weather?.uvIndex}`} />
          </div>

          <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <span>💡</span> Botanical Advice
            </h3>
            <p className="text-emerald-50 leading-relaxed font-medium">
              {weather?.advice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailCard = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm text-center">
    <div className="text-2xl mb-2">{icon}</div>
    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{label}</div>
    <div className="text-lg font-bold text-stone-800">{value}</div>
  </div>
);

const WeatherIcon = ({ condition }: { condition: WeatherData['condition'] }) => {
  const animations = `
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes drift { from { transform: translateX(-5px); } to { transform: translateX(5px); } }
    @keyframes drop { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(10px); opacity: 1; } }
    @keyframes flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .animate-rotate { animation: rotate 20s linear infinite; }
    .animate-drift { animation: drift 4s ease-in-out infinite alternate; }
    .animate-drop { animation: drop 1s linear infinite; }
    .animate-flicker { animation: flicker 2s step-end infinite; }
  `;

  if (condition === 'Sunny') {
    return (
      <>
        <style>{animations}</style>
        <svg className="w-40 h-40 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.2" className="animate-rotate origin-center" />
          <g className="animate-rotate origin-center">
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </g>
        </svg>
      </>
    );
  }

  if (condition === 'Cloudy') {
    return (
      <>
        <style>{animations}</style>
        <svg className="w-40 h-40 text-stone-400 animate-drift" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.4-1.9-4.4-4.3-4.5-.6-2.5-2.8-4.4-5.5-4.4-2.1 0-4 1.1-5 2.8C5.1 8.6 3 10.8 3 13.5 3 16.5 5.5 19 8.5 19h9z" fill="currentColor" fillOpacity="0.1" />
        </svg>
      </>
    );
  }

  if (condition === 'Rainy') {
    return (
      <>
        <style>{animations}</style>
        <div className="relative">
          <svg className="w-40 h-40 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.4-1.9-4.4-4.3-4.5-.6-2.5-2.8-4.4-5.5-4.4-2.1 0-4 1.1-5 2.8C5.1 8.6 3 10.8 3 13.5 3 16.5 5.5 19 8.5 19h9z" />
            <g className="animate-drop">
              <line x1="8" y1="19" x2="8" y2="21" />
              <line x1="12" y1="19" x2="12" y2="21" />
              <line x1="16" y1="19" x2="16" y2="21" />
            </g>
          </svg>
        </div>
      </>
    );
  }

  return (
    <svg className="w-40 h-40 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
};

export default WeatherSection;
