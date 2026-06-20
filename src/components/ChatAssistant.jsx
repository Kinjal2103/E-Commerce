import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';

const generateSessionId = () => {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Welcome to BuildForge! I am your AI PC Building Consultant. Ask me anything about components, compatibility verification, or game FPS estimations!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    let sessId = sessionStorage.getItem('chatSessionId');
    if (!sessId) {
      sessId = generateSessionId();
      sessionStorage.setItem('chatSessionId', sessId);
    }
    setSessionId(sessId);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isLoading, isOpen]);

  // Client-side rule helper response fallback
  const getFallbackResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('socket') || q.includes('motherboard') || q.includes('compat')) {
      return "Compatibility check: Intel 14th Gen CPUs (like the i9-14900K) require socket LGA 1700 motherboard (such as Z790). AMD 7000/8000 series CPUs require socket AM5 motherboard (such as X670E). DDR5 RAM cannot go in DDR4 motherboard slots. Our PC Builder automatically checks these for you!";
    }
    if (q.includes('gpu') || q.includes('4090') || q.includes('graphics')) {
      return "For top-tier 4K gaming and AI workloads, the ASUS ROG Strix RTX 4090 OC (24GB VRAM) is unmatched. It draws around 450W under load and requires a robust 1000W PSU. If you want maximum rasterization value, the AMD Radeon RX 7900 XTX (24GB VRAM) is an excellent alternative at $949.";
    }
    if (q.includes('fps') || q.includes('game') || q.includes('cyberpunk')) {
      return "Performance estimate: An Intel i9-14900K and RTX 4090 config will pull over 110 FPS in Cyberpunk 2077 at 4K Ultra, and over 480 FPS in competitive e-sports titles like CS2 and Valorant. You can view dynamic estimates in our Builder page sidebar!";
    }
    if (q.includes('watt') || q.includes('psu') || q.includes('power')) {
      return "Power drawing rules: A system with an i9-14900K and RTX 4090 will pull roughly 640W-700W under combined gaming loads. We recommend a 1000W power supply (like the Corsair RM1000x Shift) to leave a comfortable 25-30% overhead for safety and stability.";
    }
    return "To achieve the ultimate setup, combine an AMD Ryzen 7 7800X3D with an RTX 4090 and 32GB DDR5 6000MT/s CL30 memory. Let me know if you want detailed specifications for any specific component!";
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMsg, sessionId })
      });

      const data = await res.json();
      if (data.success && data.data && data.data.message) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.data.message }]);
      } else {
        // use fallback if backend isn't answering cleanly
        const fallback = getFallbackResponse(userMsg);
        setMessages((prev) => [...prev, { role: 'ai', text: fallback }]);
      }
    } catch (err) {
      // Offline fallback
      setTimeout(() => {
        const fallback = getFallbackResponse(userMsg);
        setMessages((prev) => [...prev, { role: 'ai', text: fallback }]);
        setIsLoading(false);
      }, 1000);
      return;
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-[0_4px_20px_rgba(59,130,246,0.4)] transition-all hover:scale-105 hover:bg-blue-600 focus:outline-none cursor-pointer"
          title="AI PC Builder Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="flex h-[500px] w-[320px] flex-col rounded-2xl bg-[#1E293B] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 sm:w-[380px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3.5 text-white">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <div>
                <span className="font-semibold text-sm block">Forge Assistant</span>
                <span className="text-[10px] text-blue-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span> Online Build Expert
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0F172A] no-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-[#1E293B] text-slate-200 border border-white/5 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex space-x-1.5 rounded-2xl bg-[#1E293B] border border-white/5 px-4 py-3 shadow-sm rounded-tl-none items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-450 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="flex border-t border-white/5 p-3 bg-[#1E293B]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sockets, wattage, RTX 4090..."
              className="flex-1 bg-[#0F172A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="ml-2 flex items-center justify-center rounded-xl bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50 transition-opacity cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
