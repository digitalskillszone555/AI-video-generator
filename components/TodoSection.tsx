
import React, { useState, useEffect } from 'react';
import { GardenTask } from '../types';

const TodoSection: React.FC = () => {
  const [tasks, setTasks] = useState<GardenTask[]>(() => {
    const saved = localStorage.getItem('sage_soil_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    localStorage.setItem('sage_soil_tasks', JSON.stringify(tasks));
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

  const startEdit = (task: GardenTask) => {
    setEditingId(task.id);
    setEditValue(task.text);
  };

  const saveEdit = () => {
    if (!editingId) return;
    setTasks(tasks.map(t => t.id === editingId ? { ...t, text: editValue } : t));
    setEditingId(null);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-stone-900 font-serif">Garden Task Manager</h1>
        <p className="text-stone-600">Keep track of your watering, pruning, and planting schedules.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-bold text-stone-900 flex items-center gap-2">
              <span className="text-emerald-600">📊</span> Garden Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-stone-500 font-medium">Progress</span>
                  <span className="text-emerald-600 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-700" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100">
                  <div className="text-xl font-bold text-stone-900">{tasks.length}</div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Total</div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                  <div className="text-xl font-bold text-emerald-700">{completedCount}</div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-500 font-bold">Done</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-100">
            <h4 className="font-bold mb-2">Pro Gardening Tip</h4>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Consistency is key. Setting reminders for fertilization and seasonal pruning ensures a thriving garden year-round.
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-sm flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="e.g., Water the ferns, Prune the roses..."
              className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button
              onClick={addTask}
              disabled={!inputValue.trim()}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              Add Task
            </button>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                <div className="text-4xl mb-2">🧑‍🌾</div>
                <p className="text-stone-500 font-medium">Your garden to-do list is currently empty.</p>
              </div>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`group bg-white border border-stone-100 p-4 rounded-3xl flex items-center gap-4 transition-all hover:border-emerald-200 hover:shadow-md ${task.completed ? 'opacity-60' : ''}`}
                >
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-stone-300 hover:border-emerald-400'}`}
                  >
                    {task.completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                  </button>
                  
                  <div className="flex-1">
                    {editingId === task.id ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        className="w-full bg-stone-50 border-none rounded p-1 text-sm focus:ring-0"
                      />
                    ) : (
                      <span 
                        onClick={() => startEdit(task)}
                        className={`text-sm font-medium cursor-text ${task.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}
                      >
                        {task.text}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoSection;
