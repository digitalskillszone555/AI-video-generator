
import React, { useState } from 'react';

interface HeaderProps {
  activeTab: 'identify' | 'chat' | 'video' | 'todo' | 'weather' | 'admin';
  setActiveTab: (tab: 'identify' | 'chat' | 'video' | 'todo' | 'weather' | 'admin') => void;
  user: { email: string; isAdmin: boolean };
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-stone-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-black text-stone-900 font-serif tracking-tight leading-none block">Sage & Soil</span>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">Production Studio</span>
          </div>
        </div>

        <nav className="hidden md:flex gap-1">
          <TabButton active={activeTab === 'identify'} onClick={() => setActiveTab('identify')} icon={<ScanIcon />} label="Analysis" />
          <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<ChatIcon />} label="Assistant" />
          <TabButton active={activeTab === 'weather'} onClick={() => setActiveTab('weather')} icon={<WeatherIcon />} label="Climate" />
          <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={<VideoIcon />} label="Studio" />
          {user.isAdmin && <TabButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={<AdminIcon />} label="Command" />}
        </nav>

        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-2 pr-4 bg-stone-50 rounded-2xl hover:bg-stone-100 transition-all border border-stone-100"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xs font-bold uppercase">
              {user.email[0]}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">{user.isAdmin ? 'Admin' : 'Creator'}</div>
              <div className="text-xs font-bold text-stone-900 truncate max-w-[100px]">{user.email.split('@')[0]}</div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-56 bg-white rounded-[1.5rem] shadow-2xl border border-stone-100 p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 mb-2 border-b border-stone-50">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Signed in as</p>
                <p className="text-xs font-bold text-stone-900 truncate">{user.email}</p>
              </div>
              <button className="w-full text-left px-4 py-3 text-sm font-medium text-stone-600 hover:bg-stone-50 rounded-xl transition-all flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Studio Settings
              </button>
              <button 
                onClick={onLogout}
                className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-3"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Nav */}
      <nav className="flex md:hidden border-t border-stone-100 bg-white">
        <TabButton active={activeTab === 'identify'} onClick={() => setActiveTab('identify')} icon={<ScanIcon />} label="ID" full />
        <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<ChatIcon />} label="Chat" full />
        <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={<VideoIcon />} label="Studio" full />
        {user.isAdmin && <TabButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={<AdminIcon />} label="Admin" full />}
      </nav>
    </header>
  );
};

const TabButton = ({ active, onClick, icon, label, full = false }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, full?: boolean }) => (
  <button
    onClick={onClick}
    className={`flex flex-col md:flex-row items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all ${full ? 'flex-1' : ''} ${
      active ? 'text-stone-900 border-b-2 border-stone-900 md:border-none md:bg-stone-50 md:rounded-xl' : 'text-stone-400 hover:text-stone-700 md:rounded-xl hover:bg-stone-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ScanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);
const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);
const WeatherIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
);
const AdminIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);

export default Header;
