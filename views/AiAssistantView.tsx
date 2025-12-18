
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Trash2, Sparkles, MessageSquare } from 'lucide-react';
import { askParentingAdvisor } from '../services/geminiService';
import { BabyProfile, ChatMessage, ThemeProps } from '../types';

interface AiAssistantViewProps extends ThemeProps {
  profile: BabyProfile;
}

const AiAssistantView: React.FC<AiAssistantViewProps> = ({ profile, themeColor }) => {
  const getInitialGreeting = (): ChatMessage => ({ 
      id: 'init', 
      role: 'model', 
      content: `Merhaba! Ben ${profile.name} için gelişim ve bakım konusunda yardımcı olmaya hazırım. Neyi merak ediyorsun?` 
  });

  const SUGGESTIONS = [
    "Uyku düzeni nasıl olmalı?",
    "Ek gıdaya ne zaman başlamalıyım?",
    "Aşı sonrası ateşi çıkarsa?",
    "Hangi oyunları oynayabiliriz?",
    "Diş çıkarma belirtileri neler?",
    "Gelişimi yaşıtlarına göre nasıl?"
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialGreeting()]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend
    };

    // Optimistically update UI
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputText('');
    setIsLoading(true);

    // Call service with full history
    const responseText = await askParentingAdvisor(updatedHistory, profile);

    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: responseText
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const handleClearChat = () => {
    setMessages([getInitialGreeting()]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in relative">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2">
            <Sparkles size={24} className={`text-${themeColor}-500`} />
            Akıllı Asistan
          </h2>
          <p className="text-xs text-slate-400">Gemini AI ile güçlendirilmiştir.</p>
        </div>
        <button 
          onClick={handleClearChat}
          className={`p-2 text-slate-300 hover:text-${themeColor}-500 hover:bg-${themeColor}-50 rounded-full transition-colors`}
          title="Sohbeti Temizle"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 no-scrollbar mb-4 bg-white/50 rounded-3xl p-4 border border-slate-100 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
              msg.role === 'user' ? `bg-${themeColor}-500 text-white` : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
              msg.role === 'user' 
                ? `bg-${themeColor}-500 text-white rounded-tr-none` 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3 animate-pulse">
             <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
               <Bot size={16} />
             </div>
             <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
             </div>
          </div>
        )}
        
        {/* Suggestion Chips (Show only if chat is fresh) */}
        {!isLoading && messages.length === 1 && (
           <div className="mt-6">
              <p className="text-xs font-bold text-slate-400 mb-3 ml-2 uppercase tracking-wider">Örnek Sorular</p>
              <div className="grid grid-cols-2 gap-2">
                 {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(suggestion)}
                      className={`text-left p-3 rounded-xl text-xs font-medium border border-slate-200 bg-white hover:border-${themeColor}-300 hover:text-${themeColor}-600 hover:shadow-sm transition-all flex items-start gap-2`}
                    >
                       <MessageSquare size={14} className={`mt-0.5 text-${themeColor}-400`} />
                       {suggestion}
                    </button>
                 ))}
              </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="relative group mt-auto">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`${profile.name} hakkında bir soru sor...`}
          className={`w-full pl-4 pr-12 py-3.5 bg-white rounded-2xl shadow-lg shadow-${themeColor}-100/50 border border-${themeColor}-100 focus:outline-none focus:ring-2 focus:ring-${themeColor}-200 text-slate-700 transition-all placeholder:text-slate-400`}
          disabled={isLoading}
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
          className={`absolute right-2 top-1/2 -translate-y-1/2 bg-${themeColor}-500 text-white p-2 rounded-xl disabled:bg-slate-200 disabled:cursor-not-allowed transition-all hover:bg-${themeColor}-600 active:scale-95 shadow-md`}
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
};

export default AiAssistantView;
