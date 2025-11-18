import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToBahgat } from '../services/geminiService';
import { ChatMessage } from '../types';

const Home: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'منور يا ريس أنا أحمد بهجت AI.. جاهز نحول أي مشكلة لحل عبقري؟',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await sendMessageToBahgat(input);

    const botMsg: ChatMessage = {
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col bg-black relative overflow-hidden font-arabic">
      {/* Ambient Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col p-4 relative z-10">
        
        {/* Chat Header area */}
        <div className="text-center mb-6 mt-4">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full p-1 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
             <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                 {/* Placeholder for Ahmed Bahgat Avatar */}
                 <img src="https://picsum.photos/id/64/200/200" alt="Ahmed Bahgat AI" className="w-full h-full object-cover opacity-80" />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Ahmed Bahgat <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">AI</span></h1>
          <p className="text-gray-400 text-sm">مؤسس مصنع "حل" للحلول الذكية</p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-gray-900/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
          
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] px-5 py-3 rounded-2xl text-lg leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-br-none' 
                      : 'bg-gray-800 text-gray-100 rounded-bl-none border border-white/5'
                  }`}
                  dir="auto"
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-white/5 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-black/40">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اسألني عن أي فكرة في دماغك..."
                className="w-full bg-gray-800/50 text-white rounded-xl pl-4 pr-12 py-4 border border-white/10 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all placeholder-gray-500 text-right"
                dir="rtl"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute left-2 p-2 bg-cyan-600 rounded-lg text-white hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-colors"
              >
                <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-4 text-gray-500 text-xs">
          Bahgat AI © 2025 - Powered by "Hall" Factory
        </div>
      </div>
    </div>
  );
};

export default Home;
