
import React, { useState } from 'react';
import Logo from './Logo';

interface AuthPageProps {
  onLogin: (user: { email: string; isAdmin: boolean }) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      const isAdmin = email.toLowerCase().includes('admin');
      const user = { email: email || 'creative.director@veridion.studio', isAdmin };
      localStorage.setItem('veridion_auth', JSON.stringify(user));
      onLogin(user);
      setIsAuthenticating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-emerald-500/30 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-950/20 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-stone-900/30 blur-[180px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[1200px] grid lg:grid-cols-2 bg-[#080808] rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.9)] relative z-10 min-h-[700px]">
        
        {/* Cinematic Branding */}
        <div className="hidden lg:flex flex-col justify-between p-24 bg-gradient-to-br from-[#061e18] to-black text-white relative border-r border-white/5">
          <div className="space-y-10 relative z-10">
            <Logo size={100} />
            <div className="space-y-6">
              <h1 className="text-7xl font-bold font-serif leading-[0.9] tracking-tighter">Professional Botanical AI.</h1>
              <p className="text-stone-500 text-xl leading-relaxed max-w-sm">Veridion Studio defines the high-fidelity standard for botanical cinematography and neural analysis.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="w-px h-12 bg-emerald-500/30"></div>
             <div>
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.5em] mb-1">Status: Operational</div>
                <div className="text-[10px] font-bold text-stone-600 uppercase tracking-[0.5em]">Neural Engine V4.1.0</div>
             </div>
          </div>
        </div>

        {/* Portal Entry */}
        <div className="p-10 md:p-20 lg:p-24 flex flex-col justify-center bg-[#080808]">
          <div className="mb-14 text-center lg:text-left space-y-10">
            <Logo size={64} className="mx-auto lg:mx-0 lg:hidden" />
            <div className="flex justify-center lg:justify-start gap-12 border-b border-white/5 pb-2">
              <button onClick={() => setMode('login')} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${mode === 'login' ? 'text-emerald-500' : 'text-stone-600 hover:text-stone-400'}`}>
                Access Session
                {mode === 'login' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
              </button>
              <button onClick={() => setMode('signup')} className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${mode === 'signup' ? 'text-emerald-500' : 'text-stone-600 hover:text-stone-400'}`}>
                Create Identity
                {mode === 'signup' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full"></div>}
              </button>
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-white tracking-tight">{mode === 'login' ? 'Creative Workspace' : 'Studio Initialization'}</h2>
              <p className="text-stone-600 font-medium text-lg">{mode === 'login' ? 'Enter your credentials to resume production.' : 'Establish your professional botanical identity.'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-stone-700 uppercase tracking-[0.4em] ml-2">Secure Identifier</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="creative@veridion.studio" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-stone-800 font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-stone-700 uppercase tracking-[0.4em] ml-2">Neural Passkey</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-stone-800 font-medium" />
              </div>
            </div>

            <button type="submit" disabled={isAuthenticating} className="w-full bg-emerald-600 text-white py-6 rounded-3xl font-bold text-lg hover:bg-emerald-500 transition-all active:scale-95 shadow-2xl shadow-emerald-950/50 flex items-center justify-center gap-4">
              {isAuthenticating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="uppercase text-[10px] tracking-[0.3em]">Authenticating...</span>
                </>
              ) : (mode === 'login' ? 'Activate Session' : 'Create Identity')}
            </button>

            <div className="flex items-center gap-6 py-6">
              <div className="h-px bg-white/5 flex-1"></div>
              <span className="text-stone-800 text-[8px] font-bold uppercase tracking-[0.5em]">Federated Auth</span>
              <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <button type="button" onClick={() => onLogin({ email: 'botanist.pro@google.com', isAdmin: false })} className="w-full bg-white/5 border border-white/5 text-stone-300 py-5 rounded-3xl font-bold flex items-center justify-center gap-4 hover:bg-white/10 transition-all uppercase text-[10px] tracking-[0.2em]">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google Workspaces
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
