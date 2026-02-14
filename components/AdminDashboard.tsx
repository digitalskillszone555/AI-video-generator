
import React, { useState, useEffect } from 'react';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [systemStatus, setSystemStatus] = useState('Operational');

  useEffect(() => {
    // Standardized to veridion_users to match AuthPage
    const savedUsers = JSON.parse(localStorage.getItem('veridion_users') || '[]');
    setUsers(savedUsers);
  }, []);

  const stats = [
    { label: 'Active Directors', value: users.length, icon: '👥' },
    { label: '4K Master Renders', value: '2,841', icon: '🎬' },
    { label: 'Neural Health', value: '99.99%', icon: '⚡' },
    { label: 'Global Uptime', value: '412d', icon: '🌐' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-white font-serif tracking-tight">Command Center</h1>
          <p className="text-stone-500">Real-time telemetry and global platform administration.</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 border shadow-2xl ${systemStatus === 'Operational' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span>
          System Status: {systemStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-4 hover:bg-white/[0.07] transition-all group">
            <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{s.icon}</div>
            <div className="space-y-1">
              <div className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.2em]">{s.label}</div>
              <div className="text-4xl font-bold text-white tracking-tighter">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-[#0a0a0a] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-white text-xl">User Registry</h3>
            <button className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-4 py-2 border border-emerald-500/30 rounded-full hover:bg-emerald-500 hover:text-white transition-all">Download Audit Log</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                  <th className="px-10 py-5">Identity (Email)</th>
                  <th className="px-10 py-5">Security Status</th>
                  <th className="px-10 py-5">Last Handshake</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length > 0 ? users.map((u, i) => (
                  <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-10 py-6 text-sm font-bold text-stone-300">{u}</td>
                    <td className="px-10 py-6"><span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold rounded-full uppercase tracking-widest border border-emerald-500/20">Authorized</span></td>
                    <td className="px-10 py-6 text-xs text-stone-500 font-medium">Synced 2m ago</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-10 py-20 text-center text-stone-600 italic">No neural signatures detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-stone-900 to-black rounded-[3rem] p-10 border border-white/5 shadow-2xl space-y-8">
            <h3 className="font-bold text-white text-xl">Global Overrides</h3>
            <div className="space-y-4">
              <button onClick={() => setSystemStatus('Under Maintenance')} className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all text-stone-400">Toggle Production Lock</button>
              <button className="w-full py-5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">Optimize GPU Clusters</button>
              <button className="w-full py-5 bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-500/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">Flush Registry Cache</button>
            </div>
          </div>
          
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] p-10">
            <h4 className="font-bold text-emerald-500 uppercase tracking-widest text-xs mb-4">Neural Advisory</h4>
            <p className="text-sm text-stone-400 leading-relaxed font-medium">
              Production demand has spiked by 120% in the last 6 hours. Consider allocating more memory to the Veo 3.1 render farm to maintain Ultra HD latency targets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
