
import React, { useState } from 'react';
import Logo from './Logo';

type TabType = 'identify' | 'chat' | 'video' | 'todo' | 'admin';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: { email: string; isAdmin: boolean };
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="bg-black/95 backdrop-blur-3xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-5 cursor-pointer group" onClick={() => setActiveTab('identify')}>
          <Logo size={44} />
          <div>
            <span className="text-2xl font-bold text-white font-serif tracking-tight leading-none block group-hover:text-emerald-400 transition-colors">OMNI-CREATOR</span>
            <span className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-[0.4em] mt-0.5">APEX-UNLIMITED ENGINE</span>
          </div>
        </div>

        <nav className="hidden xl:flex bg-white/[0.03] border border-white/10 rounded-2xl p-1 gap-1 glass shadow-2xl">
          <TabButton active={activeTab === 'identify'} onClick={() => setActiveTab('identify')} icon={<ScanIcon />} label="Synthesis" />
          <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<ChatIcon />} label="Omni-Assistant" />
          <TabButton active={activeTab === 'todo'} onClick={() => setActiveTab('todo')} icon={<TodoIcon />} label="Command Log" />
          <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={<VideoIcon />} label="Apex Hub" />
          {user.isAdmin && <TabButton active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} icon={<AdminIcon />} label="Engine Core" />}
        </nav>

        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pr-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10 glass shadow-xl"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-lg shadow-emerald-500/30">
              {user.email[0]}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-[9px] font-bold text-stone-500 uppercase tracking-widest leading-none mb-0.5">Apex Operator</div>
              <div className="text-xs font-bold text-white truncate max-w-[140px]">{user.email.split('@')[0]}</div>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-[#0a0a0a]/95 backdrop-blur-3xl rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.9)] border border-white/10 p-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-5 py-4 mb-2 border-b border-white/5">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Session Node</p>
                <p className="text-sm font-bold text-white truncate">{user.email}</p>
              </div>
              <button onClick={onLogout} className="w-full text-left px-5 py-3.5 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-all flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Terminate Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl ${
      active ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const ScanIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const ChatIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const VideoIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const TodoIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
const AdminIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;

export default Header;
