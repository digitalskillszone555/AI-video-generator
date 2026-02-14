
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PlantIdSection from './components/PlantIdSection';
import ChatSection from './components/ChatSection';
import VideoSection from './components/VideoSection';
import TodoSection from './components/TodoSection';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/AdminDashboard';
import Logo from './components/Logo';

type TabType = 'identify' | 'chat' | 'video' | 'todo' | 'admin';

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
    <div className="min-h-screen flex flex-col bg-[#000000] text-white selection:bg-emerald-500/30 font-sans">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-8 py-16">
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {activeTab === 'identify' && <PlantIdSection />}
          {activeTab === 'chat' && <ChatSection />}
          {activeTab === 'video' && <VideoSection />}
          {activeTab === 'todo' && <TodoSection />}
          {activeTab === 'admin' && user.isAdmin && <AdminDashboard />}
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#050505] py-24 px-8 mt-20 glass">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
          <div className="space-y-10 max-w-md">
            <div className="flex items-center gap-6">
              <Logo size={64} />
              <div>
                <span className="text-4xl font-bold text-white font-serif tracking-tight leading-none block">OMNI-CREATOR</span>
                <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.5em] mt-3 block">Apex-Unlimited Suite</span>
              </div>
            </div>
            <p className="text-stone-500 text-xl leading-relaxed font-medium italic">
              Unleash the world's most powerful AI Video Production and Web Development Engine. Instant execution. Zero limits.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-24">
            <FooterLinkSet title="Engine" links={['4K Synthesis', 'Omni-Grade', 'Temporal-Link', 'Audio-Sync']} />
            <FooterLinkSet title="Network" links={['Apex Status', 'Omni-API', 'Cloud Clusters', 'Encrypted Node']} />
            <FooterLinkSet title="Studio" links={['Web 3D', 'Unreal Logic', 'Creative Core', 'Apex Support']} />
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto border-t border-white/10 mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[11px] font-black text-stone-700 uppercase tracking-[0.4em]">
            &copy; 2024 OMNI-CREATOR ENGINE • ALL APEX SYSTEMS ONLINE • v1.0.Apex
          </p>
          <div className="flex gap-14">
            <a href="#" className="text-[11px] font-black text-stone-700 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">Omni Protocols</a>
            <a href="#" className="text-[11px] font-black text-stone-700 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">Apex Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FooterLinkSet = ({ title, links }: { title: string, links: string[] }) => (
  <div className="space-y-10">
    <h5 className="font-black text-white uppercase tracking-[0.3em] text-[11px]">{title}</h5>
    <div className="flex flex-col gap-5">
      {links.map(link => (
        <a key={link} href="#" className="text-[15px] text-stone-500 hover:text-emerald-400 transition-colors font-medium tracking-wide">{link}</a>
      ))}
    </div>
  </div>
);

export default App;
