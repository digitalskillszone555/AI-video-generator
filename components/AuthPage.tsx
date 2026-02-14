
import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: (user: { email: string; isAdmin: boolean }) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate authentication logic
    const isAdmin = email.toLowerCase() === 'admin@sage.bot';
    
    // Track user in local DB for Admin visibility
    const users = JSON.parse(localStorage.getItem('sage_users') || '[]');
    if (!users.includes(email)) {
      users.push(email);
      localStorage.setItem('sage_users', JSON.stringify(users));
    }

    onLogin({ email, isAdmin });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 selection:bg-emerald-500/30">
      {/* 3D-style background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stone-900/40 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-stone-900/50 backdrop-blur-3xl rounded-[3rem] border border-stone-800 overflow-hidden shadow-2xl relative z-10">
        {/* Visual Side */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-emerald-600 to-emerald-900 text-white relative">
          <div className="space-y-4 relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-3xl">🌿</div>
            <h1 className="text-5xl font-bold font-serif leading-tight">Produce Nature's Masterpieces.</h1>
            <p className="text-emerald-100/70 text-lg">The world's first fully automated AI botanical video editor. No manual effort. Just pure cinematic growth.</p>
          </div>
          
          <div className="space-y-2 relative z-10">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-700 bg-stone-800 flex items-center justify-center text-[10px] font-bold">U{i}</div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-emerald-700 bg-emerald-500 flex items-center justify-center text-[10px] font-bold">+2k</div>
            </div>
            <p className="text-xs font-medium text-emerald-200/50 uppercase tracking-widest">Joined by the world's best botanists</p>
          </div>

          {/* Abstract 3D shape decoration */}
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mb-32"></div>
        </div>

        {/* Form Side */}
        <div className="p-12 md:p-20 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-stone-400">Enter the studio to start your next production.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <button type="button" className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-200 transition-all active:scale-95">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-stone-800 flex-1"></div>
              <span className="text-stone-600 text-[10px] font-bold uppercase tracking-widest">Or Studio Email</span>
              <div className="h-px bg-stone-800 flex-1"></div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Work Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-xl shadow-emerald-900/20">
              {isLogin ? 'Enter Production Suite' : 'Create Free Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-stone-500 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => setIsLogin(!isLogin)} className="text-emerald-500 font-bold hover:underline">
              {isLogin ? 'Sign up free' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
