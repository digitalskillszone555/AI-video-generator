
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PlantIdSection from './components/PlantIdSection';
import ChatSection from './components/ChatSection';
import VideoSection from './components/VideoSection';
import WeatherSection from './components/WeatherSection';
import TodoSection from './components/TodoSection';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/AdminDashboard';
import Logo from './components/Logo';

type TabType = 'identify' | 'chat' | 'video' | 'todo' | 'weather' | 'admin';

const App: React.FC = () => {
  const [user, setUser] = useState<{ email: string; isAdmin: boolean } | null>(() => {
    const saved = localStorage.getItem('veridion_auth');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('identify');

  useEffect(() => {
    if (user) {
      localStorage.setItem('veridion_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('veridion_auth');
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
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-emerald-500/30 font-sans">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-12">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'identify' && <PlantIdSection />}
          {activeTab === 'chat' && <ChatSection />}
          {activeTab === 'video' && <VideoSection />}
          {activeTab === 'weather' && <WeatherSection />}
          {activeTab === 'todo' && <TodoSection />}
          {activeTab === 'admin' && user.isAdmin && <AdminDashboard />}
        </div>
      </main>

      <footer className="border-t border-white/5 bg-[#080808] py-24 px-6 mt-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-8 max-w-sm">
            <div className="flex items-center gap-5">
              <Logo size={56} />
              <div>
                <span className="text-3xl font-bold text-white font-serif tracking-tight leading-none block">Veridion Studio</span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] mt-2 block">Premium Botanical Intelligence</span>
              </div>
            </div>
            <p className="text-stone-500 text-lg leading-relaxed">
              Veridion is a professional-grade neural suite combining advanced machine vision with cinematic generative AI to transform the way professionals interact with botany.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-20">
            <FooterLinkSet title="Studio Environment" links={['Neural 4K Engine', 'Cinematography Hub', 'Asset Vault', 'Master Templates']} />
            <FooterLinkSet title="Infrastructure" links={['Cloud Node Status', 'API Gateway', 'Deployment Logs', 'Encryption Standards']} />
            <FooterLinkSet title="Veridion Corp" links={['Ethics & AI', 'Global Licensing', 'Intelligence Lab', 'Contact Command']} />
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto border-t border-white/5 mt-20 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[11px] font-bold text-stone-600 uppercase tracking-[0.4em]">
            &copy; 2024 VERIDION STUDIO • ALL NEURAL SYSTEMS NOMINAL
          </p>
          <div className="flex gap-12">
            <a href="#" className="text-[11px] font-bold text-stone-600 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">Privacy Protocols</a>
            <a href="#" className="text-[11px] font-bold text-stone-600 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">Terms of Operation</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FooterLinkSet = ({ title, links }: { title: string, links: string[] }) => (
  <div className="space-y-8">
    <h5 className="font-bold text-white uppercase tracking-[0.3em] text-[11px]">{title}</h5>
    <div className="flex flex-col gap-4">
      {links.map(link => (
        <a key={link} href="#" className="text-[13px] text-stone-500 hover:text-emerald-400 transition-colors font-medium tracking-wide">{link}</a>
      ))}
    </div>
  </div>
);

export default App;
