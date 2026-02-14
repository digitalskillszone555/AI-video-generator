
import React, { useState, useEffect } from 'react';
import { GardenTask } from '../types';

const TodoSection: React.FC = () => {
  const [tasks, setTasks] = useState<GardenTask[]>(() => {
    const saved = localStorage.getItem('veridion_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    localStorage.setItem('veridion_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!inputValue.trim()) return;
    const newTask: GardenTask = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([newTask, ...tasks]);
    setInputValue('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const progressPercent = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-white font-serif tracking-tight">Operations Log</h1>
          <p className="text-stone-500">Manage critical botanical maintenance schedules and production tasks.</p>
        </div>
        <div className="bg-white/5 rounded-2xl px-6 py-4 border border-white/10 flex items-center gap-6 shadow-2xl">
          <div className="text-right">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Fleet Completion</div>
            <div className="text-xl font-bold text-white">{progressPercent}%</div>
          </div>
          <div className="w-32 bg-white/5 h-2 rounded-full overflow-hidden">
             <div className="bg-emerald-600 h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/5 rounded-[2.5rem] p-8 border border-white/5 space-y-6 shadow-2xl">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-[0.2em]">New Entry</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="Initialize task..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-stone-700 font-medium"
              />
              <button 
                onClick={addTask}
                disabled={!inputValue.trim()}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-500 disabled:opacity-20 transition-all shadow-xl shadow-emerald-950/20"
              >
                Queue Task
              </button>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-950/20 rounded-[2.5rem] p-8 border border-emerald-500/10">
            <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-widest mb-4">Command Advice</h4>
            <p className="text-stone-400 text-sm leading-relaxed">Systematic logging of irrigation cycles reduces neural variance in growth prediction by 22%.</p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {tasks.length === 0 ? (
            <div className="py-24 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4 text-stone-700">
               <div className="text-5xl">📋</div>
               <p className="font-bold uppercase tracking-widest text-xs">No active production tasks.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`group bg-white/5 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between transition-all hover:bg-white/[0.08] ${task.completed ? 'opacity-40' : ''}`}>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-transparent border-white/20 hover:border-emerald-500/50 text-transparent'}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </button>
                  <span className={`text-lg font-medium tracking-tight ${task.completed ? 'line-through text-stone-500' : 'text-stone-200'}`}>{task.text}</span>
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-3 text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoSection;
