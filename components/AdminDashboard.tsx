
import React, { useState, useEffect } from 'react';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [systemStatus, setSystemStatus] = useState('Operational');

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('sage_users') || '[]');
    setUsers(savedUsers);
  }, []);

  const stats = [
    { label: 'Total Creators', value: users.length, icon: '👥' },
    { label: 'Videos Rendered', value: '1,429', icon: '🎬' },
    { label: 'API Health', value: '99.9%', icon: '⚡' },
    { label: 'System Uptime', value: '342d', icon: '☁️' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-stone-900 font-serif">Command Center</h1>
          <p className="text-stone-500">Global system administration & user metrics.</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${systemStatus === 'Operational' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          ● {systemStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm space-y-2">
            <div className="text-2xl">{s.icon}</div>
            <div className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{s.label}</div>
            <div className="text-2xl font-bold text-stone-900">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-[2.5rem] border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-stone-100 flex justify-between items-center">
            <h3 className="font-bold text-stone-800">Recent Registrations</h3>
            <button className="text-xs font-bold text-emerald-600 hover:underline">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                  <th className="px-8 py-4">User Email</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {users.length > 0 ? users.map((u, i) => (
                  <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-stone-700">{u}</td>
                    <td className="px-8 py-5"><span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg uppercase">Active</span></td>
                    <td className="px-8 py-5 text-xs text-stone-400 font-medium">Just now</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-10 text-center text-stone-400 italic">No users registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white space-y-6">
            <h3 className="font-bold">System Overrides</h3>
            <div className="space-y-4">
              <button onClick={() => setSystemStatus('Maintenance')} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">Toggle Maintenance</button>
              <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">Flush Render Cache</button>
              <button className="w-full py-4 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all">Purge User Data</button>
            </div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8">
            <h4 className="font-bold text-emerald-900 mb-2">Admin Notice</h4>
            <p className="text-sm text-emerald-700 leading-relaxed">
              We've seen a 40% increase in 4K renders this week. Consider upgrading the studio's cloud allocation for smoother output.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
