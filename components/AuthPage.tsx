
import React, { useState } from 'react';
import Logo from './Logo';

interface AuthPageProps {
  onLogin: (user: { email: string; isAdmin: boolean }) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isAdmin = email.toLowerCase() === 'admin@veridion.studio';
    
    // Store user session simulation
    const users = JSON.parse(localStorage.getItem('veridion_users') || '[]');
    if (!users.includes(email)) {
      users.push(email);
      localStorage.setItem('veridion_users', JSON.stringify(users));
    }

    onLogin({ email, isAdmin });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Premium Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-950/20 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-stone-900/40 blur-[180px] rounded-full"></div>
        {/* Static noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-[3rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative z-10 h-[800px]">
        
        {/* Brand Side */}
        <div className="hidden md:flex flex-col justify-between p-16 bg-gradient-to-br from-[#061c16] to-black text-white relative border-r border-white/5">
          <div className="space-y-6 relative z-10">
            <Logo size={80} className="mb-12" />
            <h1 className="text-6xl font-bold font-serif leading-[1.1] tracking-tight">The Future of Botanical Cinematography.</h1>
            <p className="text-stone-400 text-xl leading-relaxed max-w-sm">Veridion Studio provides world-class neural analysis and automated 4K nature video production. Professional results, zero effort.</p>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-4 py-6 border-t border-white/5">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-900 bg-stone-900 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Used by 2,000+ Studios Worldwide</p>
            </div>
            <div className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.5em]">Veridion Intelligence V3.1</div>
          </div>

          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Portal Side */}
        <div className="p-12 md:p-24 flex flex-col justify-center bg-[#0a0a0a]">
          <div className="mb-12">
            <div className="flex gap-8 border-b border-white/5 mb-10">
              <button 
                onClick={() => setMode('login')}
                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${mode === 'login' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-stone-600 hover:text-stone-400'}`}
              >
                Studio Login
              </button>
              <button 
                onClick={() => setMode('signup')}
                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${mode === 'signup' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-stone-600 hover:text-stone-400'}`}
              >
                Join Studio
              </button>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{mode === 'login' ? 'Access Workspace' : 'Initialize Identity'}</h2>
            <p className="text-stone-500">{mode === 'login' ? 'Resume your cinematic botanical projects.' : 'Start your journey as a botanical director.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Work Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="creative@studio.com" 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-stone-800"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Access Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-stone-800"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-emerald-500 transition-all active:scale-95 shadow-xl shadow-emerald-950/50">
              {mode === 'login' ? 'Authenticate & Enter' : 'Create Access Identity'}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-stone-700 text-[9px] font-bold uppercase tracking-widest">Studio Federation Access</span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <button type="button" className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google Workspaces
            </button>
          </form>

          <p className="mt-10 text-center text-stone-700 text-xs font-bold uppercase tracking-widest">
            Protected by Veridion Secure Protocols
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
