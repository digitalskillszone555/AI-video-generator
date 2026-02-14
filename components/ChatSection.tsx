
import React, { useState, useRef, useEffect } from 'react';
import { chatWithBotanist } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatSection: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', content: "Greetings. I am Sage, the Lead Intelligence node at Veridion Studio. I can assist with botanical forensics, horticultural scheduling, or professional cinematic rendering tips. How shall we proceed?" }
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
      const history = messages.map(m => ({ 
        role: m.role === 'model' ? 'model' : 'user', 
        parts: [{ text: m.content }] 
      }));
      
      const reply = await chatWithBotanist(input, history);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: 'err', role: 'model', content: "Neural handshake timed out. The Assistant is currently processing a high-load render task. Please re-initiate your query." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[80vh] flex flex-col bg-[#050505] rounded-[4rem] border border-white/5 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
      <div className="bg-[#0a0a0a] p-10 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-xl shadow-emerald-500/20">🌿</div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tighter font-serif">Sage Intelligence Node</h2>
            <p className="text-[11px] text-emerald-500 font-black uppercase tracking-[0.5em] mt-1">Lead Botanical Expert • Operational</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-gradient-to-b from-black/40 to-black/80">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-10 py-7 rounded-[2.5rem] text-xl font-medium leading-relaxed shadow-2xl ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white/[0.03] text-stone-200 rounded-tl-none border border-white/10'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 px-10 py-6 rounded-full rounded-tl-none border border-white/5 flex gap-2 items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-10 bg-[#0a0a0a] border-t border-white/10">
        <div className="relative flex items-center gap-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your query for Sage Intelligence..."
            className="flex-1 bg-black border border-white/10 rounded-[2rem] px-10 py-6 text-white placeholder:text-stone-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-xl font-medium shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-7 bg-emerald-600 text-white rounded-[2rem] hover:bg-emerald-500 disabled:opacity-20 transition-all shadow-2xl active:scale-95"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
