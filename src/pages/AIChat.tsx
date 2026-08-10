import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Settings, AlertCircle, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: 'Hello! I am your AI assistant. How can I help you with your education or general inquiries today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('rp_gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowSettings(true);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('rp_gemini_api_key', key);
    setShowSettings(false);
  };

  const generateAIResponse = async (userMessage: string) => {
    if (!apiKey) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: 'Please configure your Gemini API Key in the settings first.' }]);
      setShowSettings(true);
      return;
    }

    try {
      // Build the prompt history for Gemini
      const contents = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      // Add the new user message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch response');
      }

      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: aiText }]);
      
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: `Error: ${error.message}. Please check your API key.` }]);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);
    
    await generateAIResponse(userMessage);
    
    setIsLoading(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      
      <div className="flex items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-8 h-8 text-[var(--rp-primary)]" />
            AI Chat Assistant
          </h1>
          <p className="text-gray-600 text-sm">Powered by Gemini AI</p>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 glass-card p-6 rounded-2xl shrink-0 border border-blue-100 relative">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" /> API Configuration
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            To enable real AI responses, please provide a Google Gemini API Key. This key is stored securely in your browser's LocalStorage and is never sent to our servers.
          </p>
          <div className="flex gap-2">
            <input 
              type="password" 
              placeholder="Enter Gemini API Key..." 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)] font-mono text-sm"
            />
            <button 
              onClick={() => saveApiKey(apiKey)}
              className="px-6 py-2 bg-[var(--rp-primary)] text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
            >
              Save Key
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> You can get a free API key from Google AI Studio.
          </p>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col shadow-premium min-h-0">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-[var(--rp-primary)] text-white' : 'bg-gray-800 text-white'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className={`px-5 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-[var(--rp-primary)] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none'}`}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans">{msg.content}</p>
                </div>

              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 bg-gray-800 text-white">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  <span className="text-sm text-gray-500 font-medium">Generating response...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={apiKey ? "Ask anything (e.g. 'Explain quantum computing simply')..." : "Configure API key to start chatting..."}
              disabled={!apiKey || isLoading}
              className="w-full pl-6 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)] focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button 
              type="submit"
              disabled={!input.trim() || !apiKey || isLoading}
              className="absolute right-2 p-2.5 bg-[var(--rp-primary)] text-white rounded-full hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AIChat;
