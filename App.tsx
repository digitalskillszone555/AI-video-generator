
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PlantIdSection from './components/PlantIdSection';
import ChatSection from './components/ChatSection';
import VideoSection from './components/VideoSection';
import TodoSection from './components/TodoSection';
import WeatherSection from './components/WeatherSection';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(() => {
    const saved = localStorage.getItem('sage_auth');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<'identify' | 'chat' | 'video' | 'todo' | 'weather' | 'admin'>('identify');

  useEffect(() => {
    if (user) {
      localStorage.setItem('sage_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('sage_auth');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setActiveTab('identify');
  };

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 selection:bg-emerald-200 selection:text-emerald-900">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:py-12">
        {activeTab === 'identify' && <PlantIdSection />}
        {activeTab === 'chat' && <ChatSection />}
        {activeTab === 'todo' && <TodoSection />}
        {activeTab === 'video' && <VideoSection />}
        {activeTab === 'weather' && <WeatherSection />}
        {activeTab === 'admin' && user.isAdmin && <AdminDashboard />}
      </main>

      <footer className="border-t border-stone-200 bg-white py-12 px-4 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white font-bold">S</span>
              <span className="text-xl font-bold text-stone-900 font-serif">Sage & Soil Studio</span>
            </div>
            <p className="text-stone-400 text-sm max-w-xs">The world's first automated botanical cinematography engine. Powered by Veo 3.1 & Gemini 3 Pro.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
            <div className="space-y-4">
              <h5 className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Studio</h5>
              <div className="flex flex-col gap-2 text-stone-500">
                <a href="#" className="hover:text-emerald-600 transition-colors">4K Renders</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Templates</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Documentation</a>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Company</h5>
              <div className="flex flex-col gap-2 text-stone-500">
                <a href="#" className="hover:text-emerald-600 transition-colors">Open Source</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Ethics</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
              </div>
            </div>
            <div className="space-y-4 hidden md:block">
              <h5 className="font-bold text-stone-900 uppercase tracking-widest text-[10px]">Legal</h5>
              <div className="flex flex-col gap-2 text-stone-500">
                <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-stone-100 mt-12 pt-8 text-center text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em]">
          &copy; 2024 SAGE & SOIL MASTER STUDIO • ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
};

export default App;
