
import React, { useState, useRef, useEffect } from 'react';
import { chatWithBotanist } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', content: "Hello! I'm Sage, your botanical assistant. Ask me anything about your garden, pest control, or specific plant species!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }));
      const reply = await chatWithBotanist(input, history);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: 'err', role: 'model', content: "Connection issues. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[75vh] flex flex-col bg-[#050505] rounded-[3rem] border border-white/5 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="bg-[#0a0a0a] p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg">🌿</div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight font-serif">Sage Intelligence</h2>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.4em]">Botanical Expert Node</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-bold text-stone-600 uppercase tracking-widest">Active Connection</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-8 py-5 rounded-[2rem] text-lg font-medium leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none shadow-xl' 
                : 'bg-white/5 text-stone-200 rounded-tl-none border border-white/5'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 px-6 py-4 rounded-full rounded-tl-none border border-white/5 flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area - FIX: High contrast for input */}
      <div className="p-8 bg-black/80 border-t border-white/5">
        <div className="relative flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question for Sage..."
            className="flex-1 bg-[#111] border border-white/10 rounded-2xl px-8 py-5 text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-lg font-medium shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 disabled:opacity-20 transition-all shadow-2xl active:scale-95"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
