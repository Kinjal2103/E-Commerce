import React, { useState, useEffect, useRef } from 'react';

const generateSessionId = () => {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your AI Shopping Assistant. How can I help you find the perfect product today?' }
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
    scrollToBottom();
  }, [messages, isLoading]);

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
        setMessages((prev) => [
          ...prev,
          { role: 'ai', text: data.message || 'Sorry, I encountered an error. Please try again.' }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Network error. Please make sure the server is running and try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.39 48.39 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="flex h-[500px] w-[350px] flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 sm:w-[400px]">
          <div className="flex items-center justify-between rounded-t-2xl bg-indigo-600 px-4 py-3 text-white">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="font-semibold">Shopping Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-1 rounded-2xl bg-white border border-gray-100 px-4 py-3 shadow-sm rounded-bl-none">
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="flex border-t border-gray-100 p-3 bg-white rounded-b-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for recommendations..."
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="ml-2 flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
